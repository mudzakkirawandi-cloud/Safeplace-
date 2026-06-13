"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [locale, setLocale] = useState("id");
  const router = useRouter();

  useEffect(() => {
    // Read current locale from cookie or document
    const match = document.cookie.match(/(^| )NEXT_LOCALE=([^;]+)/);
    if (match) {
      setLocale(match[2]);
    } else {
      setLocale(document.documentElement.lang || "id");
    }
  }, []);

  const changeLanguage = (newLocale: string) => {
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    setLocale(newLocale);
    setIsOpen(false);
    
    // Refresh to apply new language
    router.refresh();
    window.location.reload();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#1B4F72] hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Globe size={18} />
        <span>{locale === "en" ? "🇬🇧 EN" : "🇮🇩 ID"}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg overflow-hidden z-50 border border-gray-100"
          >
            <button
              onClick={() => changeLanguage("id")}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${locale === "id" ? "bg-gray-50 font-semibold" : ""}`}
            >
              🇮🇩 Indonesia
            </button>
            <button
              onClick={() => changeLanguage("en")}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${locale === "en" ? "bg-gray-50 font-semibold" : ""}`}
            >
              🇬🇧 English
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
