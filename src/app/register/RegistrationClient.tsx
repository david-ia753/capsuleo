"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { completeRegistration } from "@/app/actions/register";
import { Lock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";

export default function RegistrationClient({ 
  email, 
  name, 
  token 
}: { 
  email: string; 
  name: string; 
  token: string 
}) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit faire au moins 8 caractères.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("token", token);
    formData.append("password", password);
    formData.append("confirmPassword", confirmPassword);

    const result = await completeRegistration(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      // Rediriger vers le login après 3 secondes
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    }
  };

  if (success) {
    return (
      <div className="glass-card p-12 text-center max-w-md w-full border-white/10 animate-in fade-in zoom-in duration-500">
        <div className="mx-auto w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-8 border border-green-500/20">
          <CheckCircle2 className="w-10 h-10 text-green-400" />
        </div>
        <h2 className="text-3xl font-black text-white mb-4">Compte Créé !</h2>
        <p className="text-white/60 mb-8 leading-relaxed">
          Votre compte formateur a été activé avec succès. Vous allez être redirigé vers la page de connexion.
        </p>
        <Link 
          href="/auth/login"
          className="block w-full py-4 bg-safran hover:bg-safran-light text-marine font-black uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-safran/10 transition-all"
        >
          Se connecter maintenant
        </Link>
      </div>
    );
  }

  return (
    <div className="glass-card p-12 max-w-md w-full border-white/10 shadow-2xl animate-in fade-in zoom-in duration-700">
      <div className="mb-10 text-center">
        <div className="inline-flex bg-safran/10 p-4 rounded-2xl text-safran mb-6">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-black text-white mb-2">Finaliser l'Inscription</h2>
        <p className="text-white/40 text-sm">Bienvenue, <span className="text-safran font-bold">{name}</span></p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Email</label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white/40 font-medium cursor-not-allowed"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Nouveau mot de passe</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/20 focus:outline-none focus:border-safran/50 transition-all font-medium"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Confirmer le mot de passe</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/20 focus:outline-none focus:border-safran/50 transition-all font-medium"
              required
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm animate-shake">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-5 bg-safran hover:bg-safran-light disabled:opacity-50 disabled:cursor-not-allowed text-marine font-black uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-safran/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 mt-8"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Création en cours...
            </>
          ) : (
            "Créer mon compte"
          )}
        </button>
      </form>
    </div>
  );
}
