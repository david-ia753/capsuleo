"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Loader2 } from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e?: React.FormEvent, directEmail?: string) => {
    if (e) e.preventDefault();
    const finalEmail = directEmail || email;
    if (!finalEmail) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: finalEmail,
        redirect: false,
      });
 
      if (result?.error) {
        setError("Erreur de connexion. Vérifiez votre email.");
      } else {
        // Redirection dynamique basee sur le role
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();
        
        if (session?.user?.role === "ADMIN") {
          router.push("/admin/dashboard");
        } else if (session?.user?.role === "TRAINER") {
          router.push("/dashboard");
        } else {
          router.push("/catalogue");
        }
        router.refresh();
      }
    } catch {
      setError("Erreur de connexion inattendue.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const autoEmail = searchParams.get("email");
    const autoLogin = searchParams.get("auto") === "true";
    
    if (autoEmail && autoLogin) {
      handleLogin(undefined, autoEmail);
    }
  }, [searchParams]);

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      <div className="space-y-2">
        <label 
          htmlFor="email-input" 
          className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1"
        >
          EMAIL
        </label>
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#FFC107] transition-colors duration-300">
            <Mail size={18} />
          </div>
          <input
            id="email-input"
            type="email"
            placeholder="votre@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-[22px] text-white placeholder-white/20 focus:outline-none focus:border-[#FFC107]/40 focus:ring-4 focus:ring-[#FFC107]/5 transition-all duration-300 font-medium"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium animate-shake">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || !email}
        className="w-full py-4 rounded-2xl transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 group relative overflow-hidden shadow-[0_10px_30px_rgba(251,191,36,0.3)] hover:shadow-[0_15px_40px_rgba(251,191,36,0.5)] disabled:opacity-40"
        style={{
          backgroundColor: "#FFC107",
          color: "#000000",
          fontWeight: "bold"
        }}
      >
        <div className="absolute inset-0 bg-[#FFC107]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          "Se connecter"
        )}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="login-page flex items-center justify-center min-h-screen relative p-6 bg-transparent overflow-hidden">
      {/* Background Depth Elements */}
      <div className="fixed inset-0 z-[-1] pointer-events-none opacity-30 blur-[120px]">
        <div className="absolute top-[10%] left-[20%] w-[30vw] h-[30vw] rounded-full bg-blue-600/30 animate-pulse" />
        <div className="absolute bottom-[20%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-[#fbbf24]/10 animate-pulse delay-1000" />
      </div>

      <div 
        className="login-card p-10 md:p-12 max-w-[440px] w-full relative z-10 animate-in fade-in zoom-in duration-1000"
        style={{
          backgroundColor: "rgba(11, 17, 32, 0.6)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "40px",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)"
        }}
      >
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div 
              style={{
                width: "72px",
                height: "72px",
                backgroundColor: "#FFC107",
                borderRadius: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 30px rgba(255, 193, 7, 0.4)"
              }}
            >
              <svg width="44" height="44" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 34V18L24 12L34 18V34" stroke="#020617" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 28V24L24 22L28 24V28" stroke="#020617" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="24" cy="17" r="2" fill="#020617"/>
              </svg>
            </div>
          </div>
          
          <h1 
            className="text-4xl font-black mb-3 tracking-tighter text-[#FFC107]"
            style={{ textShadow: "0 0 20px rgba(255, 193, 7, 0.4)" }}
          >
            Capsuléo
          </h1>
          <p className="text-white/60 font-medium tracking-tight">
            Votre espace de formation cristallin
          </p>
        </div>

        <Suspense fallback={
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="w-8 h-8 animate-spin text-[#FFC107]" />
            <p className="text-xs text-white/40 tracking-widest uppercase">Configuration du lien magique...</p>
          </div>
        }>
          <LoginForm />
        </Suspense>

        {/* Footer Links */}
        <div className="mt-10 pt-8 border-t border-white/5 text-center space-y-4">
          <p className="text-[11px] text-white/40 leading-relaxed max-w-[280px] mx-auto">
            En vous connectant, vous acceptez les conditions d'utilisation et la politique de confidentialité.
          </p>
          
          <div className="bg-white/5 p-3 rounded-2xl inline-block border border-white/5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#fbbf24]/60">
              ⚡ Accès Sécurisé Capsuléo
            </span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
}
