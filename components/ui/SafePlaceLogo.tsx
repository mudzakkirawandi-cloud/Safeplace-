import React from "react";
import Image from "next/image";

interface SafePlaceLogoProps {
  className?: string;
  iconSize?: number;
  textSize?: string;
  textColor?: string;
}

export default function SafePlaceLogo({
  className = "",
  iconSize = 28,
  textSize = "text-xl",
  textColor = "text-primary",
}: SafePlaceLogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image
        src="/images/logo-safeplace-icon.svg"
        alt="SafePlace Logo"
        width={iconSize}
        height={iconSize}
        className="object-contain"
        priority
      />
      <span className={`font-display font-bold ${textSize} tracking-tight ${textColor}`}>
        SAFEPLACE
      </span>
    </div>
  );
}

