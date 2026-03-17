"use client";

import React, { useState } from "react";

interface InteractiveRowProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function InteractiveRow({ 
  children, 
  className = "", 
  onClick 
}: InteractiveRowProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <tr
      className={`${className} transition-all duration-300`}
      style={{
        cursor: "pointer",
        backgroundColor: isHovered ? "rgba(0, 242, 255, 0.05)" : "transparent",
        transform: isHovered ? "translateY(-4px) scale(1.002)" : "none",
        borderLeft: isHovered ? "4px solid #00f2ff" : "4px solid transparent",
        boxShadow: isHovered ? "0 10px 30px rgba(0,0,0,0.3), 0 0 15px rgba(0, 242, 255, 0.2)" : "none",
        zIndex: isHovered ? 10 : 1,
        position: "relative",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}
