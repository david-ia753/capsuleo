"use client";

import { useState } from "react";
import { Users, BookOpen, TrendingUp, Search, Filter, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { InteractiveRow } from "@/components/InteractiveRow";
import { InteractiveElement } from "@/components/InteractiveElement";
import { useSession } from "next-auth/react";
import Link from "next/link";

type StudentRow = {
  id: string;
  name: string;
  email: string | null;
  groupName: string;
  groupId: string;
  modulesStarted: number;
  modulesCompleted: number;
  averageScore: number;
  totalModules: number;
};

type GlobalStats = {
  activeStudents: number;
  globalAverageScore: number;
  mostViewedModule: string;
};

type Module = {
  id: string;
  title: string;
  description: string | null;
  contentType: string;
  shortDescription: string | null;
  createdAt: Date;
};

type Group = { id: string; name: string };

export default function DashboardClient({
  students,
  stats,
  groups,
  modules
}: {
  students: StudentRow[];
  stats: GlobalStats;
  groups: Group[];
  modules: Module[];
}) {
  const { data: session } = useSession();
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("ALL");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<{ id: string, name: string, type: 'student' | 'module' } | null>(null);
  const userName = session?.user?.name || "Admin";

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(search.toLowerCase()) || 
                          (student.email && student.email.toLowerCase().includes(search.toLowerCase()));
    const matchesGroup = groupFilter === "ALL" || student.groupId === groupFilter;
    
    return matchesSearch && matchesGroup;
  });

  const handleDelete = async () => {
    if (!showConfirm) return;
    setDeletingId(showConfirm.id);
    const endpoint = showConfirm.type === 'student' ? `/api/students/${showConfirm.id}` : `/api/modules/${showConfirm.id}`;
    
    try {
      const res = await fetch(endpoint, { method: "DELETE" });
      if (res.ok) {
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.error || "Erreur lors de la suppression.");
      }
    } catch (error) {
      console.error(error);
      alert("Une erreur est survenue.");
    } finally {
      setDeletingId(null);
      setShowConfirm(null);
    }
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-12 mt-20">
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
          Vue d'ensemble de la plateforme Capsuléo.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 mb-16">
        {[
          { label: "Stagiaires Actifs", value: stats.activeStudents, icon: Users },
          { label: "Moyenne Globale", value: `${stats.globalAverageScore}%`, icon: TrendingUp },
          { label: "Module Top", value: stats.mostViewedModule || "N/A", icon: BookOpen, isSmall: true },
        ].map((item, i) => (
          <InteractiveElement 
            key={i}
            className="p-10 flex items-center gap-6"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              borderRadius: "32px",
            }}
          >
            <div 
              style={{ backgroundColor: "rgba(251, 191, 36, 0.1)" }}
              className="p-5 rounded-2xl text-[#fbbf24]"
            >
              <item.icon className="w-10 h-10" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">{item.label}</p>
              <p className={`${item.isSmall ? 'text-xl font-bold' : 'text-4xl font-black'} text-white truncate`}>
                {item.value}
              </p>
            </div>
          </InteractiveElement>
        ))}
      </div>

      {/* Section Tableau Electric */}
      <InteractiveElement
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderRadius: "32px",
        }}
        className="overflow-hidden"
      >
        <div className="p-10 flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-white/5">
           <h2 
             className="text-2xl font-bold"
             style={{
               background: "linear-gradient(to bottom, #132E53, #0070FF)",
               WebkitBackgroundClip: "text",
               WebkitTextFillColor: "transparent",
               textShadow: "0.5px 0.5px 0px rgba(255, 255, 255, 0.3)"
             }}
           >
             Suivi des Stagiaires
           </h2>
           
           <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
             <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30" />
                <input
                  type="text"
                  placeholder="Chercher..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full sm:w-64 pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/20 focus:outline-none focus:border-[#fbbf24]/50 transition-all font-medium"
                />
             </div>

             <div className="relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30" />
                <select
                  value={groupFilter}
                  onChange={(e) => setGroupFilter(e.target.value)}
                  className="w-full pl-12 pr-10 py-3 bg-white/5 border border-white/10 rounded-2xl text-white appearance-none focus:outline-none focus:border-[#fbbf24]/50 transition-all font-medium"
                >
                  <option value="ALL" className="bg-[#020617]">Tous les groupes</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id} className="bg-[#020617]">{g.name}</option>
                  ))}
                </select>
             </div>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/2 border-b border-white/5">
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Stagiaire</th>
                <th scope="col" className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 text-center">Modules</th>
                <th scope="col" className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 text-center">Completion</th>
                <th scope="col" className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 text-right">Score</th>
                <th scope="col" className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-10 py-20 text-center text-white/20 italic font-medium">
                    Aucun stagiaire trouvé.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <InteractiveRow key={student.id} className="group">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-5">
                        <div className="h-14 w-14 rounded-2xl bg-[#fbbf24]/10 flex items-center justify-center font-black text-[#fbbf24] text-xl border border-[#fbbf24]/20 shadow-lg group-hover:scale-110 transition-transform">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xl font-bold text-white group-hover:text-[#fbbf24] transition-colors">{student.name}</p>
                          <p className="text-sm font-bold text-white/30 uppercase tracking-widest">{student.groupName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-center">
                       <span className="text-lg font-bold text-white/60">
                         {student.modulesStarted} <span className="text-white/20 mx-1">/</span> {student.totalModules}
                       </span>
                    </td>
                    <td className="px-10 py-8 text-center">
                       <div className="flex flex-col items-center gap-2">
                         <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
                           <div 
                             className="h-full bg-[#fbbf24] transition-all" 
                             style={{ width: `${student.totalModules > 0 ? (student.modulesCompleted / student.totalModules) * 100 : 0}%`, boxShadow: "0 0 10px rgba(251, 191, 36, 0.5)" }} 
                           />
                         </div>
                          <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">
                             {student.modulesCompleted}% Global
                          </span>
                       </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                       {student.averageScore > 0 ? (
                         <div className="inline-flex flex-col items-end">
                           <span className={`text-2xl font-black ${
                             student.averageScore >= 80 ? 'text-[#00f2ff]' : 
                             student.averageScore >= 50 ? 'text-[#fbbf24]' : 'text-[#ff4d4d]'
                           }`}>
                             {student.averageScore}%
                           </span>
                           <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Moyenne</span>
                         </div>
                       ) : (
                         <span className="text-white/10 font-bold">-</span>
                       )}
                    </td>
                    <td className="px-10 py-8 text-right">
                       <button 
                         onClick={(e) => {
                           e.stopPropagation();
                           setShowConfirm({ id: student.id, name: student.name, type: 'student' });
                         }}
                         className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/10"
                         title="Supprimer le stagiaire"
                       >
                         <Trash2 size={18} />
                       </button>
                    </td>
                  </InteractiveRow>
                ))
              )}
            </tbody>
          </table>
        </div>
      </InteractiveElement>

      {/* Section Modules Electric */}
      <InteractiveElement 
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderRadius: "32px",
        }}
        className="mt-16"
      >
        <div className="p-10 border-b border-white/5">
           <h2 
             className="text-2xl font-bold"
             style={{
               background: "linear-gradient(to bottom, #132E53, #0070FF)",
               WebkitBackgroundClip: "text",
               WebkitTextFillColor: "transparent",
               textShadow: "0.5px 0.5px 0px rgba(255, 255, 255, 0.3)"
             }}
           >
             Catalogue des Modules
           </h2>
        </div>
        
        <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.length === 0 ? (
            <p className="col-span-full text-center text-white/20 py-10 italic">Aucun module disponible.</p>
          ) : (
            modules.map(module => (
              <Link key={module.id} href={`/catalogue/${module.id}`} className="block group">
                <InteractiveElement 
                  className="p-6 h-full transition-all duration-500 hover:scale-[1.05] hover:shadow-[0_20px_50px_rgba(251,191,36,0.15)] hover:border-safran/50"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    borderRadius: "24px"
                  }}
                >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-[#fbbf24]/10 text-[#fbbf24]">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowConfirm({ id: module.id, name: module.title, type: 'module' });
                      }}
                      className="p-2.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all border border-red-500/10"
                      title="Supprimer le module"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <span className="text-[10px] font-black bg-white/5 px-2 py-1 rounded-md uppercase tracking-widest text-white/40">
                    {module.contentType}
                  </span>
                </div>
                <h3 
                  className="text-lg font-bold group-hover:text-safran transition-colors mb-2"
                  style={{ color: "#ffffff" }}
                >
                  {module.title}
                </h3>
                <p className="text-xs text-white/40 line-clamp-2 mb-4 leading-relaxed">
                  {module.description || module.shortDescription || "Pas de description."}
                </p>
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-white/20 pt-4 border-t border-white/5">
                   <span>Créé le {new Date(module.createdAt).toLocaleDateString()}</span>
                   <span className="text-[#fbbf24]/40 group-hover:text-[#fbbf24] transition-colors">Détails →</span>
                </div>
              </InteractiveElement>
            </Link>
          ))
          )}
        </div>
      </InteractiveElement>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div 
            className="absolute inset-0 bg-[#020617]/40 backdrop-blur-2xl"
            onClick={() => !deletingId && setShowConfirm(null)}
          />
          <div className="relative glass-card border-white/10 p-10 max-w-sm w-full text-center scale-100 animate-in zoom-in-95 duration-200 shadow-2xl">
            <div className="bg-red-500/20 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-red-500/30">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            
            <h4 className="text-2xl font-bold text-white mb-3 tracking-tight">
              {showConfirm.type === 'student' ? "Supprimer le stagiaire ?" : "Supprimer le module ?"}
            </h4>
            <p className="text-sm text-white/50 mb-8 leading-relaxed px-2">
              Voulez-vous vraiment supprimer <span className="text-white font-bold">"{showConfirm.name}"</span> ? 
              Cette action est irréversible.
            </p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleDelete}
                disabled={!!deletingId}
                className="w-full py-4 rounded-2xl bg-red-600 text-white font-black hover:bg-red-500 transition-all shadow-lg shadow-red-900/40 active:scale-95 disabled:opacity-50"
              >
                {deletingId ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  "SUPPRIMER DÉFINITIVEMENT"
                )}
              </button>
              <button 
                onClick={() => setShowConfirm(null)}
                disabled={!!deletingId}
                className="w-full py-4 rounded-2xl bg-white/5 text-white/60 font-medium hover:bg-white/10 hover:text-white transition-all"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
