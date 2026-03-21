import { ProfileForm } from "@/components/ProfileForm";

export default function ProfilePage() {
  return (
    <div className="w-full max-w-6xl mx-auto py-8">
      <header className="mb-12 px-4">
        <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">Mon Profil</h2>
        <p className="text-white/40 font-medium">Gérez vos informations personnelles et votre sécurité.</p>
      </header>
      
      <div className="px-4">
        <ProfileForm />
      </div>
    </div>
  );
}
