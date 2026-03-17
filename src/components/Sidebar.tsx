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
  LayoutGrid
} from "lucide-react";

interface SidebarProps {
  session: any;
  role: "ADMIN" | "STUDENT" | "TRAINER";
}

export function Sidebar({ session, role }: SidebarProps) {
  const pathname = usePathname();
  const userName = session?.user?.name || session?.user?.email || "Utilisateur";
  const initials = userName.slice(0, 2).toUpperCase();

  const isAdmin = role === "ADMIN";
  const isTrainer = role === "TRAINER";
  const isStudent = role === "STUDENT";

  return (
    <aside 
      className="admin-sidebar"
      style={{
        width: "280px",
        minWidth: "280px",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        display: "flex",
        flexDirection: "column",
        padding: "20px 24px 0px 24px",
        zIndex: 1000,
        backgroundColor: "rgba(11, 17, 32, 0.6)", // Contrast renforcé
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderRight: "1px solid rgba(255, 255, 255, 0.1)",
        overflow: "hidden", 
      }}
    >
      {/* Brand - Scaled down */}
      <div className="sidebar-brand mb-2 flex items-center gap-4 scale-90 origin-left">
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
        <div className="sidebar-brand-text">
          <h2 
            style={{ 
              fontSize: "28px", 
              fontWeight: "900", 
              background: "linear-gradient(to bottom, #132E53, #0070FF)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              margin: 0,
              textShadow: "0.5px 0.5px 0px rgba(255, 255, 255, 0.3)"
            }}
          >
            Capsuléo
          </h2>
          <span style={{ fontSize: "10px", fontWeight: "800", color: "#fbbf24", letterSpacing: "0.15em", textTransform: "uppercase" }}>
            {isAdmin ? "Administration" : isTrainer ? "Formateur" : "STAGIAIRE"}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0 pr-2">
        <span className="text-[10px] font-bold uppercase tracking-widest ml-4 mb-0.5 block" style={{ color: "#fbbf24" }}>Principal</span>

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

        <span className="text-[10px] font-bold uppercase tracking-widest ml-4 mb-0.5 mt-1 block" style={{ color: "#fbbf24" }}>Gestion</span>

        {!isStudent ? (
          <>
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
              href="/admin/modules"
              label="Suivi module"
              id="nav-modules"
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
          </>
        ) : (
          <>
            <SidebarLink
              href="/profile"
              label="Mon Profil"
              id="nav-profile-student"
              icon={<User size={18} />}
            />
            <SidebarLink
              href="/settings"
              label="Paramètres"
              id="nav-settings-student"
              icon={<Settings size={18} />}
            />
          </>
        )}
      </nav>

      {/* Bottom Section: Profile Block */}
      <div className="mt-auto pt-4 border-t border-white/10 space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-widest ml-4 mb-0.5 block" style={{ color: "#fbbf24" }}>MON ESPACE</span>
        
        {!isStudent && (
          <>
            <SidebarLink
              href="/admin/profile"
              label="Mon Profil"
              id="sidebar-profile-link"
              icon={<User size={18} />}
            />
            <SidebarLink
              href="/admin/settings"
              label="Paramètres"
              id="sidebar-settings-link"
              icon={<Settings size={18} />}
            />
          </>
        )}

        <div 
          className="flex items-center gap-3 p-4 rounded-2xl border border-white/10 mt-1 relative" 
          style={{ 
            backgroundColor: "rgba(255, 255, 255, 0.08)",
            zIndex: 50,
            marginBottom: "16px" 
          }}
        >
          <div 
            className="w-10 h-10 rounded-xl bg-safran flex items-center justify-center text-marine font-black text-sm"
            style={{ backgroundColor: "#fbbf24", color: "#020617" }}
          >
            {initials}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold truncate" style={{ color: "#fbbf24" }}>
                {userName.toLowerCase().includes('david') ? 'David' : userName.split(' ')[0]}
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
  );
}
