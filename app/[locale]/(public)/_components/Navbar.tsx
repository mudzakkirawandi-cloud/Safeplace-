"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import SafePlaceLogo from "@/components/ui/SafePlaceLogo";

export default function Navbar() {
  const t = useTranslations("homepage.navbar");
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/report/start", label: t("report") },
    { href: "/pendampingan", label: t("consultation") },
    { href: "/edukasi", label: t("education") },
    { href: "/komunitas", label: t("community") },
    { href: "/tentang", label: t("about") },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white ${
          isScrolled ? "shadow-sm py-3" : "py-5"
        }`}
      >
        <div className="container mx-auto px-6 max-w-6xl flex items-center justify-between">
          <Link href="/" className="z-50 hover:opacity-80 transition-opacity">
            <SafePlaceLogo role="public" width={140} height={40} />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => {
              // Get the pathname without the locale
              const currentPath = pathname.replace(/^\/[a-z]{2}/, "") || "/";
              // Check if active (handle root vs others)
              const isActive = link.href === "/" 
                ? currentPath === "/" 
                : currentPath.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-all duration-300 hover:text-[#E74C3C] relative group ${
                    isActive ? "text-[#E74C3C]" : "text-primary"
                  }`}
                >
                  {link.label}
                  <span 
                    className={`absolute -bottom-1 left-0 h-0.5 bg-[#E74C3C] transition-all duration-300 ${
                      isActive ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  ></span>
                </Link>
              );
            })}
          </div>

          {/* Right Actions Desktop */}
          <div className="hidden lg:flex items-center gap-4">
            <LanguageSwitcher />
            
            <Link 
              href="/login" 
              className="px-4 py-2 text-sm font-medium text-primary hover:bg-gray-100 rounded-lg transition-colors"
            >
              {t("login")}
            </Link>
            <Link 
              href="/report/start" 
              className="px-5 py-2 text-sm font-medium text-white bg-primary hover:bg-[#154360] shadow-[0_0_15px_rgba(27,79,114,0.3)] hover:shadow-[0_0_20px_rgba(27,79,114,0.5)] rounded-lg transition-all"
            >
              {t("start_report")}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-4 z-50">
            <LanguageSwitcher />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-primary hover:text-[#E74C3C] transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-background z-40 transition-transform duration-300 ease-in-out transform lg:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full pt-24 px-6 pb-8 overflow-y-auto">
          <div className="flex flex-col gap-6 flex-grow">
            {navLinks.map((link) => {
              const currentPath = pathname.replace(/^\/[a-z]{2}/, "") || "/";
              const isActive = link.href === "/" 
                ? currentPath === "/" 
                : currentPath.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-xl font-medium transition-colors ${
                    isActive ? "text-[#E74C3C]" : "text-primary"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
          
          <div className="flex flex-col gap-4 mt-8 border-t border-border pt-8">
            <Link 
              href="/login" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full text-center px-4 py-3 text-lg font-medium text-primary bg-gray-100 rounded-xl transition-colors"
            >
              {t("login")}
            </Link>
            <Link 
              href="/report/start" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full text-center px-5 py-3 text-lg font-medium text-white bg-primary shadow-[0_0_15px_rgba(27,79,114,0.3)] rounded-xl transition-all"
            >
              {t("start_report")}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
