"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  BookOpen, 
  Loader2,
  AlertTriangle,
  Users,
  Save,
  GripVertical
} from "lucide-react";
import { Reorder } from "framer-motion";
import { getAdminStagiairesData } from "@/app/actions/students";
import { reorderGroupModules } from "@/app/actions/groups";
import { Module, GroupWithModules } from "@/types";
import ModuleCard from "./ModuleCard";
import AssignModuleModal from "./AssignModuleModal";

function ModuleLibraryContent() {
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter") || "all";

  const [modules, setModules] = useState<Module[]>([]);
  const [groups, setGroups] = useState<GroupWithModules[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const [activeReorderGroupId, setActiveReorderGroupId] = useState<string | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [assigningModule, setAssigningModule] = useState<{id: string, title: string} | null>(null);

  useEffect(() => {
    setActiveReorderGroupId(null);
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (filter === "mine") {
        const data = await getAdminStagiairesData();
        setGroups(data.groups as any);
        const res = await fetch(`/api/modules?filter=mine`);
        const globalData = await res.json();
        if (Array.isArray(globalData)) {
          const assignedIds = new Set(data.groups.flatMap((g: any) => g.assignedModules.map((m: any) => m.id)));
          // Pour les formateurs, on ne montre que leurs propres modules s'ils ne sont pas assignés
          const filtered = globalData.filter((m: any) => {
            const isAssigned = assignedIds.has(m.id);
            if (isAssigned) return false;
            return true; // On garde tout pour l'instant, mais on pourrait filtrer par creatorId ici si besoin
          });
          setModules(filtered);
        }
      } else {
        const res = await fetch(`/api/modules?filter=all`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setModules(data);
        }
      }
    } catch (error) {
      console.error("Erreur chargement modules:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/modules/${id}`, { method: "DELETE" });
      if (res.ok) {
        setModules(modules.filter(m => m.id !== id));
        setGroups(groups.map(g => ({
          ...g,
          assignedModules: g.assignedModules.filter(m => m.id !== id)
        })));
        setShowConfirm(null);
      }
    } catch (error) {
      console.error("Erreur suppression:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaveOrder = async (groupId: string, newModules: Module[]) => {
    setIsSavingOrder(true);
    try {
      const moduleIds = newModules.map(m => m.id);
      const res = await reorderGroupModules(groupId, moduleIds);
      if (res.success) {
        setActiveReorderGroupId(null);
        await fetchData();
      }
    } catch (error) {
      console.error("Save order error:", error);
    } finally {
      setIsSavingOrder(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#0070FF]" />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* 1. Header & Filters Info */}
      <div className="flex justify-between items-center bg-white/5 p-4 rounded-3xl border border-white/10 mb-8">
        <h3 className="text-xs font-black uppercase tracking-widest text-[#0070FF] flex items-center gap-3 ml-4">
          <BookOpen size={16} /> {filter === 'mine' ? 'Mes Modules par Cohorte' : 'Bibliothèque'}
        </h3>
      </div>

      {filter === 'mine' ? (
        <div className="space-y-16">
          {/* Section par Groupes */}
          {groups.map((group) => (
            <section key={group.id} className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#00f2ff]/10 flex items-center justify-center border border-[#00f2ff]/20">
                    <Users size={18} className="text-[#00f2ff]" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-white">{group.name}</h4>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{group.assignedModules.length} Modules assignés</p>
                  </div>
                </div>

                {group.assignedModules.length > 0 && (
                  <button 
                    onClick={() => activeReorderGroupId === group.id ? handleSaveOrder(group.id, group.assignedModules) : setActiveReorderGroupId(group.id)}
                    disabled={isSavingOrder && activeReorderGroupId === group.id}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${
                      activeReorderGroupId === group.id 
                        ? "bg-[#00f2ff] text-[#132E53] shadow-[0_0_20px_rgba(0,242,255,0.3)]" 
                        : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
                    }`}
                  >
                    {isSavingOrder && activeReorderGroupId === group.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : activeReorderGroupId === group.id ? (
                      <><Save size={14} /> Sauvegarder l&apos;ordre</>
                    ) : (
                      <><GripVertical size={14} /> Réorganiser</>
                    )}
                  </button>
                )}
              </div>

              <div className="relative">
                {group.assignedModules.length === 0 ? (
                  <div className="p-8 rounded-[24px] border border-dashed border-white/5 text-center">
                    <p className="text-xs text-white/20 font-bold uppercase tracking-widest">Aucun module assigné à ce groupe.</p>
                  </div>
                ) : (
                  <Reorder.Group 
                    axis="y" 
                    values={group.assignedModules} 
                    onReorder={(newOrder) => {
                      setGroups(groups.map(g => g.id === group.id ? { ...g, assignedModules: newOrder as any } : g));
                    }} 
                    className="space-y-4"
                  >
                    {group.assignedModules.map((module) => (
                      <ModuleCard 
                        key={module.id}
                        module={module}
                        isReordering={activeReorderGroupId === group.id}
                        asReorderItem={true}
                        onDelete={handleDelete}
                        deletingId={deletingId}
                        setShowConfirm={setShowConfirm}
                        onAssign={(id: string, title: string) => setAssigningModule({ id, title })}
                      />
                    ))}
                  </Reorder.Group>
                )}
              </div>
            </section>
          ))}

          {/* Section Modules Libres (non assignés) */}
          {modules.length > 0 && (
            <section key="independent" className="space-y-6 pt-12 border-t border-white/5">
              <div className="flex items-center gap-4 px-2">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                  <BookOpen size={18} className="text-white/40" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-white/60">Modules non assignés</h4>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Contenus en attente d&apos;attribution</p>
                </div>
              </div>
              <div className="space-y-4">
                {modules.map((module) => (
                  <ModuleCard 
                    key={module.id}
                    module={module}
                    isReordering={false}
                    asReorderItem={false}
                    onDelete={handleDelete}
                    deletingId={deletingId}
                    setShowConfirm={setShowConfirm}
                    onAssign={(id: string, title: string) => setAssigningModule({ id, title })}
                  />
                ))}
              </div>
            </section>
          )}

          {groups.length === 0 && modules.length === 0 && (
             <div className="glass-card p-12 text-center border-white/5">
                <BookOpen className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Aucun module</h3>
                <p className="text-white/40">Vous n&apos;avez pas encore créé de module.</p>
             </div>
          )}
        </div>
      ) : (
        /* Bibliothèque Globale */
        <div className="space-y-4">
          {modules.map((module) => (
            <ModuleCard 
              key={module.id}
              module={module}
              isReordering={false}
              asReorderItem={false}
              onDelete={handleDelete}
              deletingId={deletingId}
              setShowConfirm={setShowConfirm}
              onAssign={(id, title) => setAssigningModule({ id, title })}
            />
          ))}
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-[#020617]/40 backdrop-blur-2xl" onClick={() => setShowConfirm(null)} />
          <div className="relative glass-card border-white/10 p-10 max-w-sm w-full text-center scale-100 shadow-2xl">
            <div className="bg-red-500/20 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-red-500/30">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h4 className="text-2xl font-bold text-white mb-3 tracking-tight">Supprimer le module ?</h4>
            <p className="text-sm text-white/50 mb-8 leading-relaxed px-2">Cette action supprimera le module DEFINITIVEMENT pour tous les groupes.</p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => handleDelete(showConfirm)}
                disabled={!!deletingId}
                className="w-full py-4 rounded-2xl bg-red-600 text-white font-black hover:bg-red-500 transition-all shadow-lg active:scale-95 disabled:opacity-50"
              >
                SUPPRIMER DÉFINITIVEMENT
              </button>
              <button onClick={() => setShowConfirm(null)} className="w-full py-4 rounded-2xl bg-white/5 text-white/60 font-medium hover:bg-white/10 hover:text-white transition-all">Conserver</button>
            </div>
          </div>
        </div>
      )}

      {assigningModule && (
        <AssignModuleModal 
          moduleId={assigningModule.id}
          moduleTitle={assigningModule.title}
          onClose={() => setAssigningModule(null)}
          onSuccess={() => {
            setAssigningModule(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

export function ModuleLibraryClient() {
  return (
    <Suspense fallback={<div className="flex justify-center p-12"><Loader2 className="animate-spin text-[#0070FF]" /></div>}>
      <ModuleLibraryContent />
    </Suspense>
  );
}
