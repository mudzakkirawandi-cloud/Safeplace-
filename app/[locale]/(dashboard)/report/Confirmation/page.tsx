"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, Copy, FileText, ArrowRight } from "lucide-react";
import SafePlaceLogo from "@/components/ui/SafePlaceLogo";

export default function ConfirmationPage() {
  const t = useTranslations("report");
  const searchParams = useSearchParams();
  const trackingCode = searchParams.get("code") || "XXXXXXXX";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(trackingCode);
    alert("Kode tracking disalin ke clipboard!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full bg-card rounded-3xl shadow-xl border border-border overflow-hidden"
      >
        <div className="bg-primary p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#4ECDC4] opacity-20 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
          <div className="flex justify-center mb-6">
            <CheckCircle className="w-20 h-20 text-[#4ECDC4]" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Laporan Berhasil Terkirim</h1>
          <p className="text-white/80">
            Terima kasih atas keberanian Anda. Laporan Anda telah kami terima dan aman dalam sistem kami.
          </p>
        </div>

        <div className="p-10">
          <div className="bg-muted border border-[#4A90B8]/30 rounded-2xl p-8 text-center mb-8 relative">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-3">Kode Tracking Anda</p>
            <div className="text-4xl font-mono font-bold tracking-[0.2em] text-primary flex justify-center items-center gap-4">
              {trackingCode}
              <button onClick={copyToClipboard} className="text-muted-foreground hover:text-primary transition-colors focus:outline-none" title="Salin Kode">
                <Copy size={24} />
              </button>
            </div>
            <p className="text-sm text-red-600 font-medium mt-4 bg-red-50 p-3 rounded-lg border border-red-100">
              PENTING: Simpan kode ini! Anda akan membutuhkannya untuk melacak status laporan atau melanjutkan konsultasi anonim.
            </p>
          </div>

          <div className="space-y-4">
            <Link href="/report/dashboard" className="flex items-center justify-center gap-2 w-full py-4 bg-primary hover:bg-[#1f2b4a] text-white font-bold rounded-xl shadow-md transition-all hover:shadow-lg">
              <FileText size={20} />
              Kembali ke Dashboard
            </Link>
            <Link href="/report/track" className="flex items-center justify-center gap-2 w-full py-4 bg-card hover:bg-muted border border-border text-primary font-bold rounded-xl transition-all">
              Mulai Lacak Status
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
