"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useReportContext } from "../../../_contexts/ReportContext";
import { User, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function ReportModePage() {
  const t = useTranslations("report.mode");
  const router = useRouter();
  const { setMode } = useReportContext();

  const handleSelectMode = (mode: "victim" | "witness") => {
    setMode(mode);
    router.push("/report/intent");
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 container mx-auto max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">{t("title")}</h1>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6 w-full mb-8">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => handleSelectMode("victim")}
          className="bg-card p-8 rounded-2xl shadow-sm border border-border hover:shadow-md hover:border-[#4A90B8] transition-all text-left group flex flex-col h-full"
        >
          <div className="bg-background w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <User className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-primary mb-3">{t("victim_title")}</h2>
          <p className="text-muted-foreground leading-relaxed flex-1">{t("victim_desc")}</p>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => handleSelectMode("witness")}
          className="bg-card p-8 rounded-2xl shadow-sm border border-border hover:shadow-md hover:border-[#4A90B8] transition-all text-left group flex flex-col h-full"
        >
          <div className="bg-background w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-primary mb-3">{t("witness_title")}</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">{t("witness_desc")}</p>
          <div className="mt-auto bg-[#FDF2E9] text-[#D35400] p-4 rounded-xl text-sm border border-[#FAD7A1]">
            {t("witness_consent")}
          </div>
        </motion.button>
      </div>
    </main>
  );
}
