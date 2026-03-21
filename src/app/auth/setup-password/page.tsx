"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Lock, Mail, Loader2, ArrowRight, Users } from "lucide-react";

function SetupPasswordForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [groupId, setGroupId] = useState("");
  const [groups, setGroups] = useState<{id: string, name: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchGroups = async () => {
      const { getAvailableGroups } = await import("@/app/actions/groups");
      const data = await getAvailableGroups();
      setGroups(data);
    };
    fetchGroups();
  }, []);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/setup-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, firstName, lastName, groupId }),
      });

      const data = await res.json();

      if (res.ok) {
        // Rediriger vers login avec email pré-rempli
        router.push(`/auth/login?email=${encodeURIComponent(email)}&setup_success=true`);
      } else {
        setError(data.error || "Une erreur est survenue lors de la configuration.");
      }
    } catch {
      setError("Erreur de connexion inattendue.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSetup} className="space-y-6">
      <div className="space-y-4">
        {/* Email */}
        <div className={`space-y-2 ${searchParams.get("email") ? "opacity-60" : ""}`}>
          <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">VOTRE EMAIL</label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#00D1FF] transition-colors duration-300">
              <Mail size={18} />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              readOnly={!!searchParams.get("email")}
              className={`w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-[22px] text-white placeholder-white/20 focus:outline-none focus:border-[#00D1FF]/40 focus:ring-4 focus:ring-[#00D1FF]/5 transition-all duration-300 font-medium ${searchParams.get("email") ? "cursor-not-allowed" : ""}`}
              placeholder="nom@exemple.com"
              required
            />
          </div>
        </div>

        {/* First & Last Name */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">PRÉNOM</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#00D1FF] transition-colors duration-300">
                <User size={18} />
              </div>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                placeholder="Jean"
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-[22px] text-white placeholder-white/20 focus:outline-none focus:border-[#00D1FF]/40 focus:ring-4 focus:ring-[#00D1FF]/5 transition-all duration-300 font-medium"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">NOM</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#00D1FF] transition-colors duration-300">
                <User size={18} />
              </div>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                placeholder="Dupont"
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-[22px] text-white placeholder-white/20 focus:outline-none focus:border-[#00D1FF]/40 focus:ring-4 focus:ring-[#00D1FF]/5 transition-all duration-300 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">MOT DE PASSE</label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#00D1FF] transition-colors duration-300">
              <Lock size={18} />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-[22px] text-white placeholder-white/20 focus:outline-none focus:border-[#00D1FF]/40 focus:ring-4 focus:ring-[#00D1FF]/5 transition-all duration-300 font-medium"
            />
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">CONFIRMATION</label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#00D1FF] transition-colors duration-300">
              <Lock size={18} />
            </div>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-[22px] text-white placeholder-white/20 focus:outline-none focus:border-[#00D1FF]/40 focus:ring-4 focus:ring-[#00D1FF]/5 transition-all duration-300 font-medium"
            />
          </div>
        </div>

        {/* Group Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">VOTRE GROUPE / COHORTE</label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#00D1FF] transition-colors duration-300">
              <Users size={18} />
            </div>
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-[22px] text-white focus:outline-none focus:border-[#00D1FF]/40 focus:ring-4 focus:ring-[#00D1FF]/5 transition-all duration-300 font-medium appearance-none"
            >
              <option value="" disabled className="bg-[#0b1120]">Sélectionnez votre groupe</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id} className="bg-[#0b1120]">
                  {g.name}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-4 rounded-2xl transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 group relative overflow-hidden shadow-[0_10px_30px_rgba(0,112,255,0.3)] hover:shadow-[0_15px_40px_rgba(0,112,255,0.5)] disabled:opacity-40"
        style={{
          backgroundColor: "#0070FF",
          color: "#FFFFFF",
          fontWeight: "bold"
        }}
      >
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <span>Demander un accès</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>
    </form>
  );
}

export default function SetupPasswordPage() {
  return (
    <div className="login-page flex items-center justify-center min-h-screen relative p-6 bg-transparent overflow-hidden">
      {/* Background Depth Elements */}
      <div className="fixed inset-0 z-[-1] pointer-events-none opacity-30 blur-[120px]">
        <div className="absolute top-[10%] left-[20%] w-[30vw] h-[30vw] rounded-full bg-blue-600/30 animate-pulse" />
        <div className="absolute bottom-[20%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-[#fbbf24]/10 animate-pulse delay-1000" />
      </div>

      <div 
        className="login-card p-10 md:p-12 max-w-[480px] w-full relative z-10 animate-in fade-in zoom-in duration-1000"
        style={{
          backgroundColor: "rgba(11, 17, 32, 0.6)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "40px",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)"
        }}
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black mb-3 text-white tracking-tight">Configuration</h1>
          <p className="text-white/60 font-medium tracking-tight">
            Bienvenue sur Capsuléo. Définissez vos informations pour commencer.
          </p>
        </div>

        <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin mx-auto text-[#00D1FF]" />}>
          <SetupPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
