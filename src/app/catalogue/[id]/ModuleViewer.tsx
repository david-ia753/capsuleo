"use client";

import React, { useState } from "react";
import { 
  FileText, 
  PlayCircle, 
  BookOpen, 
  Maximize, 
  ArrowLeft, 
  Headphones, 
  LayoutDashboard, 
  Presentation, 
  CheckCircle2, 
  Circle, 
  XOctagon,
  LayoutGrid
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { toggleFileProgress } from "@/app/actions/progress";

interface ModuleViewerProps {
  module: any;
}

export default function ModuleViewer({ module }: ModuleViewerProps) {
  const fiches = module.fiches || [];
  const { data: session } = useSession();
  const isAdminOrTrainer = session?.user?.role === "ADMIN" || session?.user?.role === "TRAINER";

  const [activeView, setActiveView] = useState<'DASHBOARD' | 'FICHE' | 'READER'>('DASHBOARD');
  const [selectedFile, setSelectedFile] = useState<any>(null);
  
  // Local state for immediate feedback
  const [completedFileIds, setCompletedFileIds] = useState<string[]>(
    module.files?.filter((f: any) => f.progress?.[0]?.isCompleted).map((f: any) => f.id) || []
  );
  const [isToggling, setIsToggling] = useState<string | null>(null);

  const handleToggleComplete = async (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation();
    if (isToggling) return;
    
    const currentlyCompleted = completedFileIds.includes(fileId);
    const newState = !currentlyCompleted;
    
    setIsToggling(fileId);
    
    // Optimistic update
    setCompletedFileIds(prev => 
      newState ? [...prev, fileId] : prev.filter(id => id !== fileId)
    );

    try {
      const res = await toggleFileProgress(fileId, newState);
      if (res.error) {
        // Rollback
        setCompletedFileIds(prev => 
          currentlyCompleted ? [...prev, fileId] : prev.filter(id => id !== fileId)
        );
        alert(res.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsToggling(null);
    }
  };
  
  const handleFullscreen = () => {
    const elem = document.getElementById('reader-container');
    if (elem) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      }
    }
  };
  
  return (
    <div className="flex flex-col w-full min-h-screen bg-[#001D3A] text-white m-0 p-0 border-none">
      {/* Header Minimaliste */}
      <header className={`w-full relative z-20 m-0 p-0 transition-all duration-500 ${activeView === 'READER' ? 'py-4 px-6 opacity-80' : 'py-8 px-10'}`}>
        <div className="flex flex-row items-start justify-between w-full">
          <div className="flex flex-col gap-0 m-0 p-0 max-w-4xl">
            <h1 className="text-4xl font-black text-[#FFC800] leading-tight m-0 p-0 drop-shadow-md tracking-tighter">{module.title}</h1>
            <p className="text-sm font-medium text-white/50 leading-relaxed max-w-3xl m-0 mt-1">{module.objective}</p>
          </div>

          {/* Bouton de sortie */}
          <div className="flex-shrink-0">
            <Link 
              href={isAdminOrTrainer ? "/admin/modules" : "/catalogue"}
              className="group flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white border border-white/10 transition-all duration-300 font-black text-xs uppercase tracking-widest"
            >
              <LayoutGrid size={16} className="group-hover:rotate-12 transition-transform duration-500" />
              Retour au catalogue
            </Link>
          </div>
        </div>

        {activeView !== 'DASHBOARD' && (
          <div className="flex items-center justify-between w-full mt-6 pb-4 border-b border-white/10">
            <button 
              onClick={() => {
                setActiveView('DASHBOARD');
                setSelectedFile(null);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 hover:bg-[#0070FF]/10 font-bold text-sm text-white/70 hover:text-white transition-all border border-[#0070FF]/50 hover:shadow-[0_0_15px_rgba(0,112,255,0.5)]"
            >
              <ArrowLeft size={16} />
              Retour au sommaire
            </button>

            <div className="flex items-center gap-4">
               {activeView === 'READER' && ['COURS', 'PRESENTATION'].includes(selectedFile?.category) && (
                 <button
                   onClick={handleFullscreen}
                   className="flex items-center gap-2 p-2.5 px-4 rounded-xl bg-white/5 hover:bg-[#0070FF]/10 text-white/50 hover:text-white group transition-all border border-[#0070FF]/50 hover:shadow-[0_0_15px_rgba(0,112,255,0.5)]"
                   title="Plein écran"
                 >
                   <Maximize size={16} className="group-hover:scale-110 transition-transform group-hover:text-[#0070FF]"/>
                   <span className="text-xs font-bold hidden sm:block group-hover:text-white">Plein écran</span>
                 </button>
               )}
            </div>
          </div>
        )}
      </header>

      {/* Zone de Contenu Principale */}
      <main className="flex-1 w-full m-0 p-0 overflow-y-auto no-scrollbar flex flex-col relative z-10 border-none">
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,45,88,0.3),transparent)] pointer-events-none" />
        
        <div className="w-full h-full flex flex-col relative m-0 p-0 border-none z-10">
          
          {/* VUE DASHBOARD (Sommaire Interactif) */}
          {activeView === 'DASHBOARD' && (
            <div className="max-w-6xl mx-auto w-full px-4 lg:px-10 py-8">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0070FF] mb-6 flex items-center gap-2">
                 <LayoutDashboard size={14} /> Sommaire du Module
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Vignette Fiche de Cours */}
                {fiches.length > 0 && (
                  <button 
                    onClick={() => setActiveView('FICHE')}
                    className="flex flex-col items-start p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-[#0070FF]/50 hover:bg-[#0070FF]/5 hover:shadow-[0_0_30px_rgba(0,112,255,0.15)] transition-all group text-left"
                  >
                    <div className="p-4 rounded-2xl bg-[#0070FF]/10 text-[#0070FF] mb-6 group-hover:scale-110 transition-transform">
                      <BookOpen size={32} />
                    </div>
                    <h4 className="text-xl font-black text-white group-hover:text-[#0070FF] transition-colors mb-2">Cours Structuré</h4>
                    <p className="text-sm text-white/40">Fiche de synthèse générée par l'IA.</p>
                  </button>
                )}

                {/* Grid Dynamique pour TOUS les fichiers attachés */}
                {module.files?.map((file: any) => {
                  const fileNameStr = (file.name || "").toLowerCase();
                  const isAudio = file.category === 'AUDIO' || fileNameStr.includes('audio') || fileNameStr.includes('.m4a') || file.mimeType?.startsWith('audio/') || file.mimeType?.includes('m4a');
                  const isPresentation = file.category === 'PRESENTATION' || fileNameStr.includes('présentation') || fileNameStr.includes('presentation');
                  const isCompleted = completedFileIds.includes(file.id);
                  const isTogglingThis = isToggling === file.id;

                  return (
                    <div key={file.id} className="relative group/container">
                      <button 
                        onClick={() => {
                          setSelectedFile({ ...file, isAudio, isPresentation });
                          setActiveView('READER');
                        }}
                        className={`w-full flex flex-col items-start p-8 rounded-3xl bg-white/5 border transition-all group text-left ${
                          isCompleted 
                            ? 'border-green-500/40 bg-green-500/5' 
                            : 'border-white/10'
                        } hover:border-[#0070FF]/50 hover:bg-[#0070FF]/5 hover:shadow-[0_0_30px_rgba(0,112,255,0.15)]`}
                      >
                        <div className={`p-4 rounded-2xl mb-6 group-hover:scale-110 transition-all bg-white/5 text-white group-hover:text-[#0070FF]`}>
                          {isAudio ? <Headphones size={32} /> : isPresentation ? <Presentation size={32} /> : <FileText size={32} />}
                        </div>

                        <div className="flex justify-between items-start w-full gap-2">
                          <h4 className={`text-xl font-black text-white transition-colors mb-2 group-hover:text-[#0070FF]`}>
                            {file.name || (isAudio ? 'Podcast' : 'Document')}
                          </h4>
                          {isCompleted && (
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-[10px] font-black uppercase tracking-widest rounded-md">Vu</span>
                          )}
                        </div>
                        
                        <p className="text-sm text-white/40">
                          {isAudio ? 'Podcast audio' : isPresentation ? 'Support interactif' : 'Document de référence PDF'}
                        </p>
                      </button>

                      <button
                        onClick={(e) => handleToggleComplete(e, file.id)}
                        disabled={isTogglingThis}
                        className={`absolute top-4 right-4 px-4 py-2 rounded-xl transition-all z-20 flex items-center gap-2 border ${
                          isCompleted 
                            ? 'bg-green-500 text-white border-green-400 shadow-[0_0_20px_rgba(34,197,94,0.4)]' 
                            : 'bg-white/5 text-white/40 border-white/10 hover:text-white hover:bg-white/10 hover:border-white/20'
                        } ${isTogglingThis ? 'opacity-50 cursor-wait' : 'active:scale-95'}`}
                      >
                        {isTogglingThis ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : isCompleted ? (
                          <>
                            <CheckCircle2 size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Terminé</span>
                          </>
                        ) : (
                          <>
                            <Circle size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Marquer comme lu</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}

                {/* Empty State */}
                {fiches.length === 0 && (!module.files || module.files.length === 0) && (
                   <div className="col-span-full flex flex-col items-center justify-center p-12 mt-10 border-2 border-dashed border-white/10 rounded-3xl text-center">
                     <p className="text-white/40 mb-2">Ce module est en cours de création.</p>
                     <p className="text-sm text-white/20">Aucun contenu n'est encore disponible.</p>
                   </div>
                )}
              </div>
            </div>
          )}

          {/* VUE FICHE IA */}
          {activeView === 'FICHE' && fiches.length > 0 && (
            <div className="max-w-4xl mx-auto w-full p-8 md:p-16 text-white/90 space-y-12 pb-32">
              {fiches.map((fiche: any, index: number) => (
                <div key={fiche.id} className="prose prose-invert prose-safran max-w-none">
                  <h2 className="text-2xl font-black text-[#FFC800] mb-6 tracking-wide drop-shadow-md">
                    {fiche.title || `Partie ${index + 1}`}
                  </h2>
                  <div className="bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl backdrop-blur-sm whitespace-pre-wrap leading-relaxed text-lg font-medium text-white/80">
                    {fiche.content}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* VUE LECTEUR GÉNÉRIQUE */}
          {activeView === 'READER' && selectedFile && (
            <div id="reader-container" className="flex-1 flex flex-col w-full h-full relative p-0 m-0">
              {selectedFile.isAudio ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12">
                   <div className="w-48 h-48 rounded-full bg-gradient-to-tr from-[#FFC800] to-[#FF8000] flex items-center justify-center mb-12 shadow-[0_0_50px_rgba(255,200,0,0.3)] animate-pulse">
                      <Headphones size={80} className="text-[#001D3A]" />
                   </div>
                   <h2 className="text-3xl font-black text-white mb-6">{selectedFile.name || "Podcast du Module"}</h2>
                   <div className="w-full max-w-xl bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-md">
                     <audio controls controlsList="nodownload" className="w-full h-14">
                        <source src={selectedFile.path} type={selectedFile.mimeType} />
                     </audio>
                   </div>
                </div>
              ) : (
                <div className="w-full h-full m-0 p-0 border-none bg-white">
                  <iframe 
                    src={`${selectedFile.path}#toolbar=0&navpanes=0&scrollbar=0`} 
                    className="pdf-iframe w-full h-full border-none m-0 p-0 block bg-white"
                    title={selectedFile.name || "Lecteur Document"}
                    style={{ border: 'none', margin: 0, padding: 0, height: '90vh' }}
                  />
                  <div className="absolute inset-0 pointer-events-none" onContextMenu={(e) => e.preventDefault()} />
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <style jsx global>{`
        .pdf-iframe {
          width: 100% !important;
          height: 90vh !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
}
