import { ProfileForm } from "@/components/ProfileForm";

export default function ProfilePage() {
  return (
    <div className="w-full max-w-6xl mx-auto py-8">
      <header className="mb-12">
        <h2 className="text-4xl font-bold text-white mb-2">Mon Profil</h2>
        <p className="text-white/40">Gérez vos informations personnelles et votre sécurité.</p>
      </header>
      
      <ProfileForm />
    </div>
  );
}
