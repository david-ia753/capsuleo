export const maxDuration = 300; 


import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { writeFile, mkdir, readFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Nettoie le texte pour éviter les caractères Unicode problématiques pour le JSON ou l'IA
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

/**
 * Extrait le texte d'un PDF en utilisant pdf2json (plus stable sur serveur que pdf-parse)
 */
async function extractTextFromFile(filepath: string, mimeType: string): Promise<string> {
  if (mimeType === "application/pdf") {
    return new Promise((resolve) => {
      const PDFParser = require("pdf2json");
      const pdfParser = new PDFParser(null, 1);

      pdfParser.on("pdfParser_dataError", (errData: any) => {
        console.error("Erreur pdf2json:", errData.parserError);
        resolve("Document illisible ou extraction échouée.");
      });

      pdfParser.on("pdfParser_dataReady", () => {
        const text = pdfParser.getRawTextContent();
        resolve(cleanUnicode(text));
      });

      pdfParser.loadPDF(filepath);
    });
  }
  return "Format non géré pour l'extraction automatique.";
}

/**
 * Utilise Gemini pour générer les données pédagogiques du module (Quiz uniquement)
 */
async function generateModuleInfo(text: string) {
  const limitedText = text.substring(0, 15000); 

  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "votre_cle_ici") {
    console.warn("Clé API Gemini non configurée.");
    return null;
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const prompt = `Tu es un expert en pédagogie. Analyse ce cours et génère un objet JSON strict.
Structure JSON attendue :
{
  "title": "Titre du module",
  "objective": "Objectif global",
  "shortDescription": "Description courte (100 car. max)",
  "thumbnailPrompt": "Une description textuelle de l'image pour la vignette (ex: 'Un cerveau bleu neon qui pulse')",
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
- Propose au moins 4 exercices au total, répartis entre les niveaux DEBUTANT et EXPERT.
- Le format doit être un JSON pur, sans texte avant ou après.

Texte du cours :
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
    console.error("Erreur Gemini:", error);
    return null;
  }
}

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "TRAINER")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    
    if (!file || typeof file === "string" || !file.name) {
      return NextResponse.json({ error: "Fichier manquant ou invalide" }, { status: 400 });
    }

    await mkdir(UPLOAD_DIR, { recursive: true });

    const originalName = file.name;
    const lowerName = originalName.toLowerCase();
    
    // Détection de la catégorie
    let category = "AUTRE";
    if (lowerName.endsWith("- text.pdf") || lowerName.endsWith("- texte.pdf") || lowerName.endsWith(".pdf")) {
      category = "COURS";
    } else if (lowerName.endsWith("- présentation.pdf") || lowerName.endsWith("- presentation.pdf")) {
      category = "PRESENTATION";
    } else if (lowerName.endsWith(".m4a") || lowerName.endsWith(".mp3") || lowerName.endsWith(".wav") || lowerName.includes("audio")) {
      category = "AUDIO";
    }

    const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
    const filepath = path.join(UPLOAD_DIR, filename);
    
    // Sauvegarde par STREAM robuste
    await new Promise(async (resolve, reject) => {
      const writeStream = require("fs").createWriteStream(filepath);
      const reader = file.stream().getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            writeStream.end();
            break;
          }
          if (value) writeStream.write(Buffer.from(value));
        }
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      } catch (err) {
        writeStream.destroy();
        reject(err);
      }
    });

    let extractedText = "";
    if (file.type === "application/pdf" || lowerName.endsWith(".pdf")) {
      extractedText = await extractTextFromFile(filepath, file.type || "application/pdf");
    } else if (category === "AUDIO" || file.type?.startsWith("audio")) {
      extractedText = `Fichier audio: ${originalName}`;
    }

    const uploadedFile = await prisma.uploadedFile.create({
      data: {
        filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        category: category as any,
        path: `/uploads/${filename}`,
        extractedText: extractedText.substring(0, 50000),
        isProcessed: false
      }
    });

    return NextResponse.json({ 
      success: true, 
      fileId: uploadedFile.id
    });

  } catch (error: any) {
    console.error("DÉTAIL ERREUR UPLOAD UNAIRE:", error);
    
    // Fail-safe logger pour Antigravity
    try {
      const errorLog = `[${new Date().toISOString()}] ERREUR: ${error?.message || String(error)}\nSTACK: ${error?.stack}\n\n`;
      require("fs").appendFileSync(path.join(process.cwd(), "debug_error.log"), errorLog);
    } catch (e) {}

    return NextResponse.json({ 
      error: "Erreur lors de l'upload du fichier", 
      details: error?.message || String(error)
    }, { status: 500 });
  }
}
