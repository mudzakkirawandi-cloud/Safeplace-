"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Shield } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const t = useTranslations("homepage.navbar");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/80 backdrop-blur-md shadow-sm py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-6 max-w-6xl flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-[#1B4F72] text-white p-2 rounded-lg group-hover:bg-[#E74C3C] transition-colors">
            <Shield size={24} />
          </div>
          <span className="font-display font-bold text-xl text-[#1B4F72] tracking-tight">
            SafePlace
          </span>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          
          <div className="hidden sm:flex items-center gap-3">
            <Link 
              href="/login" 
              className="px-4 py-2 text-sm font-medium text-[#1B4F72] hover:bg-gray-100 rounded-lg transition-colors"
            >
              {t("login")}
            </Link>
            <Link 
              href="/report/start" 
              className="px-5 py-2 text-sm font-medium text-white bg-[#E74C3C] hover:bg-[#c0392b] rounded-lg shadow-sm hover:shadow transition-all"
            >
              {t("start_report")}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
