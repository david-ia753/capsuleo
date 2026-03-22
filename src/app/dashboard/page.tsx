import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
  Users, 
  BookOpen, 
  Layers, 
  ArrowRight,
  TrendingUp,
  Clock,
  LayoutDashboard
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "TRAINER")) {
    redirect("/auth/login");
  }

  // Fetch some stats for the dashboard
  const [modulesCount, groupsCount, studentsCount] = await Promise.all([
    prisma.module.count(),
    prisma.group.count(),
    prisma.user.count({ where: { role: "STUDENT" } })
  ]);

  const cards = [
    {
      title: "Gestion des Modules",
      desc: "Créez et organisez vos contenus pédagogiques",
      href: "/admin/modules",
      icon: <BookOpen className="text-blue-400" />,
      stats: `${modulesCount} Modules`,
      color: "blue"
    },
    {
      title: "Groupes & Cohortes",
      desc: "Gérez vos classes et l'accès aux modules",
      href: "/admin/groups",
      icon: <Users className="text-cyan-400" />,
      stats: `${groupsCount} Groupes`,
      color: "cyan"
    },
    {
      title: "Suivi Stagiaires",
      desc: "Consultez la progression de vos apprenants",
      href: "/admin/stagiaires",
      icon: <TrendingUp className="text-emerald-400" />,
      stats: `${studentsCount} Élèves`,
      color: "emerald"
    }
  ];

  return (
    <div className="w-full">
      <header className="mb-12">
        <h2 
          className="text-5xl font-black mb-4"
          style={{ 
            color: "#fbbf24",
            letterSpacing: "-0.04em", 
            textShadow: "0 0 15px rgba(251, 191, 36, 0.5)" 
          }}
        >
          Espace Formateur
        </h2>
        <p className="text-white/40 font-medium max-w-2xl">
          Bienvenue sur votre tableau de bord. Gérez vos formations et suivez l&apos;évolution de vos stagiaires en temps réel.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {cards.map((card, i) => (
          <Link 
            key={i} 
            href={card.href}
            className="group relative p-8 rounded-[32px] bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 overflow-hidden"
          >
            {/* Glow effect */}
            <div className={`absolute -right-20 -top-20 w-64 h-64 bg-${card.color}-500/10 blur-[100px] rounded-full group-hover:bg-${card.color}-500/20 transition-all duration-700`} />

            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-8 border border-white/10 group-hover:scale-110 transition-transform duration-500">
                {React.cloneElement(card.icon as React.ReactElement<any>, { size: 32 })}
              </div>

              <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">
                {card.title}
              </h3>
              <p className="text-white/50 text-sm leading-relaxed mb-8">
                {card.desc}
              </p>

              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <span className="text-xs font-black uppercase tracking-widest text-white/30 bg-white/5 px-4 py-2 rounded-xl">
                  {card.stats}
                </span>
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-white/10 group-hover:text-white transition-all duration-500">
                  <ArrowRight size={20} />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {/* Quick Actions / Recent Activity Placeholder */}
      <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-10 rounded-[40px] bg-white/[0.02] border border-white/5">
          <div className="flex items-center gap-4 mb-8">
             <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Clock className="text-amber-500" size={20} />
             </div>
             <h4 className="text-xl font-bold text-white">Activité récente</h4>
          </div>
          <div className="space-y-6">
             <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-4">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                   <div>
                      <p className="text-sm font-bold text-white">Build Production</p>
                      <p className="text-[10px] font-medium text-white/30 uppercase tracking-widest">Il y a quelques minutes</p>
                   </div>
                </div>
                <span className="text-[10px] font-black text-emerald-500/80 bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-tighter">Terminé</span>
             </div>
             <p className="text-center text-xs text-white/20 font-bold uppercase tracking-widest py-4">
                Pas d&apos;autre activité enregistrée
             </p>
          </div>
        </div>
        
        <div className="p-10 rounded-[40px] bg-white/[0.02] border border-white/5">
          <div className="flex items-center gap-4 mb-8">
             <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <LayoutDashboard className="text-purple-500" size={20} />
             </div>
             <h4 className="text-xl font-bold text-white">Ressources rapides</h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <button className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-left">
                <p className="text-xs font-black text-white/40 uppercase mb-2">Aide</p>
                <p className="text-sm font-bold text-white">Documentation</p>
             </button>
             <button className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-left">
                <p className="text-xs font-black text-white/40 uppercase mb-2">Support</p>
                <p className="text-sm font-bold text-white">Contact Admin</p>
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// React import needed for cloneElement
import React from "react";
