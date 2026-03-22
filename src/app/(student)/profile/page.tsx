import { ProfileForm } from "@/components/ProfileForm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function StudentProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-2">Mon Profil</h1>
        <p className="text-white/40">Gérez vos informations personnelles et votre mot de passe.</p>
      </header>
      
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 shadow-2xl">
        <ProfileForm />
      </div>
    </div>
  );
}
