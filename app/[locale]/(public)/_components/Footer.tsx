"use client";

import { useTranslations } from "next-intl";
import { Phone, MessageCircle, Camera, Globe, Mail } from "lucide-react";
import Link from "next/link";
import SafePlaceLogo from "@/components/ui/SafePlaceLogo";

export default function Footer() {
  const t = useTranslations("homepage.footer");

  return (
    <footer className="bg-background border-t border-border pt-16 pb-8">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-16">
          {/* Column 1: Brand & Tagline */}
          <div className="lg:col-span-1">
            <Link href="/" className="mb-4 inline-block hover:opacity-80 transition-opacity">
              <SafePlaceLogo role="public" />
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              {t("tagline")}
            </p>
            <div className="flex items-center gap-4 text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors" aria-label="Instagram">
                <Camera size={20} />
              </a>
              <a href="#" className="hover:text-primary transition-colors" aria-label="Twitter">
                <Globe size={20} />
              </a>
              <a href="#" className="hover:text-primary transition-colors" aria-label="Email">
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Column 2: Platform */}
          <div>
            <h3 className="font-bold text-primary mb-4">{t("platform")}</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-[#E74C3C] transition-colors">{t("nav_home")}</Link>
              </li>
              <li>
                <Link href="/laporkan" className="hover:text-[#E74C3C] transition-colors">{t("nav_report")}</Link>
              </li>
              <li>
                <Link href="/pendampingan" className="hover:text-[#E74C3C] transition-colors">{t("nav_consultation")}</Link>
              </li>
              <li>
                <Link href="/edukasi" className="hover:text-[#E74C3C] transition-colors">{t("nav_education")}</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Komunitas */}
          <div>
            <h3 className="font-bold text-primary mb-4">{t("community")}</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/komunitas" className="hover:text-[#E74C3C] transition-colors">{t("forum")}</Link>
              </li>
              <li>
                <Link href="/komunitas/kategori" className="hover:text-[#E74C3C] transition-colors">{t("categories")}</Link>
              </li>
              <li>
                <Link href="/komunitas/moderasi" className="hover:text-[#E74C3C] transition-colors">{t("moderation")}</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Bantuan Darurat */}
          <div>
            <h3 className="font-bold text-primary mb-4">{t("emergency")}</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-[#E74C3C]" />
                <a href="tel:110" className="hover:text-[#E74C3C] transition-colors">{t("emergency_polri")}</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-[#E74C3C]" />
                <a href="tel:129" className="hover:text-[#E74C3C] transition-colors">{t("emergency_sapa")}</a>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle size={14} className="text-[#25D366]" />
                <a href="https://wa.me/628212600129" target="_blank" rel="noopener noreferrer" className="hover:text-[#25D366] transition-colors">{t("emergency_wa")}</a>
              </li>
            </ul>
          </div>

          {/* Column 5: Legal */}
          <div>
            <h3 className="font-bold text-primary mb-4">{t("legal")}</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors">{t("privacy_policy")}</Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary transition-colors">{t("terms")}</Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-primary transition-colors">{t("data_security")}</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">{t("contact")}</Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Footer */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <div>
            &copy; {new Date().getFullYear()} SafePlace. {t("rights")}.
          </div>
          <div>
            {t("made_with")}
          </div>
        </div>
      </div>
    </footer>
  );
}
