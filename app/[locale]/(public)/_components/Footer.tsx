"use client";

import { useTranslations } from "next-intl";
import { Shield } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  const t = useTranslations("homepage.footer");

  return (
    <footer className="bg-white border-t border-gray-100 py-12">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-[#1B4F72] text-white p-1.5 rounded-lg">
              <Shield size={20} />
            </div>
            <span className="font-display font-bold text-lg text-[#1B4F72]">
              SafePlace
            </span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500 font-medium">
            <Link href="/privacy" className="hover:text-[#1B4F72] transition-colors">
              {t("privacy_policy")}
            </Link>
            <Link href="/terms" className="hover:text-[#1B4F72] transition-colors">
              {t("terms")}
            </Link>
            <Link href="/contact" className="hover:text-[#1B4F72] transition-colors">
              {t("contact")}
            </Link>
          </div>
        </div>
        
        <div className="mt-8 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} SafePlace. {t("rights")}.
        </div>
      </div>
    </footer>
  );
}
