"use client";

import React, { useState, useEffect } from "react";
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
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { toggleFileProgress } from "@/app/actions/progress";

interface ModuleViewerProps {
  module: any;
}

export default function ModuleViewer({ module }: ModuleViewerProps) {
  const fiches = module.fiches || [];
  const files = module.files || [];
  const { data: session } = useSession();
  const isAdminOrTrainer = session?.user?.role === "ADMIN" || session?.user?.role === "TRAINER";

  const [activeView, setActiveView] = useState<'DASHBOARD' | 'FICHE' | 'READER'>('DASHBOARD');
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [isNavOpen, setIsNavOpen] = useState(false);
  
  // Local state for immediate feedback
  const [completedFileIds, setCompletedFileIds] = useState<string[]>(
    files.filter((f: any) => f.progress?.[0]?.isCompleted).map((f: any) => f.id) || []
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
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else if (elem.requestFullscreen) {
        elem.requestFullscreen();
      }
    }
  };

  const currentIndex = files.findIndex((f: any) => f.id === selectedFile?.id);
  const prevFile = currentIndex > 0 ? files[currentIndex - 1] : null;
  const nextFile = currentIndex < files.length - 1 ? files[currentIndex + 1] : null;

  const navigateToFile = (file: any) => {
    const fileNameStr = (file.name || file.filename || "").toLowerCase();
    const isAudio = file.category === 'AUDIO' || fileNameStr.includes('audio') || fileNameStr.includes('.m4a') || file.mimeType?.startsWith('audio/') || file.mimeType?.includes('m4a');
    const isPresentation = file.category === 'PRESENTATION' || fileNameStr.includes('présentation') || fileNameStr.includes('presentation');
    setSelectedFile({ ...file, isAudio, isPresentation });
    setActiveView('READER');
    setIsNavOpen(false);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#020617] text-white m-0 p-0 overflow-hidden">
      {/* 1. Header Global */}
      <header className={`w-full relative z-20 transition-all duration-500 overflow-hidden ${
        activeView === 'READER' ? 'h-0 opacity-0 pointer-events-none' : 'py-8 px-4 md:px-10'
      }`}>
        <div className="flex items-start justify-between w-full max-w-7xl mx-auto">
          <div className="flex flex-col gap-1 pr-4">
             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#fbbf24] mb-1 opacity-70">Module de formation</h3>
            <h1 className="text-2xl md:text-4xl font-black text-white leading-tight m-0 p-0 drop-shadow-md tracking-tighter">{module.title}</h1>
            <p className="text-sm font-medium text-white/50 leading-relaxed max-w-2xl mt-2 line-clamp-2 md:line-clamp-none">{module.objective}</p>
          </div>

          <div className="flex-shrink-0">
            <Link 
              href={isAdminOrTrainer ? "/admin/modules" : "/catalogue"}
              className="group flex items-center gap-2 px-4 py-2.5 md:px-6 md:py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white border border-white/10 transition-all duration-300 font-black text-[10px] md:text-xs uppercase tracking-widest whitespace-nowrap"
            >
              <LayoutGrid size={16} className="group-hover:rotate-12 transition-transform duration-500" />
              <span className="hidden sm:inline">Quitter</span>
              <span className="sm:hidden">Retour</span>
            </Link>
          </div>
        </div>

        {activeView === 'FICHE' && (
          <div className="max-w-7xl mx-auto w-full mt-6 pb-4">
            <button 
              onClick={() => setActiveView('DASHBOARD')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 hover:bg-[#0070FF]/10 font-bold text-sm text-white/70 hover:text-white transition-all border border-white/10"
            >
              <ArrowLeft size={16} />
              Sommaire
            </button>
          </div>
        )}
      </header>

      {/* 2. READER MODE: Internal Layout */}
      {activeView === 'READER' && (
        <div className="fixed inset-0 w-full h-screen overflow-hidden z-[1000] flex flex-col md:flex-row animate-in fade-in duration-500">
          {/* Background Layer (Synchronized with RootLayout) */}
          <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden h-full w-full">
            <div className="absolute inset-0 bg-[#020617]" />
            <div 
              className="absolute inset-0" 
              style={{ background: "radial-gradient(circle at center, #1e3a8a 0%, #020617 100%)" }} 
            />
            <div className="absolute inset-0 z-0 opacity-50 blur-[130px]">
              <div className="absolute top-[10%] left-[20%] w-[45vw] h-[45vw] rounded-full bg-blue-600/40 animate-pulse" />
              <div className="absolute bottom-[20%] right-[10%] w-[55vw] h-[55vw] rounded-full bg-[#fbbf24]/20 animate-pulse delay-1000" />
              <div className="absolute top-[40%] right-[30%] w-[35vw] h-[35vw] rounded-full bg-cyan-400/20 animate-pulse delay-700" />
            </div>
          </div>
          
          {/* Internal Sidebar Overlay for Mobile */}
          {isNavOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[90] md:hidden" onClick={() => setIsNavOpen(false)} />
          )}

          {/* Internal Sidebar */}
          <aside className={`fixed md:relative inset-y-0 left-0 z-[100] w-72 bg-[#0b1120]/40 backdrop-blur-xl border-r border-white/10 transition-transform duration-300 transform ${
            isNavOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}>
            <div className="flex flex-col h-full overflow-hidden">
              <div className="p-6 border-b border-white/10 flex items-center justify-between flex-shrink-0">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-[#fbbf24]">Sommaire</h4>
                  <p className="text-xs font-bold text-white/40 truncate w-48">{module.title}</p>
                </div>
                <button onClick={() => setIsNavOpen(false)} className="md:hidden p-2 text-white/50"><X size={20} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
                {fiches.length > 0 && (
                  <button 
                    onClick={() => { setActiveView('FICHE'); setIsNavOpen(false); }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left group"
                  >
                    <BookOpen size={18} className="text-[#0070FF]" />
                    <span className="text-sm font-bold text-white/70 group-hover:text-white">Fiche de cours</span>
                  </button>
                )}
                {files.map((file: any) => {
                  const isCur = selectedFile?.id === file.id;
                  const isDone = completedFileIds.includes(file.id);
                  return (
                    <button 
                      key={file.id}
                      onClick={() => navigateToFile(file)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group ${
                        isCur ? 'bg-[#0070FF] text-white' : 'hover:bg-white/5'
                      }`}
                    >
                      <div className={isCur ? 'text-white' : 'text-white/30'}>
                        {file.category === 'AUDIO' ? <Headphones size={18} /> : 
                         (file.category === 'PRESENTATION' ? <Presentation size={18} /> : <FileText size={18} />)}
                      </div>
                      <span className={`text-sm font-bold flex-1 truncate ${isCur ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>
                        {file.name || file.originalName}
                      </span>
                      {isDone && <CheckCircle2 size={14} className={isCur ? 'text-white/80' : 'text-green-500'} />}
                    </button>
                  );
                })}
              </div>
              <div className="p-4 border-t border-white/10 flex-shrink-0">
                <button 
                  onClick={() => setActiveView('DASHBOARD')}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 text-[10px] font-black uppercase tracking-widest transition-all border border-white/5"
                >
                  <LayoutDashboard size={14} /> Sommaire Global
                </button>
              </div>
            </div>
          </aside>

          {/* Reader Content Area */}
          <div className="flex-1 flex flex-col relative h-full bg-black overflow-hidden">
            {/* Internal Top Bar */}
            <div className="h-16 px-4 flex items-center justify-between border-b border-white/10 bg-[#020617] z-20 flex-shrink-0">
              <div className="flex items-center gap-4 flex-1 overflow-hidden mr-4">
                <button onClick={() => setIsNavOpen(true)} className="md:hidden p-2 bg-white/5 border border-white/10 rounded-lg text-white/50"><Menu size={20} /></button>
                <div className="overflow-hidden">
                  <h2 className="text-sm font-black text-white truncate max-w-[200px] lg:max-w-md">
                    {selectedFile?.name || selectedFile?.originalName || "Lecteur"}
                  </h2>
                  <div className="flex items-center gap-2">
                    {completedFileIds.includes(selectedFile?.id) ? (
                      <span className="text-[10px] text-green-500 font-bold flex items-center gap-1"><CheckCircle2 size={10} /> Consulté</span>
                    ) : (
                      <button 
                        onClick={(e) => handleToggleComplete(e, selectedFile?.id)}
                        className="text-[10px] text-[#fbbf24] hover:underline font-bold"
                      >
                        {isToggling === selectedFile?.id ? "En cours..." : "Marquer comme vu"}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="hidden sm:flex bg-white/5 rounded-xl p-1 border border-white/10 mr-2">
                  <button 
                    disabled={!prevFile}
                    onClick={() => navigateToFile(prevFile)}
                    className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-20 transition-all text-white/70"
                    title="Précédent"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    disabled={!nextFile}
                    onClick={() => navigateToFile(nextFile)}
                    className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-20 transition-all text-white/70"
                    title="Suivant"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
                <button onClick={handleFullscreen} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-white/50 hover:text-white" title="Plein écran"><Maximize size={20} /></button>
                <button 
                  onClick={() => setActiveView('DASHBOARD')}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-red-500/10 text-white/30 hover:text-red-500 border border-white/10 transition-all ml-1"
                  title="Fermer"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Actual Content Container */}
            <div id="reader-container" className="flex-1 w-full h-full relative bg-white overflow-hidden">
              {selectedFile?.isAudio ? (
                <div className="w-full h-full bg-[#020617] flex flex-col items-center justify-center p-8 md:p-12 overflow-y-auto">
                   <div className="w-40 h-40 md:w-48 md:h-48 rounded-3xl bg-gradient-to-tr from-[#FFC800] to-[#FF8000] flex items-center justify-center mb-10 shadow-[0_20px_50px_rgba(255,200,0,0.2)] flex-shrink-0">
                      <Headphones size={80} className="text-[#020617] md:w-20 md:h-20" />
                   </div>
                   <h3 className="text-xl md:text-2xl font-black text-white mb-8 text-center px-4 line-clamp-2">{selectedFile.name || selectedFile.originalName}</h3>
                   <div className="w-full max-w-lg bg-white/5 p-6 md:p-8 rounded-3xl border border-white/10 backdrop-blur-sm">
                      <audio controls className="w-full h-12">
                         <source src={selectedFile.path} type={selectedFile.mimeType} />
                      </audio>
                   </div>
                </div>
              ) : (
                <div className="w-full h-full relative group">
                  <iframe 
                    src={`${selectedFile?.path}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`} 
                    className="w-full h-full border-none m-0 p-0 block bg-white"
                    title={selectedFile?.name || selectedFile?.originalName || "Lecteur"}
                  />
                  {/* Bottom bar for mobile nav when in portrait or small screens */}
                  <div className="sm:hidden fixed bottom-4 left-1/2 -translate-x-1/2 flex bg-[#020617]/90 backdrop-blur-xl rounded-2xl p-2 border border-white/20 shadow-2xl z-50 gap-4">
                    <button 
                      disabled={!prevFile}
                      onClick={() => navigateToFile(prevFile)}
                      className="p-3 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-20 text-white"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button 
                      disabled={!nextFile}
                      onClick={() => navigateToFile(nextFile)}
                      className="p-3 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-20 text-white"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Zone de Contenu Principale (DASHBOARD & FICHE) */}
      <main className={`flex-1 w-full m-0 p-0 overflow-y-auto no-scrollbar relative z-10 ${
        activeView === 'READER' ? 'hidden' : 'flex flex-col'
      }`}>
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,112,255,0.1),transparent)] pointer-events-none" />
        
        <div className="w-full h-full flex flex-col relative m-0 p-0 z-10">
          
          {/* DASHBOARD VIEW */}
          {activeView === 'DASHBOARD' && (
            <div className="max-w-7xl mx-auto w-full px-4 md:px-10 py-6 md:py-10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0070FF] flex items-center gap-2">
                   <LayoutDashboard size={14} /> Sommaire du Module
                </h3>
                <div className="h-px flex-1 bg-white/5 ml-4 hidden sm:block"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {/* Cours Card */}
                {fiches.length > 0 && (
                  <button 
                    onClick={() => setActiveView('FICHE')}
                    className="flex flex-col items-start p-6 md:p-8 rounded-[32px] bg-white/5 border border-white/10 hover:border-[#0070FF]/50 hover:bg-[#0070FF]/5 transition-all group text-left relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <BookOpen size={120} />
                    </div>
                    <div className="p-4 rounded-2xl bg-[#0070FF]/10 text-[#0070FF] mb-6 group-hover:scale-110 transition-transform">
                      <BookOpen size={30} />
                    </div>
                    <h4 className="text-xl font-black text-white group-hover:text-[#0070FF] transition-colors mb-2">Cours théorique</h4>
                    <p className="text-sm text-white/40 leading-relaxed">Contenu pédagogique structuré par l'IA.</p>
                  </button>
                )}

                {/* Files Cards */}
                {files.map((file: any) => {
                  const fileNameStr = (file.name || file.filename || "").toLowerCase();
                  const isAudio = file.category === 'AUDIO' || fileNameStr.includes('audio') || fileNameStr.includes('.m4a') || file.mimeType?.startsWith('audio/') || file.mimeType?.includes('m4a');
                  const isPresentation = file.category === 'PRESENTATION' || fileNameStr.includes('présentation') || fileNameStr.includes('presentation');
                  const isDone = completedFileIds.includes(file.id);

                  return (
                    <div key={file.id} className="relative group/container h-full">
                      <button 
                        onClick={() => navigateToFile(file)}
                        className={`w-full flex flex-col items-start p-6 md:p-8 rounded-[32px] bg-white/5 border transition-all group text-left h-full ${
                          isDone ? 'border-green-500/30' : 'border-white/10'
                        } hover:border-[#0070FF]/50 hover:bg-[#0070FF]/5`}
                      >
                        <div className={`p-4 rounded-2xl mb-6 group-hover:scale-110 transition-all bg-white/5 text-white group-hover:text-[#0070FF]`}>
                          {isAudio ? <Headphones size={30} /> : isPresentation ? <Presentation size={30} /> : <FileText size={30} />}
                        </div>

                        <div className="flex flex-col w-full">
                          <h4 className="text-xl font-black text-white group-hover:text-[#0070FF] transition-colors mb-1 line-clamp-2 w-full pr-8">
                            {file.name || file.originalName}
                          </h4>
                          <span className="text-xs font-bold text-white/30 uppercase tracking-widest">
                             {isAudio ? 'Podcast' : isPresentation ? 'Support' : 'Document PDF'}
                          </span>
                        </div>
                      </button>

                      <button
                        onClick={(e) => handleToggleComplete(e, file.id)}
                        className={`absolute top-6 right-6 w-10 h-10 rounded-xl flex items-center justify-center transition-all z-20 border ${
                          isDone 
                            ? 'bg-green-500 text-white border-green-400 shadow-[0_5px_15px_rgba(34,197,94,0.3)]' 
                            : 'bg-white/5 text-white/20 border-white/10 hover:text-white hover:border-white/30'
                        }`}
                        title={isDone ? "Marquer comme non lu" : "Marquer comme lu"}
                      >
                        {isToggling === file.id ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : isDone ? (
                          <CheckCircle2 size={20} />
                        ) : (
                          <Circle size={20} />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* FICHE VIEW */}
          {activeView === 'FICHE' && (
            <div className="max-w-4xl mx-auto w-full px-4 md:px-10 py-8 md:py-12 space-y-12 pb-32">
              <div className="text-center space-y-4 mb-16 md:mb-20">
                <span className="text-xs font-black text-[#fbbf24] uppercase tracking-[0.3em]">Lecture Optimisée</span>
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter italic">Cours de Synthèse</h2>
                <div className="w-24 h-1 bg-[#fbbf24] mx-auto rounded-full"></div>
              </div>

              {fiches.map((fiche: any, index: number) => (
                <div key={fiche.id} className="relative">
                   <div className="absolute -left-4 md:-left-12 top-0 text-5xl md:text-6xl font-black text-white/5 select-none">{index + 1}</div>
                   <h3 className="text-xl md:text-2xl font-black text-[#fbbf24] mb-6 flex items-center gap-4">
                     <span className="w-8 h-8 rounded-lg bg-[#fbbf24]/10 flex items-center justify-center text-xs md:text-sm">{index + 1}</span>
                     {fiche.title}
                   </h3>
                   <div className="bg-white/5 border border-white/10 p-6 md:p-12 rounded-[32px] md:rounded-[40px] shadow-2xl backdrop-blur-sm whitespace-pre-wrap leading-relaxed text-base md:text-lg font-medium text-white/80 border-l-4 border-l-[#fbbf24]">
                    {fiche.content}
                   </div>
                </div>
              ))}
              
              <div className="pt-10 flex justify-center">
                 <button 
                  onClick={() => setActiveView('DASHBOARD')}
                  className="px-8 md:px-10 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 font-black text-xs uppercase tracking-widest transition-all"
                 >
                   Sommaire global
                 </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
