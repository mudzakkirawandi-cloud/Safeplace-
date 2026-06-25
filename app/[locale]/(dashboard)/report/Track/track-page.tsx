"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  CheckCircle2,
  Circle,
  Clock,
  MessageCircle,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { useReportContext } from "../../../_contexts/ReportContext";

// Tipe milestone timeline
type MilestoneStatus = "done" | "active" | "pending";

interface Milestone {
  key: string;
  labelKey: string;
  status: MilestoneStatus;
  timestamp?: string;
  note?: string;
  conditional?: boolean; // milestone kondisional (konsultasi / satgas)
}

// Data dummy — di produksi fetch dari Supabase berdasarkan tracking code
const DUMMY_REPORT = {
  code: "SAFEXXXX",
  intent: "consult" as const,
  status: "in_consultation",
  milestones: [
    {
      key: "received",
      labelKey: "milestone_received",
      status: "done" as MilestoneStatus,
      timestamp: "12 Jun 2024, 14:32",
      note: "Laporan berhasil diterima sistem.",
    },
    {
      key: "reviewed",
      labelKey: "milestone_reviewed",
      status: "done" as MilestoneStatus,
      timestamp: "12 Jun 2024, 16:05",
      note: "Laporan telah ditinjau oleh tim SafePlace.",
    },
    {
      key: "consultation",
      labelKey: "milestone_consultation",
      status: "active" as MilestoneStatus,
      timestamp: "13 Jun 2024, 09:00",
      note: "Kamu sedang dalam pendampingan dengan konsultan.",
      conditional: true,
    },
    {
      key: "satgas",
      labelKey: "milestone_satgas",
      status: "pending" as MilestoneStatus,
      conditional: true,
    },
    {
      key: "done",
      labelKey: "milestone_done",
      status: "pending" as MilestoneStatus,
    },
  ] as Milestone[],
};

