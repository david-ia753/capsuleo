import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAdminStagiairesData, getGlobalStudentsData } from "@/app/actions/students";
import { getTeamData } from "@/app/actions/equipe";
import { StudentsListClient } from "@/components/StudentsListClient";

export default async function StagiairesPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "TRAINER")) {
    redirect("/auth/signin");
  }

  const isAdmin = session.user.role === "ADMIN";
  
  // 1. On récupère la liste des stagiaires
  let students = await getGlobalStudentsData();
  if (!isAdmin) {
    // Si formateur, on filtre uniquement SES stagiaires
    students = students.filter(s => s.trainer?.id === session.user.id) as any;
  }

  // 2. On a besoin des groupes, modules et formateurs pour les actions
  const { groups, allModules } = await getAdminStagiairesData(isAdmin ? undefined : session.user.id);
  const { members } = await getTeamData();
  const trainers = members.filter(m => m.role === "TRAINER") as { id: string; name: string }[];

  return (
    <div className="w-full space-y-12">
      <header className="mb-16">
        <h2 
          className="text-5xl font-black"
          style={{ 
            color: "#fbbf24",
            letterSpacing: "-0.04em", 
            textShadow: "0 0 15px rgba(251, 191, 36, 0.5)" 
          }}
        >
          {isAdmin ? "Suivi stagiaire" : "Stagiaires"}
        </h2>
      </header>

      <StudentsListClient 
        students={students as any} 
        groups={groups as any}
        trainers={trainers}
        modules={allModules as any}
        isAdmin={isAdmin}
      />
    </div>
  );
}
