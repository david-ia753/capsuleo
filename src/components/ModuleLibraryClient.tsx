"use client";

import { useState, useEffect } from "react";
import { 
  BookOpen, 
  Trash2, 
  Calendar, 
  FileText, 
  HelpCircle, 
  AlertTriangle,
  Loader2,
  FileCode,
  Music,
  File as FileIcon
} from "lucide-react";

interface UploadedFile {
  mimeType: string;
  originalName: string;
}

interface Module {
  id: string;
  title: string;
  createdAt: string;
  _count: {
    files: number;
    exercises: number;
    fiches: number;
  };
  groups: { name: string }[];
  files: UploadedFile[];
}

export function ModuleLibraryClient() {
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const res = await fetch("/api/modules");
      const data = await res.json();
      if (Array.isArray(data)) {
        setModules(data);
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
      const res = await fetch(`/api/modules/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setModules(modules.filter(m => m.id !== id));
        setShowConfirm(null);
      } else {
        alert("Erreur lors de la suppression.");
      }
    } catch (error) {
      console.error("Erreur suppression:", error);
      alert("Une erreur est survenue.");
    } finally {
      setDeletingId(null);
    }
  };

  const getModuleIcon = (module: Module) => {
    if (module.files.length === 0) return <BookOpen size={24} />;
    const firstFile = module.files[0];
    if (firstFile.mimeType.includes("pdf")) return <FileCode size={24} className="text-red-400" />;
    if (firstFile.mimeType.includes("audio") || firstFile.mimeType.includes("mpeg")) return <Music size={24} className="text-blue-400" />;
    return <FileIcon size={24} />;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-safran" />
      </div>
    );
  }

  if (modules.length === 0) {
    return (
      <div className="glass-card p-12 text-center border-white/5">
        <BookOpen className="w-12 h-12 text-white/20 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Aucun module</h3>
        <p className="text-white/40">Commencez par générer votre premier module via l'onglet IA.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {modules.map((module) => (
        <div 
          key={module.id} 
          className="block group relative overflow-hidden rounded-[24px] border border-white/10 transition-all duration-500 hover:border-safran/50 hover:shadow-[0_20px_50px_rgba(251,191,36,0.15)] hover:-translate-y-1 hover:scale-[1.01]"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.03)" }}
        >
          <div className="p-6 flex items-center gap-6">
            {/* Clickable Info Area */}
            <a 
              href={`/catalogue/${module.id}`}
              className="flex-1 flex items-center gap-6 cursor-pointer"
            >
              {/* Type Icon Area */}
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-safran border border-white/5 shadow-inner">
                <BookOpen size={24} />
              </div>

              {/* Info Area */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-white truncate group-hover:text-safran transition-colors">
                    {module.title}
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/40 font-medium">
                  <span className="flex items-center gap-1.5 py-1 px-2 rounded-lg bg-white/5 border border-white/5">
                    <Calendar size={12} />
                    {new Date(module.createdAt).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric"
                    })}
                    
                    {/* Icone de Type à côté de la date */}
                    <div className="ml-1 pl-2 border-l border-white/10 flex items-center gap-1.5">
                      {module.files.length > 0 && module.files[0].mimeType.includes("pdf") ? (
                        <>
                          <FileText size={12} className="text-red-400" />
                          <span className="text-[10px]">PDF</span>
                        </>
                      ) : module.files.length > 0 && (module.files[0].mimeType.includes("audio") || module.files[0].mimeType.includes("mpeg")) ? (
                        <>
                          <Music size={12} className="text-blue-400" />
                          <span className="text-[10px]">AUDIO</span>
                        </>
                      ) : (
                        <BookOpen size={12} className="text-safran/60" />
                      )}
                    </div>
                  </span>
                  
                  <span className="flex items-center gap-1">
                    <FileText size={12} />
                    {module._count.fiches} fiches
                  </span>
                  <span className="flex items-center gap-1">
                    <HelpCircle size={12} />
                    {module._count.exercises} exercices
                  </span>
                </div>
              </div>
            </a>

            {/* Actions Area - Detached from the main link */}
            <div className="flex items-center gap-2 relative z-10">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowConfirm(module.id);
                }}
                disabled={deletingId === module.id}
                className="p-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all duration-300 pointer-events-auto"
                title="Supprimer le module"
              >
                {deletingId === module.id ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Trash2 size={20} />
                )}
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Global Centered Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div 
            className="absolute inset-0 bg-[#020617]/40 backdrop-blur-2xl"
            onClick={() => setShowConfirm(null)}
          />
          <div className="relative glass-card border-white/10 p-10 max-w-sm w-full text-center scale-100 animate-in zoom-in-95 duration-200 shadow-2xl">
            <div className="bg-red-500/20 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-red-500/30">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            
            <h4 className="text-2xl font-bold text-white mb-3 tracking-tight">Supprimer le module ?</h4>
            <p className="text-sm text-white/50 mb-8 leading-relaxed px-2">
              Cette action est <span className="text-red-400 font-bold">irréversible</span>. Les fichiers PDF/Audio seront définitivement effacés du serveur d'hébergement.
            </p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => handleDelete(showConfirm)}
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
                className="w-full py-4 rounded-2xl bg-white/5 text-white/60 font-medium hover:bg-white/10 hover:text-white transition-all"
              >
                Conserver le module
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
