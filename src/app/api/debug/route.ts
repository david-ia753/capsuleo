import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import fs from "fs";
import path from "path";
import { getStorageDir, getStorageDiagnostics } from "@/lib/storage";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "TRAINER")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  }

  const UPLOAD_DIR = await getStorageDir();
  const results: any = {};
  results.storage = getStorageDiagnostics();

  // 1. Log d'upload (EACCES etc)
  try {
    const logPath = path.join(UPLOAD_DIR, "upload_errors.log");
    if (fs.existsSync(logPath)) {
      const content = fs.readFileSync(logPath, "utf8");
      results.upload_errors = content.split("\n").slice(-50).join("\n");
    } else {
      results.upload_errors = "Fichier non trouvé (pas d'erreurs logguées)";
    }
  } catch (e: any) {
    results.upload_errors = `Erreur lecture: ${e.message}`;
  }

  // 2. Log de debug général
  try {
    const debugPath = process.env.NODE_ENV === "production" ? "/app/api_debug.log" : "api_debug.log";
    if (fs.existsSync(debugPath)) {
      const content = fs.readFileSync(debugPath, "utf8");
      results.api_debug = content.split("\n").slice(-100).join("\n");
    } else {
      results.api_debug = "Fichier non trouvé";
    }
  } catch (e: any) {
    results.api_debug = `Erreur lecture: ${e.message}`;
  }

  // 3. Liste des modèles Gemini (pour diag 404)
  if (process.env.GEMINI_API_KEY) {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
      if (resp.ok) {
        const data = await resp.json();
        results.available_models = data.models?.map((m: any) => m.name) || "Aucun modèle trouvé";
      } else {
        results.available_models = `Erreur API: ${resp.status} - ${await resp.text()}`;
      }
    } catch (e: any) {
      results.available_models = `Erreur fetch: ${e.message}`;
    }
  }

  // 4. Info environnement
  results.env = {
    NODE_ENV: process.env.NODE_ENV,
    CWD: process.cwd(),
    UPLOAD_DIR,
    API_KEY_LAST_4: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.slice(-4) : "NONE"
  };

  return NextResponse.json(results);
}
