import { auth } from "@/auth";
import { redirect } from "next/navigation";
import TrainerDashboardClient from "./DashboardClient";

export default async function TrainerDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  // Si c'est un Admin, on le redirige vers l'espace Admin
  if (session.user.role === "ADMIN") {
    redirect("/admin/dashboard");
  }

  // Récupération des données pour le formateur (ses groupes)
  const trainerGroups = await prisma.group.findMany({
    where: { trainerId: session.user.id },
    include: {
      users: {
        where: { role: "STUDENT" },
        include: {
          progress: true,
          fileProgress: true
        }
      },
      modules: {
        include: {
          files: true,
          exercises: true
        }
      }
    }
  });

  // Calcul des stats globales pour ce formateur
  let totalCompletion = 0;
  let studentsCount = 0;
  let modulesCount = new Set();

  trainerGroups.forEach((group: any) => {
    group.users.forEach((student: any) => {
      studentsCount++;
      let itemsTotal = 0;
      let itemsDone = 0;
  
      group.modules.forEach((mod: any) => {
        modulesCount.add(mod.id);
        const fIds = mod.files.map((f: any) => f.id);
        const eIds = mod.exercises.map((e: any) => e.id);
        
        itemsTotal += fIds.length + eIds.length;
        itemsDone += student.fileProgress.filter((fp: any) => fIds.includes(fp.fileId) && fp.isCompleted).length;
        itemsDone += student.progress.filter((p: any) => eIds.includes(p.exerciseId) && p.isCompleted).length;
      });
  
      if (itemsTotal > 0) {
        totalCompletion += (itemsDone / itemsTotal) * 100;
      }
    });
  });

  const avgCompletion = studentsCount > 0 ? Math.round(totalCompletion / studentsCount) : 0;

  // 3. Activité Récente
  const studentIds = trainerGroups.flatMap((g: any) => g.users.map((u: any) => u.id));
  
  const fileActivities = await prisma.fileProgress.findMany({
    where: { 
      userId: { in: studentIds },
      isCompleted: true
    },
    include: {
      user: true,
      file: { include: { module: true } }
    },
    orderBy: { updatedAt: 'desc' },
    take: 5
  });

  const exerciseActivities = await prisma.studentProgress.findMany({
    where: { 
      userId: { in: studentIds },
      isCompleted: true
    },
    include: {
      user: true,
      exercise: { include: { module: true } }
    },
    orderBy: { updatedAt: 'desc' },
    take: 5
  });

  const activities = [...fileActivities.map((a: any) => ({
    id: a.id,
    userName: a.user?.name || a.user?.email || "Stagiaire",
    moduleTitle: a.file.module?.title || "Module",
    moduleId: a.file.module?.id,
    type: "a terminé le document",
    updatedAt: a.updatedAt,
    completion: 100 // Document individuel
  })), ...exerciseActivities.map((a: any) => ({
    id: a.id,
    userName: a.user?.name || a.user?.email || "Stagiaire",
    moduleTitle: a.exercise.module?.title || "Module",
    moduleId: a.exercise.module?.id,
    type: "a complété l'exercice",
    updatedAt: a.updatedAt,
    completion: a.score || 100
  }))]
  .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  .slice(0, 5);

  const stats = [
    { label: "Stagiaires suivis", value: studentsCount.toString(), icon: "Users", color: "text-safran" },
    { label: "Groupes actifs", value: trainerGroups.length.toString(), icon: "Layers", color: "text-safran" },
    { label: "Modules assignés", value: modulesCount.size.toString(), icon: "BookOpen", color: "text-safran" },
    { label: "Taux de complétion", value: `${avgCompletion}%`, icon: "TrendingUp", color: "text-safran" },
  ];

  return <TrainerDashboardClient initialStats={stats} initialActivities={activities} />;
}
