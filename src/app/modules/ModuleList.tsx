"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, ArrowRight, Clock, FileText } from "lucide-react";

interface Module {
  id: string;
  title: string;
  description?: string;
  _count?: {
    files: number;
  };
  createdAt: string | Date;
}

export function ModuleList({ modules }: { modules: Module[] }) {
  if (!modules || modules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-white/5 rounded-[32px] border border-dashed border-white/10 text-center">
        <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center text-white/20 mb-6">
          <BookOpen size={40} />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Aucun module disponible</h3>
        <p className="text-white/40 max-w-md">
          Vous n&apos;avez pas encore de modules assignés. Contactez votre formateur pour plus d&apos;informations.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {modules.map((module, index) => (
        <motion.div
          key={module.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Link 
            href={`/catalogue/${module.id}`}
            className="group block relative p-6 bg-white/5 hover:bg-white/[0.08] border border-white/10 hover:border-[#0070FF]/50 rounded-[32px] transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,112,255,0.15)]"
          >
            {/* Gradient Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0070FF]/0 to-[#0070FF]/0 group-hover:from-[#0070FF]/5 group-hover:to-[#0070FF]/10 transition-all duration-500 rounded-[32px]" />

            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-[#0070FF]/10 flex items-center justify-center text-[#0070FF] mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                <BookOpen size={28} />
              </div>

              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#0070FF] transition-colors line-clamp-2 min-h-[3.5rem]">
                {module.title}
              </h3>

              <div className="flex items-center gap-4 text-white/40 text-xs font-semibold mb-8">
                <div className="flex items-center gap-1.5">
                  <FileText size={14} />
                  <span>{module._count?.files || 0} Docs</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={14} />
                  <span>{new Date(module.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <span className="text-[10px] uppercase tracking-widest font-black text-white/30 group-hover:text-[#0070FF]/50 transition-colors">
                  ACCÉDER AU MODULE
                </span>
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-[#0070FF] group-hover:text-white transition-all duration-500">
                  <ArrowRight size={18} />
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
