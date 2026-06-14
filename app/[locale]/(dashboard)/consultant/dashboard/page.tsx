"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FolderOpen,
  FolderPlus,
  Clock,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

// Data dummy — di produksi fetch dari Supabase
const STATS = [
  {
    key: "active",
    labelKey: "stat_active",
    value: 4,
    icon: FolderOpen,
    color: "text-[#5B8A6F]",
    bg: "bg-[#EAF3EE]",
  },
  {
    key: "new_today",
    labelKey: "stat_new_today",
    value: 2,
    icon: FolderPlus,
    color: "text-[#E8A87C]",
    bg: "bg-[#FDF3EB]",
  },
  {
    key: "waiting",
    labelKey: "stat_waiting",
    value: 1,
    icon: Clock,
    color: "text-yellow-600",
    bg: "bg-yellow-50",
  },
  {
    key: "done_week",
    labelKey: "stat_done_week",
    value: 3,
    icon: CheckCircle2,
    color: "text-green-600",
    bg: "bg-green-50",
  },
];

type Priority = "urgent" | "normal" | "low";
type Intent = "document" | "consult" | "satgas";

interface CaseItem {
  id: string;
  code: string;
  type: string;
  intent: Intent;
  priority: Priority;
  status: string;
  lastUpdate: string;
}

const CASES: CaseItem[] = [
  {
    id: "1",
    code: "RPT-0047",
    type: "Pelecehan Verbal",
    intent: "consult",
    priority: "urgent",
    status: "Konsultasi Aktif",
    lastUpdate: "10 menit lalu",
  },
  {
    id: "2",
    code: "RPT-0045",
    type: "Kekerasan Digital",
    intent: "document",
    priority: "normal",
    status: "Menunggu Respons",
    lastUpdate: "2 jam lalu",
  },
  {
    id: "3",
    code: "RPT-0041",
    type: "Pelecehan Fisik",
    intent: "satgas",
    priority: "normal",
    status: "Ditinjau",
    lastUpdate: "1 hari lalu",
  },
  {
    id: "4",
    code: "RPT-0038",
    type: "Kekerasan Seksual",
    intent: "consult",
    priority: "low",
    status: "Konsultasi Aktif",
    lastUpdate: "2 hari lalu",
  },
];

const INTENT_CONFIG: Record<Intent, { label: string; className: string }> = {
  document: {
    label: "Dokumentasi",
    className: "bg-blue-100 text-blue-700",
  },
  consult: {
    label: "Konsultasi",
    className: "bg-[#EAF3EE] text-[#5B8A6F]",
  },
  satgas: {
    label: "Satgas",
    className: "bg-purple-100 text-purple-700",
  },
};

const PRIORITY_CONFIG: Record<Priority, { label: string; className: string; pulse: boolean }> = {
  urgent: {
    label: "Urgent",
    className: "bg-red-100 text-red-700",
    pulse: true,
  },
  normal: {
    label: "Normal",
    className: "bg-yellow-100 text-yellow-700",
    pulse: false,
  },
  low: {
    label: "Rendah",
    className: "bg-green-100 text-green-700",
    pulse: false,
  },
};

export default function ConsultantDashboardPage() {
  const t = useTranslations("consultant");
  const router = useRouter();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-[#1B4F72]">
          {t("dashboard_title")} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">{t("dashboard_subtitle")}</p>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
            >
              <div
                className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}
              >
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-3xl font-bold text-[#1B4F72]">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-1">{t(stat.labelKey)}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Tabel kasus aktif */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-[#1B4F72]">{t("cases_title")}</h2>
          <button
            onClick={() => router.push("/consultant/cases")}
            className="text-sm text-[#5B8A6F] hover:underline font-medium"
          >
            {t("cases_view_all")} →
          </button>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-3">{t("table_code")}</th>
                <th className="px-6 py-3">{t("table_type")}</th>
                <th className="px-6 py-3">{t("table_intent")}</th>
                <th className="px-6 py-3">{t("table_priority")}</th>
                <th className="px-6 py-3">{t("table_status")}</th>
                <th className="px-6 py-3">{t("table_last_update")}</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {CASES.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-4 font-mono font-semibold text-[#1B4F72]">
                    #{c.code}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{c.type}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        INTENT_CONFIG[c.intent].className
                      }`}
                    >
                      {INTENT_CONFIG[c.intent].label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${
                        PRIORITY_CONFIG[c.priority].className
                      }`}
                    >
                      {PRIORITY_CONFIG[c.priority].pulse && (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      )}
                      {PRIORITY_CONFIG[c.priority].label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{c.status}</td>
                  <td className="px-6 py-4 text-gray-400 text-xs">
                    {c.lastUpdate}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() =>
                        router.push(`/consultant/cases/${c.id}`)
                      }
                      className="flex items-center gap-1 text-[#5B8A6F] hover:text-[#3d6b52] font-medium text-xs transition-colors"
                    >
                      {t("table_open")}
                      <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-gray-50">
          {CASES.map((c) => (
            <button
              key={c.id}
              onClick={() => router.push(`/consultant/cases/${c.id}`)}
              className="w-full px-4 py-4 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-semibold text-[#1B4F72] text-sm">
                  #{c.code}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      PRIORITY_CONFIG[c.priority].className
                    }`}
                  >
                    {PRIORITY_CONFIG[c.priority].label}
                  </span>
                  <ChevronRight size={14} className="text-gray-400" />
                </div>
              </div>
              <p className="text-sm text-gray-600">{c.type}</p>
              <p className="text-xs text-gray-400 mt-1">{c.lastUpdate}</p>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
