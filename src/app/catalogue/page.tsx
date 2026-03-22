import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ArrowRight, Box, ShieldCheck, Database, LayoutGrid } from "lucide-react";
import Link from "next/link";

export default async function ModulesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  const userRole = session.user.role;
  const userGroupId = session.user.groupId;
  const isStaff = userRole === "ADMIN" || userRole === "TRAINER";

  if (!userGroupId && !isStaff) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center p-8 text-center text-white/50">
        <h2 className="text-2xl font-bold mb-4">Aucun groupe assignÃ©</h2>
        <p>Veuillez contacter votre administrateur.</p>
      </div>
    );
  }

  const modules = await prisma.module.findMany({
    where: isStaff ? {} : { 
      groupModules: {
        some: { groupId: userGroupId || "" }
      }
    },
    include: {
      _count: {
        select: { files: true, exercises: true }
      },
      groupModules: {
        where: { groupId: userGroupId || "" },
        select: { order: true }
      },
      files: {
        select: {
          id: true,
          progress: {
            where: { userId: session.user.id }
          }
        }
      } as any,
      fiches: {
        select: {
          id: true,
          exercises: {
            select: {
              id: true,
              progress: {
                where: { userId: session.user.id }
              }
            }
          }
        }
      } as any,
      exercises: {
        select: {
          id: true,
          progress: {
            where: { userId: session.user.id }
          }
        }
      } as any
    },
    // Le tri sera fait manuellement aprÃ¨s pour respecter l'ordre du groupe si applicable
    orderBy: { createdAt: "desc" },
  });

  // Si on est un stagiaire, on trie par l'ordre dÃ©fini dans GroupModule
  const sortedModules = !isStaff ? [...modules].sort((a, b) => {
    const orderA = a.groupModules?.[0]?.order ?? 0;
    const orderB = b.groupModules?.[0]?.order ?? 0;
    return orderA - orderB;
  }) : modules;

  if (modules.length === 0) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center p-8 text-center text-white/50">
        <h2 className="text-2xl font-bold mb-4">Bienvenue !</h2>
        <p>Il n'y a pas encore de modules disponibles.</p>
      </div>
    );
  }

  // Icons and colors based on module titles for varied look
  const getModuleStyle = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes("ia") || t.includes("ai")) return { icon: ShieldCheck, colorClass: "icon-ethique" };
    if (t.includes("donnÃ©e") || t.includes("data")) return { icon: Database, colorClass: "icon-data" };
    if (t.includes("Ã©thique")) return { icon: ShieldCheck, colorClass: "icon-ethique" };
    return { icon: Box, colorClass: "icon-general" };
  };

  return (
    <div className="w-full px-10 py-8 lg:px-20 lg:py-12">
      <header className="mb-8">
        <h1 className="text-xl font-bold text-[#FFC800] uppercase tracking-[0.3em] mb-2">Formation</h1>
        <h2 className="catalog-title text-4xl font-black text-white">Catalogue</h2>
      </header>

      <div className="catalog-grid">
        {sortedModules.map((module: any) => {
          const { icon: Icon, colorClass } = getModuleStyle(module.title);
          
          const totalFiles = module._count.files || 0;
          const moduleExercises = module.exercises || [];
          const ficheExercises = (module.fiches || []).flatMap((f: any) => f.exercises || []);
          
          const totalExercisesCount = moduleExercises.length + ficheExercises.length;
          const totalItems = totalFiles + totalExercisesCount;

          const completedFilesCount = module.files.filter((f: any) => f.progress?.[0]?.isCompleted).length;
          const completedModuleExCount = moduleExercises.filter((e: any) => e.progress?.[0]?.isCompleted).length;
          const completedFicheExCount = ficheExercises.filter((e: any) => e.progress?.[0]?.isCompleted).length;
          
          const totalCompleted = completedFilesCount + completedModuleExCount + completedFicheExCount;
          
          const progress = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;

          return (
            <Link href={`/catalogue/${module.id}`} key={module.id} className="glass-card p-10 flex flex-col relative group overflow-hidden border border-[#0070FF]/20 hover:scale-[1.02] hover:border-[#0070FF]/80 hover:shadow-[0_0_30px_rgba(0,112,255,0.4)] transition-all cursor-pointer">
              {/* IcÃ´ne ThÃ©matique */}
              <div className="flex items-start justify-between mb-6">
                <div className={`p-4 rounded-xl bg-white/5 border border-white/10 ${colorClass} shadow-lg shadow-black/20 group-hover:scale-110 transition-transform group-hover:border-[#0070FF]/50 group-hover:shadow-[#0070FF]/20`}>
                  <Icon size={32} strokeWidth={1.5} className="group-hover:text-[#0070FF] transition-colors" />
                </div>
              </div>

              {/* Contenu */}
              <div className="mb-10 z-10 relative">
                <h3 className="text-2xl font-black text-white leading-tight mb-3 group-hover:text-[#0070FF] transition-colors">
                  {module.title}
                </h3>
                <p className="text-sm font-medium text-white/40 leading-relaxed line-clamp-3">
                  {module.objective || "Maitriser les fondamentaux de ce module pÃ©dagogique."}
                </p>
              </div>

              {/* Spacer pour pousser la progression en bas */}
              <div className="flex-1" />

              {/* Progression et FlÃ¨che bas de carte */}
              <div className="mt-6 border-t border-white/5 pt-6 flex items-end justify-between relative z-10">
                <div className="w-3/4 pr-8">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Progression</span>
                    <span className="text-sm font-black text-[#FFC800]">{progress}%</span>
                  </div>
                  <div className="progress-bar mb-0 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="progress-fill h-full bg-[#FFC800] rounded-full" style={{ width: `${progress}%` }} />
                  </div>
                </div>
                
                {/* FlÃ¨che discrÃ¨te au lieu du bouton */}
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10 group-hover:bg-[#0070FF] group-hover:border-[#0070FF] transition-colors group-hover:shadow-[0_0_15px_rgba(0,112,255,0.4)]">
                   <ArrowRight size={18} className="text-white/50 group-hover:text-white transition-colors group-hover:translate-x-0.5" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

