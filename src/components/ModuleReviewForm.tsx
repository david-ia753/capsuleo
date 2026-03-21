"use client";

import { CheckCircle, ArrowRight } from "lucide-react";

interface ModuleReviewFormProps {
  reviewData: any;
  setReviewData: (data: any) => void;
  onCancel: () => void;
  onSave: () => void;
  isSaving: boolean;
  isRedirecting: boolean;
}

export default function ModuleReviewForm({
  reviewData,
  setReviewData,
  onCancel,
  onSave,
  isSaving,
  isRedirecting
}: ModuleReviewFormProps) {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="glass-card p-10 border-[#FFC800]/20 shadow-[0_0_50px_rgba(255,200,0,0.1)]">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#FFC800]/10 flex items-center justify-center border border-[#FFC800]/20">
            <CheckCircle size={24} className="text-[#FFC800]" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white">Analyse de l'IA terminée</h3>
            <p className="text-white/40 font-medium">Validez ou modifiez les informations de votre nouveau module</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black uppercase text-[#FFC800]/60 tracking-widest block mb-2">Titre du Module</label>
              <input 
                type="text" 
                value={reviewData.title}
                onChange={(e) => setReviewData({...reviewData, title: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-bold focus:outline-none focus:border-[#FFC800]/40 transition-colors"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-[#FFC800]/60 tracking-widest block mb-2">Description Courte</label>
              <textarea 
                value={reviewData.description}
                onChange={(e) => setReviewData({...reviewData, description: e.target.value})}
                rows={2}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-medium focus:outline-none focus:border-[#FFC800]/40 transition-colors resize-none"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black uppercase text-[#FFC800]/60 tracking-widest block mb-2">Objectif Pédagogique</label>
              <textarea 
                value={reviewData.objective}
                onChange={(e) => setReviewData({...reviewData, objective: e.target.value})}
                rows={6}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-medium focus:outline-none focus:border-[#FFC800]/40 transition-colors resize-none"
              />
            </div>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-between pt-8 border-t border-white/5">
          <button 
            onClick={onCancel} 
            className="text-white/40 hover:text-white font-bold text-sm transition-colors"
          >
            Annuler et revenir
          </button>
          
          <button 
            onClick={onSave}
            disabled={isSaving || isRedirecting}
            className="px-10 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center gap-4 hover:scale-105 transition-all text-sm bg-[#fbbf24] text-[#132E53] border-2 border-blue-500/50 hover:border-[#0070FF] hover:shadow-[0_0_30px_rgba(0,112,255,0.6)]"
          >
            {isSaving ? (
              <>GÉNÉRATION EN COURS <div className="w-5 h-5 border-2 border-[#132E53] border-t-transparent rounded-full animate-spin" /></>
            ) : (
              <>VALIDER LE MODULE <ArrowRight size={20} /></>
            )}
          </button>
        </div>
      </div>

      {isRedirecting && (
        <div className="flex flex-col items-center justify-center animate-pulse text-[#FFC800]">
          <div className="flex items-center gap-4 font-black uppercase tracking-[0.3em]">
            Module Créé avec Succès !
          </div>
        </div>
      )}
    </div>
  );
}
