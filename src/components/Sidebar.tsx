"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { SidebarLink } from "./SidebarLink";
import { 
  LayoutDashboard, 
  Upload, 
  Users, 
  Library, 
  User, 
  Settings,
  LogOut,
  LayoutGrid,
  ShieldCheck
} from "lucide-react";

interface SidebarProps {
  session: any;
  role: "ADMIN" | "STUDENT" | "TRAINER";
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ session, role, isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const userName = session?.user?.name || session?.user?.email || "Utilisateur";
  const initials = userName.slice(0, 2).toUpperCase();

  const isAdmin = role === "ADMIN";
  const isTrainer = role === "TRAINER";
  const isStudent = role === "STUDENT";

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[950] lg:hidden"
          onClick={onClose}
        />
      )}

      <aside 
        className={`cap-sidebar-container no-scrollbar transition-transform duration-300 z-[1000] lg:translate-x-0 glass-sidebar ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{
          width: "280px",
          minWidth: "280px",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          display: "flex",
          flexDirection: "column",
          padding: "24px 20px",
          backgroundColor: "rgba(255, 255, 255, 0.03)", // Sophisticated white glass
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          borderRight: "1px solid rgba(255, 255, 255, 0.12)",
          overflowY: "auto", 
        }}
      >
      {/* 1. Zone Marque - Taille Naturelle */}
      <div className="cap-sidebar-brand flex items-center gap-4 scale-[0.95] origin-left mb-8">
        <div 
          style={{
            width: "48px",
            height: "48px",
            backgroundColor: "#fbbf24",
            borderRadius: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 20px rgba(251, 191, 36, 0.3)"
          }}
        >
          <svg width="28" height="28" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 34V18L24 12L34 18V34" stroke="#020617" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M20 28V24L24 22L28 24V28" stroke="#020617" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="24" cy="17" r="2" fill="#020617"/>
          </svg>
        </div>
        <div className="cap-sidebar-text">
          <h2 
            style={{ 
              fontSize: "24px", 
              fontWeight: "900", 
              background: "linear-gradient(to bottom, #132E53, #0070FF)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              margin: 0,
              textShadow: "0.5px 0.5px 0px rgba(255, 255, 255, 0.3)",
              lineHeight: "1"
            }}
          >
            Capsuléo
          </h2>
          <span style={{ fontSize: "9px", fontWeight: "800", color: "#fbbf24", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginTop: "2px" }}>
            {isAdmin ? "Administration" : isTrainer ? "Formateur" : "STAGIAIRE"}
          </span>
        </div>
      </div>

      {/* 2. Zone Navigation - Répartie */}
      <nav className="flex flex-col gap-1 pr-1">
        {/* Groupe Principal */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-bold uppercase tracking-widest ml-4 mb-2 block" style={{ color: "#fbbf24", opacity: 0.8 }}>Principal</span>

          {!isStudent ? (
            <>
              <SidebarLink
                href={isAdmin ? "/admin/dashboard" : "/dashboard"}
                label="Tableau de bord"
                id="nav-dashboard"
                icon={<LayoutDashboard size={18} />}
              />
              {(isAdmin || isTrainer) && (
                <SidebarLink
                  href="/admin/upload"
                  label="Génération IA"
                  id="nav-upload"
                  icon={<Upload size={18} />}
                />
              )}
            </>
          ) : (
            <SidebarLink
              href="/catalogue"
              label="Catalogue"
              id="nav-catalogue"
              icon={<LayoutGrid size={18} />}
            />
          )}
        </div>

        {/* Groupe Gestion - Espacé mt-10 */}
        {!isStudent && (
          <div className="flex flex-col gap-1 mt-10">
            <span className="text-[9px] font-bold uppercase tracking-widest ml-4 mb-2 block" style={{ color: "#fbbf24", opacity: 0.8 }}>Gestion</span>
            
            <SidebarLink
              href="/admin/groups"
              label="Gestion Groupes"
              id="nav-groups"
              icon={<LayoutGrid size={18} />}
            />
            <SidebarLink
              href="/admin/stagiaires"
              label="Suivi stagiaire"
              id="nav-stagiaires"
              icon={<Users size={18} />}
            />
            <SidebarLink
              href="/admin/modules?filter=mine"
              label="Mes Modules"
              id="nav-my-modules"
              icon={<User size={18} />}
            />
            <SidebarLink
              href="/admin/modules?filter=all"
              label="Bibliothèque"
              id="nav-all-modules"
              icon={<Library size={18} />}
            />
            {isAdmin && (
              <SidebarLink
                href="/admin/equipe"
                label="Gestion Équipe"
                id="nav-team"
                icon={<Users size={18} />}
              />
            )}
            {isAdmin && (
              <SidebarLink
                href="/admin/approvals"
                label="Validation"
                id="nav-approvals"
                icon={<ShieldCheck size={18} />}
              />
            )}
          </div>
        )}

        {/* Groupe Compte - Espacé mt-10 */}
        <div className="flex flex-col gap-1 mt-10">
           <span className="text-[9px] font-bold uppercase tracking-widest ml-4 mb-2 block" style={{ color: "#fbbf24", opacity: 0.6 }}>Compte</span>
           <SidebarLink
             href={isStudent ? "/profile" : "/admin/profile"}
             label="Mon Profil"
             id="nav-profile"
             icon={<User size={18} />}
           />
           <SidebarLink
             href={isStudent ? "/settings" : "/admin/settings"}
             label="Paramètres"
             id="nav-settings"
             icon={<Settings size={18} />}
           />
        </div>
      </nav>

      {/* 3. Zone Profil (Bottom) - Espacée mt-auto */}
      <div className="mt-auto pt-6 border-t border-white/10">
        <div 
          className="flex items-center gap-3 p-4 rounded-2xl border border-white/10" 
          style={{ backgroundColor: "rgba(255, 255, 255, 0.08)" }}
        >
          <div 
            className="w-10 h-10 rounded-xl bg-safran flex items-center justify-center text-marine font-black text-sm"
            style={{ backgroundColor: "#fbbf24", color: "#020617" }}
          >
            {initials}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold truncate" style={{ color: "#fbbf24" }}>
                {session?.user?.firstName || (userName.toLowerCase().includes('david') ? 'David' : userName.split(' ')[0])}
            </p>
            <p className="text-[10px] uppercase tracking-tighter truncate" style={{ color: "#fbbf24", opacity: 0.8 }}>
              {isAdmin ? "ADMIN" : isTrainer ? "Formateur" : "STAGIAIRE"}
            </p>
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-red-400 group"
            title="Déconnexion"
          >
            <LogOut size={18} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* MUC Gradient Definition */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="muc-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#132E53" />
            <stop offset="100%" stopColor="#0070FF" />
          </linearGradient>
        </defs>
      </svg>
      </aside>
    </>
  );
}
