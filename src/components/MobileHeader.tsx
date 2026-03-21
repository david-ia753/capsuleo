"use client";

import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

interface MobileHeaderProps {
  onMenuClick: () => void;
  isOpen: boolean;
}

export function MobileHeader({ onMenuClick, isOpen }: MobileHeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={`lg:hidden fixed top-0 left-0 right-0 z-[900] transition-all duration-300 border-b ${
        scrolled 
          ? "bg-[#0b1120]/80 backdrop-blur-xl border-white/10 py-3" 
          : "bg-transparent border-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-safran flex items-center justify-center shadow-[0_0_15px_rgba(251,191,36,0.2)]">
            <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 34V18L24 12L34 18V34" stroke="#020617" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-xl font-black bg-gradient-to-b from-[#132E53] to-[#0070FF] bg-clip-text text-transparent">
            Capsuléo
          </span>
        </div>

        <button 
          onClick={onMenuClick}
          className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
          aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  );
}
