"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

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
 * Récupérer toutes les données pour la gestion des stagiaires (filtré par trainerId si fourni)
 */
export async function getAdminStagiairesData(trainerId?: string) {
  try {
    const whereClause = trainerId ? { trainerId } : {};

    // 1. On récupère les groupes et les utilisateurs
    const groupsRaw = await prisma.group.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { users: true }
        },
        users: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // 2. Pour chaque groupe, on compte les modules manuellement via la table de liaison
    const groups = await Promise.all(groupsRaw.map(async (group) => {
      const moduleCount = await prisma.module.count({
        where: {
          groups: {
            some: { id: group.id }
          }
        }
      });

      return {
        ...group,
        _count: {
          users: group._count.users,
          modules: moduleCount
        }
      };
    }));

    const independentStudents = await prisma.user.findMany({
      where: { 
        role: "STUDENT",
        groupId: null,
        ...(trainerId ? { trainerId } : {})
      },
      orderBy: { name: "asc" }
    });

    // Si on est en mode Trainer, on ne propose que SES modules dans la bibliothèque de groupe
    const allModules = await prisma.module.findMany({
      where: trainerId ? { creatorId: trainerId } : {},
      select: { id: true, title: true },
      orderBy: { title: "asc" }
    });

    return { groups, independentStudents, allModules };
  } catch (error) {
    console.error("Erreur fetching stagiaires data:", error);
    return { groups: [], independentStudents: [], allModules: [] };
  }
}

/**
 * Récupérer la liste globale de tous les stagiaires (Admin)
 */
export async function getGlobalStudentsData() {
  try {
    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      include: {
        group: { select: { id: true, name: true } },
        trainer: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: "desc" }
    });
    return students;
  } catch (error) {
    console.error("Erreur fetching global students data:", error);
    return [];
  }
}

/**
 * Assigner des modules à un groupe (Library Style)
 */
export async function assignModulesToGroup(groupId: string, moduleIds: string[]) {
  try {
    // On met à jour les relations du groupe
    const result = await prisma.group.update({
      where: { id: groupId },
      data: {
        modules: {
          set: moduleIds.map(id => ({ id }))
        }
      }
    });

    // On force la revalidation de plusieurs chemins pour être sûr
    revalidatePath("/admin/stagiaires");
    revalidatePath("/admin/dashboard");
    revalidatePath("/catalogue");
    
    return { success: true };
  } catch (error) {
    return { error: "Erreur lors de l'assignation des modules." };
  }
}

/**
 * Assigner un stagiaire à un groupe
 */
export async function updateStudentGroup(studentId: string, groupId: string | null) {
  try {
    await prisma.user.update({
      where: { id: studentId },
      data: { groupId }
    });
    revalidatePath("/admin/stagiaires");
    return { success: true };
  } catch (error) {
    return { error: "Erreur lors de la mise à jour du groupe de l'élève." };
  }
}

/**
 * Récupérer les ids des modules déjà assignés à un groupe
 */
export async function getGroupModuleIds(groupId: string) {
    try {
        const modules = await prisma.module.findMany({
            where: {
                groups: {
                    some: { id: groupId }
                }
            },
            select: { id: true }
        });
        return modules.map(m => m.id);
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
 * Assigner un formateur référent à un stagiaire
 */
export async function updateStudentTrainer(studentId: string, trainerId: string | null) {
  try {
    await prisma.user.update({
      where: { id: studentId },
      data: { trainerId }
    });
    revalidatePath("/admin/stagiaires");
    return { success: true };
  } catch (error) {
    console.error("Erreur updateStudentTrainer:", error);
    return { error: "Erreur lors de l'assignation du formateur référent." };
  }
}

/**
 * Création ou ajout rapide d'un stagiaire à un groupe
 */
export async function quickAddStudent(groupId: string, name: string, email: string, trainerId?: string) {
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { 
          groupId, 
          role: "STUDENT",
          ...(trainerId ? { trainerId } : {})
        }
      });
    } else {
      const tempPassword = await bcrypt.hash("Passe123!", 10);
      await prisma.user.create({
        data: {
          name,
          email,
          password: tempPassword,
          role: "STUDENT",
          groupId,
          trainerId: trainerId || null
        }
      });
    }
    revalidatePath("/admin/groups");
    revalidatePath("/admin/stagiaires");
    return { success: true };
  } catch (error) {
    console.error("quickAddStudent error:", error);
    return { error: "Erreur lors de l'ajout du stagiaire." };
  }
}
