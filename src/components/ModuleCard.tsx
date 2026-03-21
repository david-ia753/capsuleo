"use client";

import { 
  BookOpen, 
  Trash2, 
  Calendar, 
  FileText, 
  Loader2,
  FileCode,
  Music,
  File as FileIcon,
  GripVertical,
  User,
  Plus
} from "lucide-react";
import { Reorder, motion } from "framer-motion";
import { Module } from "@/types";

interface ModuleCardProps {
  module: Module;
  isReordering: boolean;
  asReorderItem?: boolean;
  onDelete: (id: string) => void;
  deletingId: string | null;
  setShowConfirm: (id: string) => void;
  onAssign?: (id: string, title: string) => void;
}

export default function ModuleCard({
  module,
  isReordering,
  asReorderItem = true,
  onDelete,
  deletingId,
  setShowConfirm,
  onAssign
}: ModuleCardProps) {
  const getModuleIcon = (module: Module) => {
    if (!module.files || module.files.length === 0) return <BookOpen size={24} />;
    const firstFile = module.files[0];
    if (firstFile.mimeType.includes("pdf")) return <FileCode size={24} className="text-red-400" />;
    if (firstFile.mimeType.includes("audio") || firstFile.mimeType.includes("mpeg")) return <Music size={24} className="text-blue-400" />;
    return <FileIcon size={24} />;
  };

  const commonClassName = `block group relative overflow-hidden rounded-[24px] border transition-all duration-300 ${
    isReordering 
      ? "border-[#00f2ff] bg-white/5 cursor-grab active:cursor-grabbing" 
      : "border-white/10 hover:border-[#0070FF]/50 hover:shadow-[0_20px_50px_rgba(0,112,255,0.15)] hover:-translate-y-0.5 hover:scale-[1.002]"
  }`;
  const commonStyle = { backgroundColor: isReordering ? "rgba(0, 242, 255, 0.05)" : "rgba(255, 255, 255, 0.03)" };

  const Content = (
    <div className="p-6 flex items-center gap-6">
      {isReordering && <div className="text-[#00f2ff] -ml-2"><GripVertical size={20} /></div>}
      
      <a 
        href={isReordering ? "#" : `/catalogue/${module.id}`}
        onClick={(e) => isReordering && e.preventDefault()}
        className={`flex-1 flex items-center gap-6 ${isReordering ? "cursor-grab" : "cursor-pointer"}`}
      >
        <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-[#0070FF] border border-white/5 shadow-inner transition-colors ${isReordering ? "bg-[#00f2ff]/10 border-[#00f2ff]/20" : ""}`}>
          {getModuleIcon(module)}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-white truncate group-hover:text-[#0070FF] transition-colors mb-1">
            {module.title}
          </h3>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/40 font-medium">
            <span className="flex items-center gap-1.5 py-1 px-2 rounded-lg bg-white/5 border border-white/5">
              <Calendar size={12} />
              {new Date(module.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
            </span>
            <span className="flex items-center gap-1"><FileText size={12} /> {module._count?.files || 0} documents</span>
            {module.creator?.name && (
              <span className="flex items-center gap-1.5 py-1 px-2 rounded-lg bg-[#0070FF]/5 border border-[#0070FF]/10 text-[#0070FF]/80">
                <User size={12} /> {module.creator.name}
              </span>
            )}
          </div>
        </div>
      </a>

      <div className="flex items-center gap-2 relative z-10">
         {!isReordering && (
           <div className="flex items-center gap-2">
             {onAssign && (
               <button 
                 onClick={() => onAssign(module.id, module.title)}
                 className="p-3 rounded-xl bg-[#0070FF]/10 text-[#0070FF] border border-[#0070FF]/20 hover:bg-[#0070FF] hover:text-white transition-all duration-300 group/btn"
                 title="Assigner à un groupe"
               >
                 <Plus size={20} className="group-hover/btn:rotate-90 transition-transform duration-300" />
               </button>
             )}
             <button 
               onClick={() => setShowConfirm(module.id)}
               disabled={deletingId === module.id}
               className="p-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all duration-300"
             >
               {deletingId === module.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 size={20} />}
             </button>
           </div>
         )}
      </div>
    </div>
  );

  if (asReorderItem) {
    return (
      <Reorder.Item 
        key={module.id} 
        value={module}
        dragListener={isReordering}
        layout
        dragElastic={0.2}
        className={commonClassName}
        style={commonStyle}
      >
        {Content}
      </Reorder.Item>
    );
  }

  return (
    <motion.div 
      key={module.id}
      layout
      className={commonClassName}
      style={commonStyle}
    >
      {Content}
    </motion.div>
  );
}
