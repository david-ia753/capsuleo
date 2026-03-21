"use server";
// Version: 1.0.1 - Force recompile

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { getStudentGlobalProgression } from "./progress";

/**
 * Créer un nouveau groupe de formation
 */
export async function createGroup(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const trainerId = formData.get("trainerId") as string;

  if (!name) return { error: "Le nom du groupe est requis." };

  try {
    const group = await prisma.group.create({
      data: { 
        name, 
        description,
        trainerId: trainerId || null
      }
    });
    revalidatePath("/admin/groups");
    revalidatePath("/admin/stagiaires");
    return { success: true, group };
  } catch (error) {
    return { error: "Erreur lors de la création du groupe (le nom est peut-être déjà pris)." };
  }
}

/**
 * Assigner des modules à un groupe (Via GroupModule)
 */
export async function assignModulesToGroup(groupId: string, moduleIds: string[]) {
  try {
    // 1. Supprimer les anciennes relations
    await prisma.groupModule.deleteMany({
      where: { groupId }
    });

    // 2. Créer les nouvelles relations avec un ordre par défaut (0)
    if (moduleIds.length > 0) {
      await prisma.groupModule.createMany({
        data: moduleIds.map((moduleId, index) => ({
          groupId,
          moduleId,
          order: index
        }))
      });
    }

    revalidatePath("/admin/stagiaires");
    revalidatePath("/admin/dashboard");
    revalidatePath("/catalogue");
    
    return { success: true };
  } catch (error) {
    console.error("assignModulesToGroup error:", error);
    return { error: "Erreur lors de l'assignation des modules." };
  }
}

/**
 * Réorganiser les modules au sein d'un groupe
 */
export async function reorderGroupModules(groupId: string, moduleIds: string[]) {
  try {
    // On met à jour l'ordre de chaque module pour ce groupe spécifiquement
    const updates = moduleIds.map((id, index) => 
      prisma.groupModule.update({
        where: {
          groupId_moduleId: {
            groupId,
            moduleId: id
          }
        },
        data: { order: index }
      })
    );

    await prisma.$transaction(updates);
    revalidatePath("/admin/stagiaires");
    revalidatePath("/admin/modules");
    return { success: true };
  } catch (error) {
    console.error("reorderGroupModules error:", error);
    return { error: "Erreur lors de la réorganisation." };
  }
}

/**
 * Récupérer les ids des modules déjà assignés à un groupe (Via GroupModule)
 */
export async function getGroupModuleIds(groupId: string) {
    try {
        const modules = await prisma.groupModule.findMany({
            where: { groupId },
            select: { moduleId: true }
        });
        return modules.map((m: any) => m.moduleId);
    } catch (error) {
        console.error("Erreur getGroupModuleIds:", error);
        return [];
    }
}
/**
 * Assigner un formateur à un groupe
 */
export async function assignTrainerToGroup(groupId: string, trainerId: string | null) {
  try {
    await prisma.group.update({
      where: { id: groupId },
      data: { trainerId }
    });
    revalidatePath("/admin/stagiaires");
    return { success: true };
  } catch (error) {
    console.error("Erreur assignTrainerToGroup:", error);
    return { error: "Erreur lors de l'assignation du formateur au groupe." };
  }
}
/**
 * Récupérer les groupes disponibles pour l'inscription
 */
export async function getAvailableGroups() {
  try {
    return await prisma.group.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" }
    });
  } catch (error) {
    console.error("Erreur getAvailableGroups:", error);
    return [];
  }
}
