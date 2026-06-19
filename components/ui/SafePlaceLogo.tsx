import React from "react";
import Image from "next/image";

interface SafePlaceLogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export default function SafePlaceLogo({
  className = "",
  width = 140,
  height = 40,
}: SafePlaceLogoProps) {
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
