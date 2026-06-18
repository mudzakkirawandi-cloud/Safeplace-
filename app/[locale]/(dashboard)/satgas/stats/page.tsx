"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

export default function SatgasStatsPage() {
  const t = useTranslations("satgas");

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-[#154360]">{t("nav_campus_stats")}</h1>
        <p className="text-primary/80 text-sm mt-1">Laporan analitik dan tren kekerasan di lingkup kampus.</p>
      </motion.div>

      <div className="bg-card border border-blue-100 rounded-2xl p-12 text-center text-muted-foreground shadow-sm">
        <div className="w-16 h-16 bg-background text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/0000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bar-chart-3"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
        </div>
        <h2 className="text-lg font-semibold text-[#154360] mb-2">Statistik Kampus Belum Tersedia</h2>
        <p className="text-sm max-w-md mx-auto">Fitur visualisasi grafik dan export laporan statistik satgas PPKS akan diimplementasikan pada fase analitik tingkat lanjut.</p>
      </div>
    </div>
  );
}
