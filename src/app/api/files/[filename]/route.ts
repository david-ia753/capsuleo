import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { readFile } from "fs/promises";
import path from "path";
import fs from "fs";

// Le même dossier que dans l'API d'upload
const UPLOAD_DIR = process.env.NODE_ENV === "production" 
  ? "/app/storage/uploads" 
  : path.join(process.cwd(), "storage", "uploads");

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const session = await auth();
  if (!session) {
    return new NextResponse("Non autorisé", { status: 401 });
  }

  const { filename } = await params;
  const filePath = path.join(UPLOAD_DIR, filename);

  // Sécurité: vérifier que le chemin reste dans UPLOAD_DIR
  if (!filePath.startsWith(UPLOAD_DIR)) {
     return new NextResponse("Accès refusé", { status: 403 });
  }

  try {
    if (!fs.existsSync(filePath)) {
      return new NextResponse("Fichier non trouvé", { status: 404 });
    }

    const fileBuffer = await readFile(filePath);
    
    // Déterminer le type MIME (basique)
    let contentType = "application/octet-stream";
    if (filename.endsWith(".pdf")) contentType = "application/pdf";
    else if (filename.endsWith(".mp3")) contentType = "audio/mpeg";
    else if (filename.endsWith(".m4a")) contentType = "audio/x-m4a";
    else if (filename.endsWith(".wav")) contentType = "audio/wav";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    return new NextResponse("Erreur lors de la lecture du fichier", { status: 500 });
  }
}
