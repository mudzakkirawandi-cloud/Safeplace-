import React from "react";
import Image from "next/image";

interface SafePlaceLogoProps {
  role?: "public" | "reporter" | "consultant" | "admin" | "operator" | "satgas";
  className?: string;
  width?: number;
  height?: number;
  variant?: "colored" | "white";
}

export default function SafePlaceLogo({
  role = "public",
  className = "",
  width = 140,
  height = 40,
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
    <div className={`flex items-center group ${className}`}>
      <Image 
        src="/images/logo-safeplace.svg" 
        alt="SafePlace Logo" 
        width={width} 
        height={height}
        className="object-contain"
        priority
      />
    </div>
  );
}
