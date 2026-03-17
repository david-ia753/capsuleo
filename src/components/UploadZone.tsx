"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Upload, CheckCircle, AlertCircle, X, ArrowRight } from "lucide-react";

interface FileItem {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
  serverId?: string;
}

const ACCEPTED_TYPES = {
  "application/pdf": "PDF",
  "audio/mpeg": "Audio",
  "audio/mp3": "Audio",
  "audio/wav": "Audio",
  "audio/ogg": "Audio",
  "audio/x-m4a": "Audio",
  "audio/mp4": "Audio",
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " o";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " Ko";
  return (bytes / (1024 * 1024)).toFixed(1) + " Mo";
}

interface UploadZoneProps {
  defaultGroupId?: string;
}

export default function UploadZone({ defaultGroupId }: UploadZoneProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewData, setReviewData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const validFiles: FileItem[] = [];

    for (const file of fileArray) {
      if (!(file.type in ACCEPTED_TYPES)) {
        alert(`Fichier "${file.name}" refusé : type non supporté`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        alert(`Fichier "${file.name}" refusé : taille max 50 Mo`);
        continue;
      }
      validFiles.push({
        id: crypto.randomUUID(),
        file,
        progress: 0,
        status: "pending",
      });
    }

    setFiles((prev) => [...prev, ...validFiles]);
  }, []);

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const retryFile = async (id: string) => {
    const fileItem = files.find((f) => f.id === id);
    if (!fileItem) return;

    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: "uploading", progress: 10, error: undefined } : f))
    );

    try {
      const formData = new FormData();
      formData.append("file", fileItem.file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error(`Échec (Code ${response.status})`);

      const result = await response.json();
      
      setFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status: "done", progress: 100, serverId: result.fileId } : f))
      );
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erreur";
      setFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status: "error", error: errorMsg } : f))
      );
    }
  };

  const uploadAll = async () => {
    const groupSelect = document.querySelector('select[name="groupId"]') as HTMLSelectElement;
    const groupId = groupSelect?.value || defaultGroupId;

    let hasErrors = false;

    // 1. Upload Séquentiel pour les fichiers non encore chargés
    // On utilise une copie pour éviter les problèmes de closure pendant la boucle
    const currentFiles = [...files];
    
    for (const fileItem of currentFiles) {
      if (fileItem.status === "done") continue;

      setFiles((prev) =>
        prev.map((f) => (f.id === fileItem.id ? { ...f, status: "uploading", progress: 10 } : f))
      );

      try {
        const formData = new FormData();
        formData.append("file", fileItem.file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error(`Échec (Code ${response.status})`);

        const result = await response.json();
        
        // Mise à jour de l'état avec l'ID serveur
        setFiles((prev) =>
          prev.map((f) => (f.id === fileItem.id ? { ...f, status: "done", progress: 100, serverId: result.fileId } : f))
        );
        fileItem.status = "done";
        fileItem.serverId = result.fileId;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Erreur";
        setFiles((prev) =>
          prev.map((f) => (f.id === fileItem.id ? { ...f, status: "error", error: errorMsg } : f))
        );
        hasErrors = true;
        // On s'arrête en cas d'erreur sur un fichier pour que l'utilisateur puisse "Réessayer"
        return;
      }
    }

    if (hasErrors) return;

    // 2. Synthèse Globale une fois que TOUS les fichiers sont "done"
    const finalFiles = currentFiles.filter(f => f.status === "done" || f.serverId);
    const serverIds = finalFiles.map(f => f.serverId).filter(Boolean) as string[];

    if (serverIds.length === 0) return;

    setIsRedirecting(true);
    setIsSynthesizing(true);
    
    try {
      const synthResponse = await fetch("/api/upload/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileIds: serverIds })
      });

      if (!synthResponse.ok) throw new Error("Échec de la synthèse IA");

      const synthResult = await synthResponse.json();

      setReviewData({
        fileIds: serverIds,
        groupId: groupId,
        title: synthResult.aiData?.title || "Nouveau Module",
        objective: synthResult.aiData?.objective || "Généré par Capsuléo IA",
        description: synthResult.aiData?.shortDescription || (synthResult.aiData?.objective ? synthResult.aiData.objective.substring(0, 100) : ""),
        exercises: synthResult.aiData?.exercises || [],
        thumbnailPrompt: synthResult.aiData?.thumbnailPrompt || synthResult.aiData?.title || ""
      });

      setIsReviewing(true);
    } catch (err) {
      alert("La synthèse globale a échoué. Veuillez remplir les infos manuellement.");
      setReviewData({
        fileIds: serverIds,
        groupId: groupId,
        title: "Nouveau Module",
        description: "",
        objective: "",
        exercises: [],
        thumbnailPrompt: ""
      });
      setIsReviewing(true);
    } finally {
      setIsSynthesizing(false);
      setIsRedirecting(false);
    }
  };

  const saveModule = async () => {
    if (!reviewData) return;
    setIsSaving(true);
    try {
      const response = await fetch("/api/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewData)
      });

      if (!response.ok) throw new Error("Échec de la sauvegarde");

      setIsRedirecting(true);
      setTimeout(() => {
        router.push("/admin/modules");
        router.refresh();
      }, 1000);
    } catch (err) {
      alert("Erreur lors de la création du module");
    } finally {
      setIsSaving(false);
    }
  };

  const pendingCount = files.filter((f) => f.status === "pending" || f.status === "error").length;

  if (isReviewing && reviewData) {
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
              onClick={() => setIsReviewing(false)} 
              className="text-white/40 hover:text-white font-bold text-sm transition-colors"
            >
              Annuler et revenir
            </button>
            
            <button 
              onClick={saveModule}
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

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Zone de drop */}
      <div
        className={`upload-zone ${isDragOver ? "dragover" : ""} group`}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragOver(false); if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,audio/*"
          multiple
          onChange={(e) => { if (e.target.files?.length) addFiles(e.target.files); e.target.value = ""; }}
          className="hidden"
        />
        
        <div className="mb-6 flex justify-center">
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-500">
            <Upload size={48} className="text-[#FFC800] drop-shadow-[0_0_15px_rgba(255,200,0,0.5)]" />
          </div>
        </div>
        
        <h3 className="text-2xl font-black text-white mb-2">Déposez vos formations ici</h3>
        <p className="text-white/40 font-medium mb-8">Glissez-déposez ou cliquez pour explorer vos fichiers</p>
        
        <div className="flex flex-wrap justify-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-[#FFC800]/60">
          <span className="px-4 py-2 rounded-full border border-[#FFC800]/20 bg-[#FFC800]/5">PDF</span>
          <span className="px-4 py-2 rounded-full border border-[#FFC800]/20 bg-[#FFC800]/5">MP3</span>
          <span className="px-4 py-2 rounded-full border border-[#FFC800]/20 bg-[#FFC800]/5">M4A</span>
        </div>
      </div>

      {/* Liste des fichiers */}
      {files.length > 0 && (
        <div className="mt-12 space-y-4">
          {files.map((fileItem) => (
            <div key={fileItem.id} className="upload-file-item glass-card p-6 flex items-center gap-6 group overflow-hidden">
              <div className={`p-4 rounded-xl ${fileItem.file.type === "application/pdf" ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"}`}>
                {fileItem.file.type === "application/pdf" ? "PDF" : "IA"}
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-bold text-white line-clamp-1">{fileItem.file.name}</p>
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{formatFileSize(fileItem.file.size)}</span>
                </div>
                
                {fileItem.status === "uploading" ? (
                  <div className="progress-bar w-full h-1.5">
                    <div className="progress-fill" style={{ width: `${fileItem.progress}%` }} />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {fileItem.status === "done" && <><CheckCircle size={14} className="text-green-500" /> <span className="text-xs font-bold text-green-500/80">Analysé</span></>}
                    {fileItem.status === "error" && (
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-red-500">
                          <AlertCircle size={14} /> 
                          <span className="text-xs font-bold">{fileItem.error}</span>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); retryFile(fileItem.id); }}
                          className="text-[10px] font-black uppercase tracking-widest text-[#FFC800] hover:underline"
                        >
                          Réessayer
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {fileItem.status !== "uploading" && (
                <button onClick={(e) => { e.stopPropagation(); removeFile(fileItem.id); }} className="p-2 text-white/20 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              )}
            </div>
          ))}

          {/* Actions */}
          {files.length > 0 && !isReviewing && (
            <div className="flex justify-center pt-8">
              <button 
                id="upload-all-btn" 
                onClick={uploadAll}
                disabled={isSynthesizing || files.some(f => f.status === "uploading")}
                className="w-full max-w-sm px-10 py-6 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-4 hover:scale-105 transition-all bg-[#fbbf24] text-[#132E53] border-2 border-blue-500/50 hover:border-[#0070FF] hover:shadow-[0_0_30px_rgba(0,112,255,0.6)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSynthesizing ? (
                  <>SYNTHÈSE IA EN COURS <div className="w-5 h-5 border-2 border-[#132E53] border-t-transparent rounded-full animate-spin" /></>
                ) : files.every(f => f.status === "done") ? (
                  <>LANCER LA SYNTHÈSE IA <ArrowRight size={20} /></>
                ) : (
                  <>
                    <Upload size={20} />
                    LANCER L'INTÉGRATION ({pendingCount})
                  </>
                )}
              </button>
            </div>
          )}

          {isRedirecting && !isReviewing && !isSynthesizing && (
            <div className="flex flex-col items-center justify-center pt-8 animate-pulse text-[#FFC800]">
              <div className="flex items-center gap-4 font-black uppercase tracking-[0.3em]">
                Opération en cours...
                <div className="w-6 h-6 border-4 border-[#FFC800] border-t-transparent rounded-full animate-spin" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
