import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateVignette } from "@/lib/vignette";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "TRAINER")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filter = searchParams.get("filter");
  const isTrainer = session.user.role === "TRAINER";
  const userId = session.user.id;

  try {
    const where: any = {};
    if (filter === "mine") {
      where.creatorId = userId;
    }
    const modules = await prisma.module.findMany({
      where,
      orderBy: [
        { createdAt: 'desc' }
      ],
      include: {
        _count: {
          select: {
            files: true,
            exercises: true,
            fiches: true
          }
        },
        groupModules: {
          include: {
            group: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        files: {
          select: {
            mimeType: true,
            originalName: true
          }
        },
        creator: {
          select: {
            name: true
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

    // Vérification de sécurité pour creatorId
    const currentUserId = session.user.id;
    let finalCreatorId = currentUserId;
    
    // 1. Création du Module final avec relation explicite GroupModule
    const module = await prisma.module.create({
      data: {
        title,
        objective,
        description,
        shortDescription,
        thumbnailUrl: finalThumbnailUrl,
        creatorId: finalCreatorId,
        groupModules: {
          create: {
            group: { connect: { id: finalGroupId } },
            order: 0
          }
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

  } catch (error: any) {
    const fs = require("fs");
    fs.appendFileSync("api_debug.log", `[CREATE ERROR] ${error?.message || error}\n${error?.stack || ""}\n`);
    console.error("DEBUG MODULE CREATE ERROR:", error?.message || error);
    if (error?.code) {
      console.error("PRISMA ERROR CODE:", error.code);
    }
    console.dir(error, { depth: null });
    return NextResponse.json({ error: "Erreur serveur", details: error?.message }, { status: 500 });
  }
}

/**
 * Mise à jour de l'ordre des modules (Réorganisation)
 */
export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "TRAINER")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  }

  try {
    const { orders, groupId } = await request.json(); // Array of { id: string, order: number }, optional groupId

    if (!orders || !Array.isArray(orders)) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    if (groupId) {
      // Mise à jour de l'ordre par groupe
      await prisma.$transaction(
        orders.map((item: { id: string, order: number }) => 
          prisma.groupModule.update({
            where: {
              groupId_moduleId: {
                groupId,
                moduleId: item.id
              }
            },
            data: { order: item.order }
          })
        )
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering modules:", error);
    return NextResponse.json({ error: "Erreur lors de la réorganisation" }, { status: 500 });
  }
}
