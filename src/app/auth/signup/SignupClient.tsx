"use client";

import { useState } from "react";
import { registerUser } from "@/app/actions/students";
import { UserPlus, Mail, Lock, User, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SignupClient() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

    const result = await registerUser(name, email, password);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="glass-card p-12 text-center max-w-md w-full border-white/10 animate-in fade-in zoom-in duration-500">
        <div className="mx-auto w-20 h-20 bg-safran/10 rounded-full flex items-center justify-center mb-8 border border-safran/20">
          <CheckCircle2 className="w-10 h-10 text-safran" />
        </div>
        <h2 className="text-3xl font-black text-white mb-4">Demande Envoyée</h2>
        <p className="text-white/60 mb-8 leading-relaxed">
          Merci pour votre inscription ! Votre demande est actuellement en attente de validation par l'administrateur.
        </p>
        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white/40 text-sm mb-8">
          Vous recevrez un accès complet une fois votre profil approuvé.
        </div>
        <Link 
          href="/auth/login"
          className="block w-full py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl transition-all"
        >
          Retour au login
        </Link>
      </div>
    );
  }

  return (
    <div className="glass-card p-10 max-w-md w-full border-white/10 shadow-2xl animate-in fade-in zoom-in duration-700">
      <div className="mb-10 text-center">
        <div className="inline-flex bg-safran/10 p-4 rounded-2xl text-safran mb-6 shadow-[0_0_20px_rgba(251,191,36,0.2)]">
          <UserPlus className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-black text-white mb-2">Rejoindre l'Aventure</h2>
        <p className="text-white/40 text-sm tracking-tight font-medium">Créez votre compte en quelques secondes</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Nom Complet</label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-safran transition-colors" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jean Dupont"
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/20 focus:outline-none focus:border-safran/50 transition-all font-medium"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Email</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-safran transition-colors" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jean@exemple.com"
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/20 focus:outline-none focus:border-safran/50 transition-all font-medium"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Mot de passe</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-safran transition-colors" />
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
          <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Confirmer mot de passe</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-safran transition-colors" />
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
              Envoi en cours...
            </>
          ) : (
            "Demander l'accès"
          )}
        </button>

        <div className="pt-6 border-t border-white/5 text-center">
            <Link 
              href="/auth/login" 
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-safran transition-colors"
            >
                <ArrowLeft className="w-3 h-3" />
                Déjà un compte ? Se connecter
            </Link>
        </div>
      </form>
    </div>
  );
}
