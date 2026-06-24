"use client";

import { useTranslations } from "next-intl";

export default function AboutCollaborationSection() {
  const t = useTranslations("tentang.kolaborasi");

  const partners = [
    { name: "SafePlace" },
    { name: "Sahabat Tangguh" },
    { name: "Smart Insight" },
    { name: "ULBI" },
  ];

  const repeated = [...partners, ...partners, ...partners, ...partners];

  return (
    <section className="py-16 bg-gradient-to-b from-white to-[#FAFBFF] border-t border-border overflow-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideAbout {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-slide-about {
          animation: slideAbout 20s linear infinite;
        }
        .animate-slide-about:hover {
          animation-play-state: paused;
        }
      `}} />

      <div className="container mx-auto px-6 max-w-6xl text-center mb-10">
        <p className="text-sm font-semibold text-primary/60 uppercase tracking-widest mb-2">{t("eyebrow")}</p>
        <h2 className="text-2xl font-display font-bold text-primary">{t("title")}</h2>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto text-sm">{t("subtitle")}</p>
      </div>

      <div className="relative w-full flex overflow-x-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#FAFBFF] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#FAFBFF] to-transparent z-10 pointer-events-none" />

        <div className="flex whitespace-nowrap items-center py-6 animate-slide-about">
          {repeated.map((partner, index) => (
            <div
              key={index}
              className="inline-flex items-center mx-14 text-2xl opacity-60 hover:opacity-100 transition-opacity cursor-default font-bold text-primary"
            >
              <span className="mr-2 text-lg">◆</span>
              {partner.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
