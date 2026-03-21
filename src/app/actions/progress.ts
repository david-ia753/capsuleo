"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function toggleFileProgress(fileId: string, isCompleted: boolean) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Non autorisé" };
  }

  const userId = session.user.id;

  try {
    await prisma.fileProgress.upsert({
      where: {
        userId_fileId: {
          userId,
          fileId
        }
      },
      update: {
        isCompleted
      },
      create: {
        userId,
        fileId,
        isCompleted
      }
    });

    revalidatePath("/(stagiaire)/catalogue/[id]", "page");
    revalidatePath("/admin/dashboard");
    revalidatePath("/dashboard");
    
    return { success: true };
  } catch (error) {
    console.error("Error toggling file progress:", error);
    return { error: "Erreur lors de la mise à jour de la progression." };
  }
}

/**
 * Calcule la progression (0-100) d'un étudiant pour un module donné
 */
export async function getStudentModuleProgression(userId: string, moduleId: string) {
  try {
    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        _count: { select: { files: true } },
        files: {
          select: {
            id: true,
            progress: { where: { userId } }
          }
        }
      }
    });

    if (!module) return 0;

    const totalFiles = module._count.files || 0;
    if (totalFiles === 0) return 0;

    const completedFiles = module.files.filter((f: any) => f.progress?.[0]?.isCompleted).length;

    return Math.round((completedFiles / totalFiles) * 100);
  } catch (error) {
    return 0;
  }
}

/**
 * Calcule la progression moyenne d'un étudiant sur l'ensemble des modules d'un groupe (ou globalement)
 */
export async function getStudentGlobalProgression(userId: string, groupId?: string) {
  try {
    const whereClause = groupId 
      ? { groupModules: { some: { groupId } } } 
      : { groupModules: { some: {} } }; 
      
    const modules = await prisma.module.findMany({
      where: whereClause,
      select: { id: true }
    });

    if (modules.length === 0) return 0;

    let totalSum = 0;
    for (const m of modules) {
      totalSum += await getStudentModuleProgression(userId, m.id);
    }

    return Math.round(totalSum / modules.length);
  } catch (error) {
    return 0;
  }
}
