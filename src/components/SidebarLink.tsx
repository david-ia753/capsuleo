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
      className="cap-sidebar-link transition-all"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "8px 16px",
        borderRadius: "14px",
        color: isHovered ? "#fbbf24" : "#ffffff",
        opacity: 1,
        textDecoration: "none",
        fontSize: "14px",
        backgroundColor: isHovered ? "rgba(255, 255, 255, 0.08)" : "transparent",
        boxShadow: isHovered ? "0 0 15px rgba(0, 242, 255, 0.1)" : "none",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: isHovered ? "rgba(0, 242, 255, 0.4)" : "transparent",
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
