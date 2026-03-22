import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Type Promise pour Next.js 15
) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "TRAINER")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "ID manquant" }, { status: 400 });
  }

  console.log("Tentative de suppression du module ID:", id);

  try {
    // 1. Trouver tous les fichiers associés pour suppression physique
    const files = await prisma.uploadedFile.findMany({
      where: { moduleId: id },
      select: { path: true }
    });

    // 2. Suppression physique des fichiers
    for (const file of files) {
      try {
        const fullPath = path.join(process.cwd(), "public", file.path);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      } catch (err) {
        console.error(`Erreur suppression fichier physique: ${file.path}`, err);
      }
    }

    // 3. Suppression des enregistrements UploadedFile (avant le module pour sécurité)
    await prisma.uploadedFile.deleteMany({
      where: { moduleId: id }
    });

    // 4. Suppression du Module (la cascade Prisma gère fiches/exercices)
    await prisma.module.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Erreur Suppression Module:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
