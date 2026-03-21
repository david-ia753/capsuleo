import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getGroupModuleIds } from "@/app/actions/groups";
import { getAdminStagiairesData } from "@/app/actions/students";
import { getTeamData } from "@/app/actions/equipe";
import StagiairesClient from "../stagiaires/StagiairesClient";
import { createInvitation, getInvitations } from "@/app/actions/invitations";
import CopyInvitationLink from "./CopyInvitationLink";
import { UserPlus, Mail, User, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { GlassButton } from "@/components/GlassButton";
import { InteractiveElement } from "@/components/InteractiveElement";

export default async function GroupsPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "TRAINER")) {
    redirect("/auth/signin");
  }

  const isAdmin = session.user.role === "ADMIN";
  const { groups, independentStudents, allModules } = await getAdminStagiairesData(isAdmin ? undefined : session.user.id);
  const { members: trainers } = await getTeamData();
  const invitations = isAdmin ? await getInvitations() : [];

  // On construit une map des ids de modules par groupe
  const assignedModuleIdsMap: Record<string, string[]> = {};
  for (const group of groups) {
    assignedModuleIdsMap[group.id] = await getGroupModuleIds(group.id);
  }

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
          Gestion de groupe
        </h2>
      </header>

      {/* Gestion des Groupes et Stagiaires (Cohortes) en plein écran */}
      <div className="w-full">
        <StagiairesClient 
          initialGroups={groups as any} 
          independentStudents={independentStudents as any}
          allModules={allModules}
          assignedModuleIdsMap={assignedModuleIdsMap}
          availableTrainers={trainers.filter(m => m.role === "TRAINER") as any}
          trainerId={isAdmin ? undefined : session.user.id}
        />
      </div>
    </div>
  );
}
