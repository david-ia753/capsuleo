import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SettingsForm } from "./SettingsForm";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Paramètres</h1>
        <p className="text-white/60">Personnalisez votre expérience et vos préférences.</p>
      </div>
      
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
        <SettingsForm user={session.user} />
      </div>
    </div>
  );
}
