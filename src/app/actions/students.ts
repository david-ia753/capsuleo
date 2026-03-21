"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { getStudentGlobalProgression } from "./progress";
import { auth } from "@/auth";

/**
 * Récupérer la liste globale des stagiaires pour l'administration
 */
export async function getGlobalStudentsData() {
  try {
    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      include: {
        group: {
          select: { id: true, name: true }
        },
        trainer: {
          select: { id: true, name: true }
        }
      },
      orderBy: { name: "asc" }
    });

    const studentsWithProgress = await Promise.all(students.map(async (s: any) => {
      const progress = await getStudentGlobalProgression(s.id, s.groupId);
      return { ...s, averageProgress: progress };
    }));

    return studentsWithProgress;
  } catch (error) {
    console.error("Erreur getGlobalStudentsData:", error);
    return [];
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

    // 2. Pour chaque groupe, on charge ses modules via la table de jointure GroupModule
    const groups = await Promise.all(groupsRaw.map(async (group: any) => {
      const groupModules = await prisma.groupModule.findMany({
        where: { groupId: group.id },
        include: {
          module: {
            select: { id: true, title: true }
          }
        },
        orderBy: { order: "asc" }
      });

      // Calcul de la progression moyenne du groupe
      const studentsWithProgress = await Promise.all(group.users.map(async (u: any) => {
        const progress = await getStudentGlobalProgression(u.id, group.id);
        return { ...u, averageProgress: progress };
      }));

      const groupAvgProgress = studentsWithProgress.length > 0
        ? Math.round(studentsWithProgress.reduce((acc: number, s: any) => acc + s.averageProgress, 0) / studentsWithProgress.length)
        : 0;

      return {
        ...group,
        users: studentsWithProgress,
        averageProgress: groupAvgProgress,
        assignedModules: groupModules.map((gm: any) => ({ ...gm.module, order: gm.order })),
        _count: {
          users: group._count.users,
          modules: groupModules.length
        }
      };
    }));

    const independentStudentsRaw = await prisma.user.findMany({
      where: { 
        role: "STUDENT",
        groupId: null,
        ...(trainerId ? { trainerId } : {})
      },
      orderBy: { name: "asc" }
    });

    const independentStudents = await Promise.all(independentStudentsRaw.map(async (u: any) => {
      const progress = await getStudentGlobalProgression(u.id);
      return { ...u, averageProgress: progress };
    }));

    const allModules = await prisma.module.findMany({
      select: { id: true, title: true },
      orderBy: { title: "asc" }
    });

    return { groups, independentStudents, allModules };
  } catch (error) {
    console.error("Erreur getAdminStagiairesData:", error);
    return { groups: [], independentStudents: [], allModules: [] };
  }
}

/**
 * Inscription libre d'un nouvel utilisateur (Stagiaire par défaut)
 */
export async function registerUser(name: string, email: string, password: string) {
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { error: "Cet email est déjà utilisé." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "STUDENT",
        status: "PENDING"
      }
    });

    // SIMULATION NOTIFICATION ADMIN
    console.log(`[NOTIFICATION ADMIN] Nouvelle inscription : ${name} (${email}). En attente de validation.`);

    return { success: true };
  } catch (error) {
    console.error("registerUser error:", error);
    return { error: "Erreur lors de l'inscription." };
  }
}

/**
 * Récupérer les utilisateurs en attente de validation
 */
export async function getPendingUsers() {
  try {
    const session = await auth();
    if (!session?.user) return [];
    
    const role = session.user.role;
    const userId = session.user.id;

    if (role !== "ADMIN" && role !== "TRAINER") return [];

    const where: any = { status: "PENDING" };
    if (role === "TRAINER") {
      where.trainerId = userId;
    }

    return await prisma.user.findMany({
      where,
      include: { group: true },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("getPendingUsers error:", error);
    return [];
  }
}

/**
 * Approuver un utilisateur
 */
export async function approveUser(userId: string) {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Non authentifié" };

    const currentUserRole = session.user.role;
    const currentUserId = session.user.id;

    if (currentUserRole !== "ADMIN" && currentUserRole !== "TRAINER") {
      return { success: false, error: "Action non autorisée" };
    }

    // Si c'est un formateur, on vérifie que l'utilisateur lui est bien assigné
    if (currentUserRole === "TRAINER") {
      const userToApprove = await prisma.user.findUnique({
        where: { id: userId },
        select: { trainerId: true }
      });
      if (userToApprove?.trainerId !== currentUserId) {
        return { success: false, error: "Vous ne pouvez pas valider ce stagiaire" };
      }
    }
    await prisma.user.update({
      where: { id: userId },
      data: { status: "APPROVED" }
    });
    revalidatePath("/admin/approvals");
    revalidatePath("/admin/stagiaires");
    return { success: true };
  } catch (error) {
    console.error("approveUser error:", error);
    return { error: "Erreur lors de l'approbation." };
  }
}

/**
 * Rejeter un utilisateur (Suppression ou statut REJECTED)
 */
export async function rejectUser(userId: string) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return { error: "Non autorisé." };

    await prisma.user.update({
      where: { id: userId },
      data: { status: "REJECTED" }
    });
    revalidatePath("/admin/approvals");
    return { success: true };
  } catch (error) {
    console.error("rejectUser error:", error);
    return { error: "Erreur lors du rejet." };
  }
}

/**
 * Mettre à jour le groupe d'un stagiaire
 */
export async function updateStudentGroup(studentId: string, groupId: string | null) {
  try {
    await prisma.user.update({
      where: { id: studentId },
      data: { groupId }
    });
    revalidatePath("/admin/stagiaires");
    revalidatePath("/admin/groups");
    return { success: true };
  } catch (error) {
    console.error("updateStudentGroup error:", error);
    return { error: "Erreur lors de la mise à jour du groupe du stagiaire." };
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
