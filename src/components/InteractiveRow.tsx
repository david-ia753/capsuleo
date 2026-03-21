"use client";

import React from "react";
import { motion } from "framer-motion";

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
  return (
    <motion.tr
      className={`${className} cursor-pointer relative z-10 border-l-4 border-transparent`}
      whileHover={{ 
        backgroundColor: "rgba(0, 112, 255, 0.05)",
        x: 4,
        borderLeftColor: "#0070FF",
        boxShadow: "0 10px 30px rgba(0,0,0,0.3), 0 0 15px rgba(0, 112, 255, 0.2)"
      }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 20 
      }}
      onClick={onClick}
    >
      {children}
    </motion.tr>
  );
}
