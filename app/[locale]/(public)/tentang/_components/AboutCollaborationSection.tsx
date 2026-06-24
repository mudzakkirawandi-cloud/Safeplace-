"use client";

import { useTranslations } from "next-intl";
import CollaborationCarousel from "../../_components/CollaborationCarousel";

export default function AboutCollaborationSection() {
  const t = useTranslations("tentang.kolaborasi");

  return (
    <section className="py-16 bg-gradient-to-b from-white to-[#FAFBFF] border-t border-border overflow-hidden">
      <div className="container mx-auto px-6 max-w-6xl text-center mb-10">
        <p className="text-sm font-semibold text-primary/60 uppercase tracking-widest mb-2">
          {t("eyebrow")}
        </p>
        <h2 className="text-2xl font-display font-bold text-primary">{t("title")}</h2>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto text-sm">{t("subtitle")}</p>
      </div>
      <CollaborationCarousel />
    </section>
  );
}
