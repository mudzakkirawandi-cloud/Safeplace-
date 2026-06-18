"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useReportContext } from "../../../_contexts/ReportContext";
import { Shield, User } from "lucide-react";
import { motion } from "framer-motion";

export default function ReportStartPage() {
  const t = useTranslations("report.start");
  const router = useRouter();
  const { setPath } = useReportContext();

  const handleSelectPath = (path: "anonymous" | "identified") => {
    setPath(path);
    router.push("/report/mode");
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 container mx-auto max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-[#1B4F72] mb-4">{t("title")}</h1>
        <p className="text-gray-600 text-lg">{t("subtitle")}</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6 w-full mb-8">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileTap={{ scale: 0.95 }}
          transition={{ delay: 0.1 }}
          onClick={() => handleSelectPath("anonymous")}
          className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-[#4A90B8] transition-all text-left group"
        >
          <div className="bg-[#EBF5FB] w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Shield className="w-8 h-8 text-[#4A90B8]" />
          </div>
          <h2 className="text-2xl font-bold text-[#1B4F72] mb-3">{t("anonymous_title")}</h2>
          <p className="text-gray-600 leading-relaxed">{t("anonymous_desc")}</p>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          whileTap={{ scale: 0.95 }}
          transition={{ delay: 0.2 }}
          onClick={() => handleSelectPath("identified")}
          className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-[#4A90B8] transition-all text-left group"
        >
          <div className="bg-[#EBF5FB] w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <User className="w-8 h-8 text-[#4A90B8]" />
          </div>
          <h2 className="text-2xl font-bold text-[#1B4F72] mb-3">{t("identified_title")}</h2>
          <p className="text-gray-600 leading-relaxed">{t("identified_desc")}</p>
        </motion.button>
      </div>
    </main>
  );
}
