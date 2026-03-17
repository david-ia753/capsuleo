"use client";

import React, { useState } from "react";

interface InteractiveElementProps {
  children: React.ReactNode;
  type?: "card" | "button" | "row";
  className?: string;
  style?: React.CSSProperties;
  hoverStyle?: React.CSSProperties;
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
  const [isHovered, setIsHovered] = useState(false);

  const getBaseStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      transition: "all 0.4s cubic-bezier(0.23, 1, 0.32, 1)",
      cursor: "pointer",
      ...style
    };

    if (type === "card") {
      return {
        ...base,
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "rgba(0, 242, 255, 0.2)",
      };
    }

    if (type === "row") {
      return {
        ...base,
        borderBottomWidth: "1px",
        borderBottomStyle: "solid",
        borderBottomColor: "rgba(255, 255, 255, 0.05)",
      };
    }

    return base;
  };

  const getHoverStyle = (): React.CSSProperties => {
    if (!isHovered) return {};

    const defaultHover: React.CSSProperties = {
      transform: "translateY(-4px) scale(1.02)",
      borderColor: "#00f2ff",
      boxShadow: "0 10px 30px rgba(0,0,0,0.3), 0 0 20px rgba(0, 242, 255, 0.4)",
      ...hoverStyle
    };

    if (type === "row") {
      return {
        backgroundColor: "rgba(0, 242, 255, 0.05)",
        borderLeftWidth: "4px",
        borderLeftStyle: "solid",
        borderLeftColor: "#00f2ff",
        transform: "translateX(4px)",
        ...hoverStyle
      };
    }

    return defaultHover;
  };

  return (
    <div
      className={className}
      style={{ ...getBaseStyle(), ...getHoverStyle() }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
