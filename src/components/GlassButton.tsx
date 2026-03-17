"use client";

import React, { useState } from "react";

interface GlassButtonProps {
  children: React.ReactNode;
  type?: "submit" | "button" | "reset";
  className?: string;
  disabled?: boolean;
}

export function GlassButton({ 
  children, 
  type = "submit", 
  className = "", 
  disabled 
}: GlassButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${className} w-full py-5 font-black uppercase tracking-[0.2em] rounded-2xl shadow-lg transition-all`}
      style={{
        backgroundColor: isHovered ? "#fff" : "#fbbf24",
        color: isHovered ? "#020617" : "#1e3a8a",
        boxShadow: isHovered 
          ? "0 10px 30px rgba(251, 191, 36, 0.5), 0 0 20px rgba(0, 242, 255, 0.4)" 
          : "0 0 25px rgba(251, 191, 36, 0.3)",
        transform: isHovered ? "translateY(-4px) scale(1.02)" : "translateY(0) scale(1)",
        border: isHovered ? "1px solid #00f2ff" : "1px solid transparent",
        cursor: disabled ? "not-allowed" : "pointer"
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </button>
  );
}