export default function TrackPage() {
  const t = useTranslations("report.track");
  const router = useRouter();
  const { state } = useReportContext();

  // Jika pelapor teridentifikasi, auto-load dari akun (skip input manual)
  const isIdentified = state.path === "identified";

  const [inputCode, setInputCode] = useState("");
  const [report, setReport] = useState(
    isIdentified ? DUMMY_REPORT : null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    const code = inputCode.trim().toUpperCase();
    if (code.length !== 8) {
      setError(t("error_invalid_code"));
      return;
    }

    setError("");
    setLoading(true);

    // Simulasi fetch — ganti dengan Supabase query di produksi
    await new Promise((r) => setTimeout(r, 1000));

    if (code === "SAFEXXXX") {
      setReport({ ...DUMMY_REPORT, code });
    } else {
      setError(t("error_not_found"));
    }

    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">
            {t("title")}
          </h1>
          <p className="text-muted-foreground leading-relaxed">{t("subtitle")}</p>
        </motion.div>

        {/* Input kode — hanya tampil jika anonim & belum ada data */}
        {!isIdentified && !report && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl shadow-sm border border-border p-6 mb-6"
          >
            <label className="block text-sm font-semibold text-primary mb-2">
              {t("input_label")}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputCode}
                onChange={(e) =>
                  setInputCode(e.target.value.toUpperCase().slice(0, 8))
                }
                onKeyDown={handleKeyDown}
                placeholder={t("input_placeholder")}
                maxLength={8}
                className="flex-1 border border-border rounded-xl px-4 py-3 text-center font-mono text-lg tracking-widest focus:outline-none focus:border-[#4A90B8] focus:ring-2 focus:ring-[#4A90B8]/20 transition uppercase placeholder:normal-case placeholder:tracking-normal placeholder:font-sans placeholder:text-sm placeholder:text-muted-foreground"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="bg-primary hover:bg-[#3a7da8] disabled:opacity-60 text-white px-5 py-3 rounded-xl flex items-center gap-2 font-semibold transition active:scale-95"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-border border-t-transparent rounded-full"
                  />
                ) : (
                  <Search className="w-5 h-5" />
                )}
                {t("search_button")}
              </button>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 mt-3 text-sm text-red-600"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Card status laporan */}
        <AnimatePresence>
          {report && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 180, damping: 20 }}
            >
              {/* Header card */}
              <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden mb-4">
                <div className="bg-primary px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#BDE0F5] text-xs font-semibold uppercase tracking-wider mb-1">
                        {t("report_code_label")}
                      </p>
                      <p className="text-white text-2xl font-bold font-mono tracking-widest">
                        {report.code}
                      </p>
                    </div>
                    <StatusBadge status={report.status} t={t} />
                  </div>
                </div>

                {/* Timeline */}
                <div className="px-6 py-6">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-5">
                    {t("timeline_label")}
                  </p>

                  <div className="relative">
                    {/* Garis vertikal */}
                    <div className="absolute left-[18px] top-0 bottom-0 w-0.5 bg-gray-100" />

                    <div className="space-y-6">
                      {report.milestones.map((milestone, idx) => (
                        <MilestoneItem
                          key={milestone.key}
                          milestone={milestone}
                          t={t}
                          isLast={idx === report.milestones.length - 1}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tombol chat konsultan — muncul jika in_consultation */}
              {report.status === "in_consultation" && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  onClick={() => router.push("/report/chat")}
                  className="w-full bg-primary hover:bg-[#3a7da8] text-white font-semibold py-4 px-6 rounded-2xl flex items-center justify-between shadow-md hover:shadow-lg transition active:scale-[0.98] mb-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-card/20 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold">{t("chat_button_title")}</p>
                      <p className="text-sm text-[#BDE0F5]">
                        {t("chat_button_subtitle")}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 opacity-70" />
                </motion.button>
              )}

              {/* Reset — cari laporan lain (hanya mode anonim) */}
              {!isIdentified && (
                <button
                  onClick={() => {
                    setReport(null);
                    setInputCode("");
                  }}
                  className="w-full text-center text-sm text-primary hover:underline py-2"
                >
                  {t("search_another")}
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </main>
  );
}

// ── Sub-komponen ──────────────────────────────────────────

function MilestoneItem({
  milestone,
  t,
  isLast,
}: {
  milestone: Milestone;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
  isLast: boolean;
}) {
  const isDone = milestone.status === "done";
  const isActive = milestone.status === "active";
  const isPending = milestone.status === "pending";

  // Jangan render milestone kondisional yang pending jika tidak relevan
  // (satgas hanya muncul jika intent === 'satgas', di produksi filter dari data)

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex gap-4 relative"
    >
      {/* Ikon milestone */}
      <div className="flex-shrink-0 z-10">
        {isDone && (
          <CheckCircle2 className="w-9 h-9 text-primary bg-card rounded-full" />
        )}
        {isActive && (
          <motion.div
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Clock className="w-9 h-9 text-[#F4A261] bg-card rounded-full" />
          </motion.div>
        )}
        {isPending && (
          <Circle className="w-9 h-9 text-gray-200 bg-card rounded-full" />
        )}
      </div>

      {/* Konten */}
      <div className={`pb-2 ${isLast ? "" : ""}`}>
        <p
          className={`font-semibold leading-tight ${
            isDone
              ? "text-primary"
              : isActive
              ? "text-[#F4A261]"
              : "text-gray-300"
          }`}
        >
          {t(milestone.labelKey)}
        </p>
        {milestone.timestamp && (
          <p className="text-xs text-muted-foreground mt-0.5">{milestone.timestamp}</p>
        )}
        {milestone.note && (
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            {milestone.note}
          </p>
        )}
      </div>
    </motion.div>
  );
}

function StatusBadge({
  status,
  t,
}: {
  status: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
}) {
  const config: Record<string, { label: string; className: string }> = {
    received: {
      label: t("status_received"),
      className: "bg-blue-100 text-blue-700",
    },
    in_review: {
      label: t("status_in_review"),
      className: "bg-yellow-100 text-yellow-700",
    },
    in_consultation: {
      label: t("status_in_consultation"),
      className: "bg-card/20 text-white border border-border/40",
    },
    escalated_satgas: {
      label: t("status_escalated_satgas"),
      className: "bg-card/20 text-white border border-border/40",
    },
    done: {
      label: t("status_done"),
      className: "bg-green-100 text-green-700",
    },
  };

  const c = config[status] || config["received"];

  return (
    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${c.className}`}>
      {c.label}
    </span>
  );
}
