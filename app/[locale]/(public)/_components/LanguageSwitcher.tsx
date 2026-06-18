"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, ChevronDown } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

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

  const pathname = usePathname();

  const changeLanguage = (newLocale: string) => {
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    setLocale(newLocale);
    setIsOpen(false);
    
    // Replace the locale in the URL
    if (pathname) {
      const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);
      router.push(newPathname);
    } else {
      router.refresh();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change language"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1B4F72] focus:ring-offset-2 rounded-lg transition-colors"
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
            role="menu"
            aria-orientation="vertical"
            className="absolute right-0 mt-2 w-32 bg-card rounded-lg shadow-lg overflow-hidden z-50 border border-border"
          >
            <button
              role="menuitem"
              onClick={() => changeLanguage("id")}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-muted focus:outline-none focus:bg-muted transition-colors ${locale === "id" ? "bg-muted font-semibold" : ""}`}
            >
              🇮🇩 Indonesia
            </button>
            <button
              role="menuitem"
              onClick={() => changeLanguage("en")}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-muted focus:outline-none focus:bg-muted transition-colors ${locale === "en" ? "bg-muted font-semibold" : ""}`}
            >
              🇬🇧 English
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
