"use client";

import Link from "next/link";
import { useState, cloneElement, isValidElement } from "react";

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  id?: string;
}

export function SidebarLink({ href, icon, label, id }: SidebarLinkProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={href}
      id={id}
      className="sidebar-link transition-all"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "14px 18px",
        borderRadius: "16px",
        color: isHovered ? "#fbbf24" : "#ffffff",
        opacity: 1,
        fontWeight: "600",
        textDecoration: "none",
        transform: isHovered ? "translateX(6px) scale(1.02)" : "translateX(0) scale(1)",
        backgroundColor: isHovered ? "rgba(255, 255, 255, 0.05)" : "transparent",
        boxShadow: isHovered ? "0 0 20px rgba(0, 242, 255, 0.15)" : "none",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: isHovered ? "rgba(0, 242, 255, 0.5)" : "transparent",
        textShadow: isHovered ? "0 0 10px rgba(251, 191, 36, 0.4)" : "none",
        transition: "all 0.3s cubic-bezier(0.23, 1, 0.32, 1)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ 
        display: "flex", 
        alignItems: "center",
        filter: "drop-shadow(0.5px 0.5px 0px rgba(255, 255, 255, 0.3))"
      }}>
        {isValidElement(icon) ? cloneElement(icon as any, { 
          stroke: "url(#muc-gradient)",
          style: { stroke: "url(#muc-gradient)" }
        }) : icon}
      </div>
      <span style={{ color: isHovered ? "#fbbf24" : "#ffffff" }}>{label}</span>
    </Link>
  );
}
