"use client";

import { CheckCircle, AlertCircle, X } from "lucide-react";
import { FileItem } from "@/types";

interface FileUploadItemProps {
  fileItem: FileItem;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
  formatFileSize: (bytes: number) => string;
}

export default function FileUploadItem({
  fileItem,
  onRemove,
  onRetry,
  formatFileSize
}: FileUploadItemProps) {
  return (
    <div className="upload-file-item glass-card p-6 flex items-center gap-6 group overflow-hidden">
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
                  onClick={(e) => { e.stopPropagation(); onRetry(fileItem.id); }}
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
        <button onClick={(e) => { e.stopPropagation(); onRemove(fileItem.id); }} className="p-2 text-white/20 hover:text-white transition-colors">
          <X size={20} />
        </button>
      )}
    </div>
  );
}
