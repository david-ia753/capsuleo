import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/auth/signin");
  }

  // 1. Récupération des données brutes
  const studentsRaw = await prisma.user.findMany({
    where: { role: "STUDENT" },
    include: {
      group: true,
      progress: {
        include: {
          exercise: {
            include: {
              fiche: true
            }
          }
        }
      },
      fileProgress: true
    }
  });

  const modulesRaw = await prisma.module.findMany({
    include: { 
      groupModules: { select: { groupId: true } },
      files: { select: { id: true } },
      exercises: { select: { id: true } }
    }
  });

  const groups = await prisma.group.findMany();

  // 2. Traitement des statistiques
  const studentsDetails = studentsRaw.map(student => {
    const studentModules = student.groupId 
      ? modulesRaw.filter(m => m.groupModules.some(gm => gm.groupId === student.groupId))
      : [];
    
    // Total d'items à "consommer" pour ce stagiaire
    let totalItems = 0;
    let completedItems = 0;
    let totalScore = 0;
    let exercisesCompleted = 0;

    studentModules.forEach(mod => {
      // Fichiers du module
      const fileIds = mod.files?.map((f: any) => f.id) || [];
      totalItems += fileIds.length;
      completedItems += student.fileProgress.filter(fp => fileIds.includes(fp.fileId) && fp.isCompleted).length;

      // Exercices du module
      const exerciseIds = mod.exercises?.map((e: any) => e.id) || [];
      totalItems += exerciseIds.length;
      
      const sessionExerciseProgress = student.progress.filter(p => exerciseIds.includes(p.exerciseId) && p.isCompleted);
      completedItems += sessionExerciseProgress.length;
      exercisesCompleted += sessionExerciseProgress.length;
      
      sessionExerciseProgress.forEach(p => {
        totalScore += p.score || 0;
      });
    });

    const completionRate = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
    const averageScore = exercisesCompleted > 0 ? Math.round(totalScore / exercisesCompleted) : 0;

     return {
       id: student.id,
       name: student.name || "Stagiaire Sans Nom",
       email: student.email,
       groupName: student.group?.name || "Sans Groupe",
       groupId: student.groupId || "",
       modulesStarted: student.progress.length > 0 || student.fileProgress.length > 0 ? 1 : 0, // Simplifié pour l'instant
       modulesCompleted: Math.round(completionRate), // On utilise le taux global comme "score" de complétion
       averageScore: averageScore,
       totalModules: studentModules.length,
       completionRate: completionRate // On ajoute ce champ si besoin
     };
  });

  const activeStudentsWithScore = studentsDetails.filter(s => s.averageScore > 0);
  const globalAverageScore = activeStudentsWithScore.length > 0 
    ? Math.round(activeStudentsWithScore.reduce((acc, s) => acc + s.averageScore, 0) / activeStudentsWithScore.length)
    : 0;

  const stats = {
    activeStudents: studentsRaw.length,
    globalAverageScore: globalAverageScore,
    mostViewedModule: modulesRaw[0]?.title || "N/A", // À affiner si besoin
  };

  const formattedGroups = groups.map(g => ({ id: g.id, name: g.name }));

  return (
    <DashboardClient 
      students={studentsDetails} 
      stats={stats} 
      groups={formattedGroups} 
      modules={modulesRaw}
    />
  );
}
