"use client";

import React from "react";
import { motion } from "framer-motion";

interface InteractiveElementProps {
  children: React.ReactNode;
  type?: "card" | "button" | "row";
  className?: string;
  style?: React.CSSProperties;
  hoverStyle?: any;
  onClick?: () => void;
}

export function InteractiveElement({ 
  children, 
  type = "card", 
  className = "", 
  style = {}, 
  hoverStyle = {},
  onClick
}: InteractiveElementProps) {
  
  const isCard = type === "card";

  return (
    <motion.div
      className={className}
      initial={false}
      whileHover={{ 
        y: -4, 
        scale: isCard ? 1.02 : 1,
        borderColor: "#0070FF",
        boxShadow: isCard 
          ? "0 20px 40px rgba(0,0,0,0.4), 0 0 25px rgba(0, 112, 255, 0.4)" 
          : "none",
        ...(style as any)?.hoverStyle, // Legacy check
        ...hoverStyle
      }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 17 
      }}
      style={{ 
        cursor: "pointer",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: isCard ? "rgba(255, 255, 255, 0.1)" : "transparent",
        ...style 
      }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
