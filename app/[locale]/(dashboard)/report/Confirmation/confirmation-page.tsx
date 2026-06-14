"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, ArrowRight, BookOpen, Mail } from "lucide-react";
import { useReportContext } from "../../../_contexts/ReportContext";
import PanicButton from "../../../_components/PanicButton";

export default function ConfirmationPage() {
  const t = useTranslations("report.confirmation");
  const router = useRouter();
  const { state } = useReportContext();

  const [trackingCode, setTrackingCode] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [showCheckmark, setShowCheckmark] = useState(false);

  // Ambil tracking code dari context/sessionStorage
  useEffect(() => {
    const code =
      (state.formData?.trackingCode as string) ||
      sessionStorage.getItem("tracking_code") ||
      "SAFEXXXX"; // fallback dev
    setTrackingCode(code);

    // Delay sedikit agar animasi checkmark muncul setelah mount
    const timer = setTimeout(() => setShowCheckmark(true), 100);
    return () => clearTimeout(timer);
  }, [state.formData]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(trackingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback untuk browser yang tidak support clipboard API
      const el = document.createElement("textarea");
      el.value = trackingCode;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const isIdentified = state.path === "identified";
  // Email dummy — di produksi ambil dari Supabase session
  const userEmail = "u***@email.com";

  return (
    <main className="min-h-screen bg-[#F0F7FC] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg">

        {/* Checkmark animasi */}
        <div className="flex justify-center mb-8">
          <AnimatePresence>
            {showCheckmark && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="relative"
              >
                {/* Lingkaran luar pulse */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0.6 }}
                  animate={{ scale: 1.4, opacity: 0 }}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 1 }}
                  className="absolute inset-0 rounded-full bg-[#4A90B8]"
                />
                {/* Lingkaran utama */}
                <div className="w-24 h-24 rounded-full bg-[#4A90B8] flex items-center justify-center shadow-lg">
                  <motion.svg
                    viewBox="0 0 52 52"
                    className="w-12 h-12"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                  >
                    <motion.path
                      d="M14 27 L22 35 L38 19"
                      fill="none"
                      stroke="white"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
                    />
                  </motion.svg>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Judul */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-[#1B4F72] mb-3">
            {t("title")}
          </h1>
          <p className="text-gray-600 leading-relaxed">
            {t("subtitle")}
          </p>
        </motion.div>

        {/* Kotak kode tracking */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-sm border border-[#BDE0F5] p-6 mb-4"
        >
          <p className="text-sm font-semibold text-[#4A90B8] uppercase tracking-wider mb-3">
            {t("tracking_code_label")}
          </p>

          <div className="flex items-center gap-3">
            {/* Kode */}
            <div className="flex-1 bg-[#F0F7FC] border-2 border-dashed border-[#4A90B8] rounded-xl px-5 py-4 text-center">
              <span className="text-3xl font-bold tracking-[0.3em] text-[#1B4F72] font-mono select-all">
                {trackingCode}
              </span>
            </div>

            {/* Tombol copy */}
            <button
              onClick={handleCopy}
              className="w-14 h-14 rounded-xl bg-[#4A90B8] hover:bg-[#3a7da8] text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 flex-shrink-0 shadow-sm"
              title={t("copy_button")}
            >
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Check className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="copy"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Copy className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>

          {/* Toast tersalin */}
          <AnimatePresence>
            {copied && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center text-sm text-[#4A90B8] font-medium mt-3"
              >
                ✓ {t("copied_toast")}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Instruksi kode tracking */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-[#FFF8E7] border border-[#F9E4A0] rounded-xl px-5 py-4 mb-4"
        >
          <p className="text-sm font-semibold text-[#7D5A00] mb-2">
            ⚠️ {t("code_instruction_title")}
          </p>
          <ul className="text-sm text-[#6B4C00] space-y-1 list-disc list-inside leading-relaxed">
            <li>{t("code_instruction_1")}</li>
            <li>{t("code_instruction_2")}</li>
            <li>{t("code_instruction_3")}</li>
          </ul>
        </motion.div>

        {/* Info email jika teridentifikasi */}
        {isIdentified && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-5 py-4 mb-4 shadow-sm"
          >
            <Mail className="w-5 h-5 text-[#4A90B8] flex-shrink-0" />
            <p className="text-sm text-gray-600">
              {t("email_sent_prefix")}{" "}
              <span className="font-semibold text-[#1B4F72]">{userEmail}</span>
            </p>
          </motion.div>
        )}

        {/* Tombol aksi */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-3 mt-2"
        >
          <button
            onClick={() => router.push("/report/track")}
            className="flex-1 bg-[#4A90B8] hover:bg-[#3a7da8] text-white font-semibold py-3 px-5 rounded-xl flex items-center justify-center gap-2 transition-all hover:shadow-md active:scale-95"
          >
            {t("track_button")}
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => router.push("/resources")}
            className="flex-1 bg-white hover:bg-[#F0F7FC] text-[#4A90B8] font-semibold py-3 px-5 rounded-xl border border-[#4A90B8] flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <BookOpen className="w-4 h-4" />
            {t("resources_button")}
          </button>
        </motion.div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-center text-xs text-gray-400 mt-6 leading-relaxed"
        >
          {t("footer_note")}
        </motion.p>

      </div>

      <PanicButton />
    </main>
  );
}
