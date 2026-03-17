import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateVignette } from "@/lib/vignette";

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "TRAINER")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  }

  const isTrainer = session.user.role === "TRAINER";
  const userId = session.user.id;

  try {
    const modules = await prisma.module.findMany({
      where: isTrainer ? { creatorId: userId } : {},
      orderBy: {
        createdAt: "desc"
      },
      include: {
        _count: {
          select: {
            files: true,
            exercises: true,
            fiches: true
          }
        },
        groups: {
          select: {
            id: true,
            name: true
          }
        },
        files: {
          select: {
            mimeType: true,
            originalName: true
          }
        }
      }
    });

    return NextResponse.json(modules);
  } catch (error) {
    console.error("Erreur Fetch Modules:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "TRAINER")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { 
      fileIds, 
      groupId, 
      title, 
      objective, 
      description, 
      shortDescription,
      thumbnailUrl,
      exercises 
    } = data;

    let finalGroupId = groupId;
    if (!finalGroupId) {
      // Si pas de groupe fourni, on cherche ou on cree le groupe "General"
      const defaultGroup = await prisma.group.findFirst({
        where: { name: "Général" }
      });
      if (defaultGroup) {
        finalGroupId = defaultGroup.id;
      } else {
        const newGroup = await prisma.group.create({
          data: { name: "Général", description: "Groupe par défaut" }
        });
        finalGroupId = newGroup.id;
      }
    }

    if (!title) {
      return NextResponse.json({ error: "Titre manquant" }, { status: 400 });
    }

    // Génération automatique de la vignette si non fournie
    const finalThumbnailUrl = thumbnailUrl || generateVignette(title);

    // 1. Création du Module final
    const module = await prisma.module.create({
      data: {
        title,
        objective,
        description,
        shortDescription,
        thumbnailUrl: finalThumbnailUrl,
        creatorId: session.user.id,
        groups: {
          connect: { id: finalGroupId }
        },
        exercises: {
          create: (exercises || []).map((ex: any, index: number) => ({
            type: ex.type || "TEXTE_A_TROUS",
            question: ex.question || "",
            options: ex.options ? JSON.stringify(ex.options) : null,
            answer: String(ex.answer || ""),
            level: ex.level === "EXPERT" ? 2 : 1,
            order: index
          }))
        }
      }
    });

    // 2. Rattachement des fichiers
    if (fileIds && Array.isArray(fileIds) && fileIds.length > 0) {
      await prisma.uploadedFile.updateMany({
        where: { id: { in: fileIds } },
        data: { 
          moduleId: module.id,
          isProcessed: true
        }
      });
    }

    return NextResponse.json({ success: true, moduleId: module.id });

  } catch (error) {
    console.error("Erreur Finalisation Module:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
