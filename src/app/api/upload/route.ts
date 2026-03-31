export const maxDuration = 300; 


import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { writeFile, mkdir, readFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getStorageDir } from "@/lib/storage";


// Les fonctions d'extraction et de nettoyage ont été déplacées vers le service de finalisation
// pour optimiser la mémoire lors de l'upload initial.

/**
 * Utilise Gemini pour générer les données pédagogiques du module (Quiz uniquement)
 */
async function generateModuleInfo(text: string) {
  const limitedText = text.substring(0, 15000).trim(); 

  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "votre_cle_ici") {
    console.warn("Clé API Gemini non configurée.");
    return null;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-flash-8b", "gemini-2.0-flash-lite-preview-02-05"];
  const prompt = `Analyse ce cours et génère un objet JSON strict.
{
  "title": "Titre du module",
  "objective": "Objectif global",
  "shortDescription": "Description (100 car. max)",
  "thumbnailPrompt": "Une description visuelle pour DALL-E",
  "exercises": [
    {
      "type": "TEXTE_A_TROUS",
      "question": "Texte avec [TROU]",
      "answer": "réponse",
      "level": "DEBUTANT"
    }
  ]
}

Texte :
${limitedText || "Analyse ce module général."}`;

  for (const modelName of modelsToTry) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      let cleanJson = responseText.trim();
      if (cleanJson.includes("```json")) {
        cleanJson = cleanJson.split("```json")[1].split("```")[0];
      } else if (cleanJson.includes("```")) {
        cleanJson = cleanJson.split("```")[1].split("```")[0];
      }
      
      return JSON.parse(cleanJson.trim());
    } catch (e: any) {
      console.error(`Erreur Gemini (${modelName}):`, e.message);
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  const UPLOAD_DIR = await getStorageDir();
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "TRAINER")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  }

  let originalName = "Inconnu";
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    
    if (!file || typeof file === "string" || !file.name) {
      return NextResponse.json({ error: "Fichier manquant ou invalide" }, { status: 400 });
    }

    originalName = file.name;
    const lowerName = originalName.toLowerCase();

    await mkdir(UPLOAD_DIR, { recursive: true });
    
    // Détection de la catégorie
    let category = "AUTRE";
    if (lowerName.endsWith("- text.pdf") || lowerName.endsWith("- texte.pdf") || lowerName.endsWith(".pdf")) {
      category = "COURS";
    } else if (lowerName.endsWith("- présentation.pdf") || lowerName.endsWith("- presentation.pdf")) {
      category = "PRESENTATION";
    } else if (lowerName.endsWith(".m4a") || lowerName.endsWith(".mp3") || lowerName.endsWith(".wav") || lowerName.includes("audio")) {
      category = "AUDIO";
    }

    const filename = `${Date.now()}_${originalName.normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9.]/g, "_")}`;
    const filepath = path.join(UPLOAD_DIR, filename);
    
    // Sauvegarde robuste via writeFile
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filepath, buffer);
    } catch (writeErr: any) {
      console.error("ERREUR ECRITURE DISQUE:", writeErr);
      throw new Error(`Erreur écriture disque: ${writeErr.message}`);
    }

    // OPTIMISATION : On ne fait plus l'extraction lourde ici pour éviter les erreurs 500 (OOM)
    let extractedText = "";
    if (category === "AUDIO" || file.type?.startsWith("audio")) {
      extractedText = `Fichier audio: ${originalName}`;
    }

    const uploadedFile = await prisma.uploadedFile.create({
      data: {
        filename,
        originalName,
        mimeType: file.type,
        size: file.size,
        category: category as any,
        path: `/api/files/${filename}`,
        extractedText: extractedText.substring(0, 50000),
        isProcessed: false
      }
    });

    return NextResponse.json({ 
      success: true, 
      fileId: uploadedFile.id
    });

  } catch (error: any) {
    console.error("DÉTAIL ERREUR UPLOAD:", error);
    
    try {
      const logPath = path.join(UPLOAD_DIR, "upload_errors.log");
      const errorLog = `[${new Date().toISOString()}] Erreur sur ${originalName}: ${error?.message}\nSTACK: ${error?.stack}\n\n`;
      require("fs").appendFileSync(logPath, errorLog);
    } catch (e) {}

    return NextResponse.json({ 
      error: "Erreur lors de l'upload", 
      details: error?.message || String(error),
      stack: process.env.NODE_ENV === "production" ? error?.stack : undefined
    }, { status: 500 });
  }
}
