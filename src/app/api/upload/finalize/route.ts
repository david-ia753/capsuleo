import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import path from "path";
import fs from "fs";
import { getStorageDir } from "@/lib/storage";

export const maxDuration = 300; 

async function generateModuleInfo(text: string) {
  const limitedText = text.substring(0, 30000).trim(); 
  const debugPath = process.env.NODE_ENV === "production" ? "/app/api_debug.log" : "api_debug.log";

  if (!process.env.GEMINI_API_KEY) {
    try { fs.appendFileSync(debugPath, "[SDK ERROR] Clé API Gemini manquante\n"); } catch(e){}
    return null;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const modelsToTry = [
    "gemini-2.0-flash", 
    "gemini-2.0-flash-lite", 
    "gemini-2.5-flash", // Listed as available in user's debug output
    "gemini-1.5-flash"  // Keep as fallback just in case
  ];
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
      try {
        fs.appendFileSync(debugPath, `[SDK ERROR] ${modelName}: ${e.message}\n`);
      } catch (logErr) {}
    }
  }

  // Fallback REST
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
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
    } else {
      const errTxt = await response.text();
      try { fs.appendFileSync(debugPath, `[REST ERROR]: ${response.status} - ${errTxt.substring(0, 200)}\n`); } catch(e){}
    }
  } catch (error: any) {}

  return null;
}

/**
 * Nettoie le texte pour éviter les caractères Unicode problématiques
 */
function cleanUnicode(str: string): string {
  if (!str) return "";
  return str
    .replace(/[^\p{L}\p{N}\p{P}\p{Z}\n\r]/gu, "")
    .replace(/\u0000/g, "")
    .replace(/[\r\n]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "TRAINER")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  }

  const debugPath = process.env.NODE_ENV === "production" ? "/app/api_debug.log" : "api_debug.log";

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
    let extractionLogs = "";

    for (const fileRecord of uploadedFiles) {
      const file = fileRecord as any;
      if (!defaultTitle || defaultTitle === "Nouveau Module") {
        defaultTitle = file.originalName.replace(/\.[^/.]+$/, "");
      }

      let textToUse = file.extractedText || "";
      if (textToUse.length < 10 && file.path && file.category !== 'AUDIO' && file.originalName.toLowerCase().endsWith(".pdf")) {
        try {
          const filename = file.path.split("/").pop();
          const UPLOAD_DIR = await getStorageDir();
          const fullPath = path.join(UPLOAD_DIR, filename || "");
          
          if (fs.existsSync(fullPath)) {
            const PDFParser = require("pdf2json");
            const pdfParser = new PDFParser(null, 1);
            
            textToUse = await new Promise((resolve) => {
              pdfParser.on("pdfParser_dataError", (err: any) => {
                extractionLogs += `[ERR PDF ${file.id}] ${JSON.stringify(err)}\n`;
                resolve("");
              });
              pdfParser.on("pdfParser_dataReady", () => {
                const rawText = pdfParser.getRawTextContent();
                resolve(cleanUnicode(rawText));
              });
              pdfParser.loadPDF(fullPath);
            });
            extractionLogs += `[OK PDF ${file.id}] extracted ${textToUse.length} chars\n`;
          } else {
            extractionLogs += `[ERR PDF ${file.id}] file not found at ${fullPath}\n`;
          }
        } catch (err: any) {
          extractionLogs += `[CRASH PDF ${file.id}] ${err.message}\n`;
        }
      }

      if (textToUse.length > 5) {
        combinedText += textToUse;
      }
    }

    // Diagnostique
    try {
      fs.appendFileSync(debugPath, `\n--- NEW FINALIZE SESSION ---\n${extractionLogs}[FINALIZE] Files: ${uploadedFiles.length}, Total Text: ${combinedText.length}\n`);
    } catch (e) {}

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
