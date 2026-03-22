import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import fs from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "TRAINER")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  }

  const UPLOAD_DIR = process.env.NODE_ENV === "production" 
    ? "/app/storage/uploads" 
    : path.join(process.cwd(), "storage", "uploads");

  const results: any = {};

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

  // 3. Info environnement
  results.env = {
    NODE_ENV: process.env.NODE_ENV,
    USER: process.env.USER || "unknown",
    CWD: process.cwd(),
    UPLOAD_DIR
  };

  return NextResponse.json(results);
}
