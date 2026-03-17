import { getInvitationByToken } from "@/app/actions/register";
import RegistrationClient from "./RegistrationClient";
import { AlertCircle, UserX } from "lucide-react";
import Link from "next/link";

export default async function RegisterPage(props: {
  searchParams: Promise<{ token?: string }>;
}) {
  const searchParams = await props.searchParams;
  const token = searchParams.token;

  if (!token) {
    return (
      <div className="min-h-screen bg-marine flex items-center justify-center p-6">
        <div className="glass-card p-12 text-center max-w-md w-full border-white/10">
          <div className="mx-auto w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-8 border border-red-500/20">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-3xl font-black text-white mb-4">Lien Invalide</h2>
          <p className="text-white/40 mb-8 leading-relaxed">
            Ce lien de création de compte est incomplet ou mal formé. Veuillez utiliser le lien fourni dans votre invitation.
          </p>
          <Link 
            href="/auth/login"
            className="block w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all"
          >
            Retour au login
          </Link>
        </div>
      </div>
    );
  }

  const invitation = await getInvitationByToken(token);

  if (!invitation) {
    return (
      <div className="min-h-screen bg-marine flex items-center justify-center p-6 text-white">
        <div className="glass-card p-12 text-center max-w-md w-full border-white/10 shadow-2xl">
          <div className="mx-auto w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-8 border border-red-500/20">
            <UserX className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-3xl font-black text-white mb-4">Lien Expiré</h2>
          <p className="text-white/40 mb-8 leading-relaxed">
            Désolé, cette invitation n'est plus valide, a déjà été utilisée ou a expiré (validité de 7 jours).
          </p>
          <p className="text-safran/60 text-sm font-medium mb-8">
            Veuillez demander une nouvelle invitation à votre administrateur.
          </p>
          <Link 
            href="/auth/login"
            className="block w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all"
          >
            Retour au login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-marine flex items-center justify-center p-6">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-safran/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
      </div>

      <RegistrationClient 
        email={invitation.email} 
        name={`${invitation.firstName} ${invitation.lastName}`} 
        token={token}
      />
    </div>
  );
}
