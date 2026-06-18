import React from "react";
import { Shield } from "lucide-react";

interface SafePlaceLogoProps {
  role?: "public" | "reporter" | "consultant" | "admin" | "operator" | "satgas";
  className?: string;
  iconSize?: number;
  textSize?: string;
  variant?: "colored" | "white";
}

export default function SafePlaceLogo({
  role = "public",
  className = "",
  iconSize = 24,
  textSize = "text-xl",
  variant = "colored",
}: SafePlaceLogoProps) {
  
  // Mapping role to its primary hex color (from tailwind config)
  const roleColors: Record<string, string> = {
    public: "#1B4F72",
    reporter: "#4A90B8",
    consultant: "#5B8A6F",
    admin: "#2C3E6B",
    operator: "#7B5EA7",
    satgas: "#1A5276",
  };

  const primaryColor = roleColors[role] || roleColors.public;

  return (
    <div className={`flex items-center gap-2 group ${className}`}>
      {/* Placeholder SVG Icon (Shield) adapting to role color */}
      <div 
        className={`${variant === 'white' ? 'bg-white/20 text-white border border-white/30' : 'text-white'} p-2 rounded-lg transition-colors`}
        style={variant === 'colored' ? { backgroundColor: primaryColor } : {}}
      >
        <Shield size={iconSize} />
      </div>
      
      {/* SAFEPLACE Text */}
      <span 
        className={`font-display font-bold ${textSize} tracking-tight ${variant === 'white' ? 'text-white' : ''}`}
        style={variant === 'colored' ? { color: primaryColor } : {}}
      >
        SAFEPLACE
      </span>
    </div>
  );
}
