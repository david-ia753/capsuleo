"use client";

import { useSession } from "next-auth/react";
import { 
  Users, 
  BookOpen, 
  Layers, 
  TrendingUp,
  Clock,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { InteractiveElement } from "@/components/InteractiveElement";
import { GlassButton } from "@/components/GlassButton";

export default function TrainerDashboardClient({ 
  initialStats, 
  initialActivities = [] 
}: { 
  initialStats?: any[],
  initialActivities?: any[]
}) {
  const { data: session } = useSession();
  const userName = session?.user?.name || "Formateur";

  // Simulation de stats (fallback)
  const defaultStats = [
    { label: "Stagiaires suivis", value: "0", icon: Users, color: "text-safran" },
    { label: "Groupes actifs", value: "0", icon: Layers, color: "text-safran" },
    { label: "Modules créés", value: "0", icon: BookOpen, color: "text-safran" },
    { label: "Taux de complétion", value: "0%", icon: TrendingUp, color: "text-safran" },
  ];

  const stats = initialStats ? initialStats.map(s => {
    const icons: any = { Users, Layers, BookOpen, TrendingUp };
    return { ...s, icon: icons[s.icon] || BookOpen };
  }) : defaultStats;

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 
            className="text-4xl font-black mb-2 tracking-tight"
            style={{ 
              color: "#fbbf24",
              textShadow: "0 0 15px rgba(251, 191, 36, 0.5)"
            }}
          >
            Bienvenue, <span style={{ color: "inherit" }}>{userName.toLowerCase().includes('david') ? 'David' : userName.split(' ')[0]}</span> !
          </h1>
          <p className="text-white/40 font-medium">
            Voici un aperçu de l'activité de vos groupes aujourd'hui.
          </p>
        </div>
        <div className="flex gap-4">
          <Link 
            href="/admin/groups"
            className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white text-sm font-bold transition-all flex items-center gap-2"
          >
            Gérer mes groupes
          </Link>
          <div className="w-48">
            <Link href="/admin/upload">
              <GlassButton className="!py-3 !text-sm">
                Nouveau Module
              </GlassButton>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Link 
            key={i} 
            href={
              stat.label === "Stagiaires suivis" ? "/admin/stagiaires" :
              stat.label === "Groupes actifs" ? "/admin/groups" :
              stat.label === "Modules assignés" ? "/admin/modules" : "#"
            }
            className="block h-full group"
          >
            <InteractiveElement 
              className="p-6 relative overflow-hidden h-full"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                borderRadius: "32px",
              }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-white/10 transition-colors" />
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className={`p-3 rounded-xl bg-white/10 ${stat.color} group-hover:scale-110 transition-transform shadow-lg shadow-black/20`}>
                  <stat.icon size={24} />
                </div>
                <span className="text-3xl font-black text-white tracking-tight">{stat.value}</span>
              </div>
              <p className="text-white/60 text-xs font-black uppercase tracking-[0.2em] relative z-10">{stat.label}</p>
            </InteractiveElement>
          </Link>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 
              className="text-xl font-bold flex items-center gap-3"
              style={{
                background: "linear-gradient(to bottom, #132E53, #0070FF)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0.5px 0.5px 0px rgba(255, 255, 255, 0.3)"
              }}
            >
              <Clock className="text-safran" />
              Activité Récente
            </h2>
            <Link href="/admin/stagiaires" className="text-safran text-xs font-bold hover:underline flex items-center gap-1">
              Voir tout <ArrowRight size={12} />
            </Link>
          </div>

          <div 
            className="overflow-hidden border-white/10"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.03)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "32px",
            }}
          >
            {initialActivities.length === 0 ? (
              <div className="p-10 text-center text-white/20 italic">Aucune activité récente.</div>
            ) : (
              initialActivities.map((activity, i) => (
                <div key={activity.id || i} className="p-5 flex items-center gap-5 hover:bg-white/10 transition-colors border-b border-white/5 last:border-0 group cursor-pointer" onClick={() => window.location.href=`/catalogue/${activity.moduleId}`}>
                  <div className="w-12 h-12 rounded-2xl bg-safran/20 flex items-center justify-center text-safran font-black shadow-inner border border-safran/20 group-hover:scale-105 transition-transform">
                    {activity.userName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-bold leading-snug">
                      {activity.userName} <span className="text-white/60 font-medium">{activity.type}</span> <span className="text-safran">{activity.moduleTitle}</span>
                    </p>
                    <p className="text-[10px] text-white/30 uppercase tracking-[0.15em] font-black mt-1.5 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-safran" /> {new Date(activity.updatedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-white tracking-tighter">{activity.completion}%</span>
                  </div>
                </div>
              ))
            )}
            {initialActivities.length > 5 && (
              <button className="w-full p-4 text-xs font-black text-white/30 hover:text-white hover:bg-white/5 transition-all uppercase tracking-widest border-t border-white/5">
                Charger plus d'activité
              </button>
            )}
          </div>
        </div>

        {/* Quick Links / Tasks */}
        <div className="space-y-6">
          <h2 
            className="text-xl font-bold"
            style={{
              background: "linear-gradient(to bottom, #132E53, #0070FF)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0.5px 0.5px 0px rgba(255, 255, 255, 0.3)"
            }}
          >
            Raccourcis rapides
          </h2>
          <div className="space-y-4">
            <Link href="/admin/modules" className="block glass-card p-4 hover:bg-white/5 border-white/10 transition-all" style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <h3 
                className="font-bold mb-1"
                style={{ color: "#ffffff" }}
              >
                Bibliothèque de modules
              </h3>
              <p className="text-white/40 text-xs">Accédez à tous vos supports de cours.</p>
            </Link>
            <Link href="/admin/profile" className="block glass-card p-4 hover:bg-white/5 border-white/10 transition-all" style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <h3 
                className="font-bold mb-1"
                style={{ color: "#ffffff" }}
              >
                Mon Profil
              </h3>
              <p className="text-white/40 text-xs">Gérez vos informations personnelles.</p>
            </Link>
          </div>

          <InteractiveElement 
            className="p-6 overflow-hidden" 
            style={{ 
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              borderRadius: "24px",
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: "rgba(255, 255, 255, 0.1)"
            }}
            hoverStyle={{
              borderColor: "#fbbf24",
              boxShadow: "0 0 20px rgba(251, 191, 36, 0.3)"
            }}
          >
            <h3 
              className="font-black uppercase tracking-widest text-xs mb-3"
              style={{
                color: "#fbbf24",
                opacity: 1,
                textShadow: "0 0 12px rgba(251, 191, 36, 0.4)"
              }}
            >
              Besoin d'aide ?
            </h3>
            <p 
              className="opacity-90 text-sm mb-4 leading-relaxed"
              style={{ color: "#fbbf24" }}
            >
              Consultez le guide du formateur pour apprendre à générer des exercices avec l'IA.
            </p>
            <button className="text-white font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all">
              Lire le guide <ArrowRight size={16} />
            </button>
          </InteractiveElement>
        </div>
      </div>
    </div>
  );
}
