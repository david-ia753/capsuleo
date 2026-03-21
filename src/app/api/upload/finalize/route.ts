import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 300; 

async function generateModuleInfo(text: string) {
  const limitedText = text.substring(0, 30000).trim(); 

  if (!process.env.GEMINI_API_KEY) {
    console.warn("Clé API Gemini non configurée.");
    return null;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const modelsToTry = ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-2.0-flash-lite"];
  const prompt = `Génère un objet JSON pédagogique à partir de ce texte :
{
  "title": "Titre du module",
  "objective": "Objectif global",
  "shortDescription": "Description (100 car. max)",
  "thumbnailPrompt": "Vignette style néon",
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

  // Tentative via le SDK avec repli (fallback)
  for (const modelName of modelsToTry) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      let cleanJson = responseText.trim();
      if (cleanJson.includes("```json")) {
        cleanJson = cleanJson.split("```json")[1].split("```")[0];
      }
      
      return JSON.parse(cleanJson.trim());
    } catch (e: any) {
      if (!e.message.includes("404")) {
         require("fs").appendFileSync("api_debug.log", `[SDK ERROR] ${modelName}: ${e.message}\n`);
      }
    }
  }

  // ULTIME RECOURS : APPEL REST DIRECT (v1 endpoint)
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (response.ok) {
      const data: any = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        let cleanJson = text.trim();
        if (cleanJson.includes("```json")) {
          cleanJson = cleanJson.split("```json")[1].split("```")[0];
        }
        return JSON.parse(cleanJson.trim());
      }
    }
  } catch (error: any) {}

  return null;
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "TRAINER")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  }

  try {
    const { fileIds } = await request.json();

    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return NextResponse.json({ error: "Aucun fichier à synthétiser" }, { status: 400 });
    }

    const uploadedFiles = await prisma.uploadedFile.findMany({
      where: { id: { in: fileIds } },
    });

    let combinedText = "";
    let defaultTitle = "Nouveau Module";

    for (const fileRecord of uploadedFiles) {
      const file = fileRecord as any;
      if (!defaultTitle || defaultTitle === "Nouveau Module") {
        defaultTitle = file.originalName.replace(/\.[^/.]+$/, "");
      }

      // TENTATIVE DE RÉ-EXTRACTION SI VIDE
      let textToUse = file.extractedText || "";
      if (textToUse.length < 10 && file.path && file.category !== 'AUDIO') {
        try {
          const fs = require("fs");
          const path = require("path");
          const fullPath = path.join(process.cwd(), "public", file.path);
          
          if (fs.existsSync(fullPath)) {
            // Lecture brute pour voir si c'est du texte
            const content = fs.readFileSync(fullPath).toString('utf-8');
            if (content.length > 100) {
              textToUse = content.substring(0, 10000); // On récupère ce qu'on peut
            }
          }
        } catch (err) {}
      }

      if (textToUse.length > 5) {
        combinedText += `\n\n--- Fichier: ${file.originalName} ---\n\n${textToUse}`;
      }
    }

    // Diagnostique
    require("fs").appendFileSync("api_debug.log", `[FINALIZE V1] Files: ${uploadedFiles.length}, Text length: ${combinedText.length}\n`);

    const aiData = await generateModuleInfo(combinedText);

    return NextResponse.json({
      success: true,
      aiData: aiData || {
        title: defaultTitle,
        objective: "Synthèse IA non disponible. Veuillez compléter manuellement.",
        shortDescription: "",
        thumbnailPrompt: defaultTitle,
        exercises: []
      }
    });

  } catch (error: any) {
    console.error("ERREUR FINALIZE:", error);
    return NextResponse.json({ error: "Échec de la synthèse globale" }, { status: 500 });
  }
}
