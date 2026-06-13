"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

export default function PanicButton() {
  const t = useTranslations("common");

  useEffect(() => {
    let lastEscape = 0;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        const now = Date.now();
        if (now - lastEscape < 500) {
          window.location.replace("https://www.google.com");
        }
        lastEscape = now;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleClick = () => {
    window.location.replace("https://www.google.com");
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 bg-[#E74C3C] hover:bg-[#c0392b] text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2"
    >
      {t("panic_button")} ✕
    </button>
  );
}
