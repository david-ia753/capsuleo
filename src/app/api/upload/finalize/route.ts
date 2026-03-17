import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 300; 

async function generateModuleInfo(text: string) {
  const limitedText = text.substring(0, 30000); 

  if (!process.env.GEMINI_API_KEY) {
    console.warn("Clé API Gemini non configurée.");
    return null;
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const prompt = `Tu es un expert en pédagogie. Analyse ce cours (issu de plusieurs documents) et génère un objet JSON strict.
Structure JSON attendue :
{
  "title": "Titre du module global",
  "objective": "Objectif pédagogique global englobant tous les fichiers",
  "shortDescription": "Description courte (100 car. max)",
  "thumbnailPrompt": "Une description textuelle pour la vignette",
  "exercises": [
    {
      "type": "TEXTE_A_TROUS",
      "question": "Texte avec des [TROU] à remplir",
      "answer": "mot1, mot2",
      "level": "DEBUTANT"
    }
  ]
}

Règles : 
- Ne génère QUE des quiz de type TEXTE_A_TROUS ou MOTS_A_CASER.
- Propose au moins 5 exercices au total.
- Le format doit être un JSON pur.

Texte complet des documents :
${limitedText}`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    let cleanJson = responseText.trim();
    if (cleanJson.includes("```json")) {
      cleanJson = cleanJson.split("```json")[1].split("```")[0];
    } else if (cleanJson.includes("```")) {
      cleanJson = cleanJson.split("```")[1].split("```")[0];
    }
    
    return JSON.parse(cleanJson.trim());
  } catch (error) {
    console.error("Erreur Gemini Finalize:", error);
    return null;
  }
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

    uploadedFiles.forEach((file, index) => {
      if (index === 0) {
        defaultTitle = file.originalName.replace(/\.[^/.]+$/, "");
      }
      if (file.extractedText && file.extractedText.length > 10) {
        combinedText += `\n\n--- Fichier: ${file.originalName} ---\n\n${file.extractedText}`;
      }
    });

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
