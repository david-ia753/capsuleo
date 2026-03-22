import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getTeamData } from "@/app/actions/equipe";
import EquipeClient from "./EquipeClient";

export default async function EquipePage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/auth/login");
  }

  const { members, invitations } = await getTeamData();

  return (
    <div className="w-full">
      <EquipeClient 
        members={members as any} 
        invitations={invitations as any} 
      />
    </div>
  );
}

