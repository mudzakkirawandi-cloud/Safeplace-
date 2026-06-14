"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Filter, ChevronRight } from "lucide-react";

type Priority = "urgent" | "normal" | "low";
type Intent = "document" | "consult" | "satgas";
type Status = "in_review" | "in_consultation" | "escalated_satgas" | "done";

interface CaseItem {
  id: string;
  code: string;
  type: string;
  intent: Intent;
  priority: Priority;
  status: Status;
  lastUpdate: string;
}

const ALL_CASES: CaseItem[] = [
  { id: "1", code: "RPT-0047", type: "Pelecehan Verbal", intent: "consult", priority: "urgent", status: "in_consultation", lastUpdate: "10 menit lalu" },
  { id: "2", code: "RPT-0045", type: "Kekerasan Digital", intent: "document", priority: "normal", status: "in_review", lastUpdate: "2 jam lalu" },
  { id: "3", code: "RPT-0041", type: "Pelecehan Fisik", intent: "satgas", priority: "normal", status: "in_review", lastUpdate: "1 hari lalu" },
  { id: "4", code: "RPT-0038", type: "Kekerasan Seksual", intent: "consult", priority: "low", status: "in_consultation", lastUpdate: "2 hari lalu" },
  { id: "5", code: "RPT-0032", type: "Pelecehan Verbal", intent: "document", priority: "low", status: "done", lastUpdate: "5 hari lalu" },
  { id: "6", code: "RPT-0029", type: "Kekerasan Digital", intent: "consult", priority: "normal", status: "done", lastUpdate: "1 minggu lalu" },
  { id: "7", code: "RPT-0021", type: "Pelecehan Fisik", intent: "satgas", priority: "urgent", status: "escalated_satgas", lastUpdate: "2 minggu lalu" },
];

const INTENT_CONFIG: Record<Intent, { label: string; className: string }> = {
  document: { label: "Dokumentasi", className: "bg-blue-100 text-blue-700" },
  consult: { label: "Konsultasi", className: "bg-[#EAF3EE] text-[#5B8A6F]" },
  satgas: { label: "Satgas", className: "bg-purple-100 text-purple-700" },
};

const PRIORITY_CONFIG: Record<Priority, { label: string; className: string }> = {
  urgent: { label: "Urgent", className: "bg-red-100 text-red-700" },
  normal: { label: "Normal", className: "bg-yellow-100 text-yellow-700" },
  low: { label: "Rendah", className: "bg-green-100 text-green-700" },
};

const STATUS_CONFIG: Record<Status, { label: string; className: string }> = {
  in_review: { label: "Ditinjau", className: "bg-yellow-100 text-yellow-700" },
  in_consultation: { label: "Konsultasi Aktif", className: "bg-[#EAF3EE] text-[#5B8A6F]" },
  escalated_satgas: { label: "Diteruskan ke Satgas", className: "bg-purple-100 text-purple-700" },
  done: { label: "Selesai", className: "bg-gray-100 text-gray-500" },
};

const FILTER_TABS = [
  { key: "all", label: "Semua" },
  { key: "in_consultation", label: "Aktif" },
  { key: "in_review", label: "Ditinjau" },
  { key: "done", label: "Selesai" },
];

export default function CasesPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = ALL_CASES.filter((c) => {
    const matchFilter = activeFilter === "all" || c.status === activeFilter;
    const matchSearch =
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.type.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-[#1B4F72]">Kasus Saya</h1>
        <p className="text-gray-500 text-sm mt-1">Semua kasus yang ditugaskan kepadamu</p>
      </motion.div>

      {/* Search + filter */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode atau jenis kasus..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#5B8A6F] focus:ring-2 focus:ring-[#5B8A6F]/20 transition-all"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeFilter === tab.key
                  ? "bg-[#5B8A6F] text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {tab.label}
              <span className="ml-1.5 text-xs opacity-70">
                ({ALL_CASES.filter((c) => tab.key === "all" || c.status === tab.key).length})
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* List kasus */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-300 text-sm">Tidak ada kasus ditemukan.</div>
        )}
        {filtered.map((c, i) => (
          <motion.button
            key={c.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => router.push(`/consultant/cases/${c.id}`)}
            className="w-full bg-white border border-gray-100 rounded-2xl p-5 text-left hover:shadow-sm hover:border-[#5B8A6F]/30 transition-all group"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className="font-mono font-bold text-[#1B4F72]">#{c.code}</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${PRIORITY_CONFIG[c.priority].className}`}>
                    {PRIORITY_CONFIG[c.priority].label}
                  </span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${INTENT_CONFIG[c.intent].className}`}>
                    {INTENT_CONFIG[c.intent].label}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{c.type}</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${STATUS_CONFIG[c.status].className}`}>
                    {STATUS_CONFIG[c.status].label}
                  </span>
                  <span className="text-xs text-gray-400">{c.lastUpdate}</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-300 group-hover:text-[#5B8A6F] transition-colors flex-shrink-0" />
            </div>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
