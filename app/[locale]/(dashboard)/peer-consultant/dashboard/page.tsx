"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FolderOpen,
  MessageCircle,
  Clock,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

// Data dummy — di produksi fetch dari Supabase
const STATS = [
  {
    key: "active",
    labelKey: "stat_active",
    value: 2,
    icon: FolderOpen,
    color: "text-primary",
    bg: "bg-[#EAF3EE]",
  },
  {
    key: "messages",
    labelKey: "stat_messages", // Misal pesan baru
    value: 5,
    icon: MessageCircle,
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

interface CaseItem {
  id: string;
  code: string;
  type: string;
  priority: Priority;
  status: string;
  lastUpdate: string;
}

const CASES: CaseItem[] = [
  {
    id: "1",
    code: "RPT-0047",
    type: "Pelecehan Verbal",
    priority: "urgent",
    status: "Konsultasi Aktif",
    lastUpdate: "10 menit lalu",
  },
  {
    id: "2",
    code: "RPT-0045",
    type: "Kekerasan Digital",
    priority: "normal",
    status: "Menunggu Respons",
    lastUpdate: "2 jam lalu",
  },
];

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

export default function PeerConsultantDashboardPage() {
  const t = useTranslations("consultant");
  const router = useRouter();

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-primary">
          Halo, Peer Consultant 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Ini adalah ringkasan kasus yang Anda dampingi hari ini.</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-card rounded-2xl p-5 border border-border shadow-sm"
            >
              <div
                className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}
              >
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-3xl font-bold text-primary">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{t(stat.labelKey)}</p>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-primary">{t("cases_title")}</h2>
          <button
            onClick={() => router.push("/peer-consultant/cases")}
            className="text-sm text-primary hover:underline font-medium"
          >
            {t("cases_view_all")} →
          </button>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="px-6 py-3">{t("table_code")}</th>
                <th className="px-6 py-3">{t("table_type")}</th>
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
                  className="hover:bg-muted/50 transition-colors"
                >
                  <td className="px-6 py-4 font-mono font-semibold text-primary">
                    #{c.code}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{c.type}</td>
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
                  <td className="px-6 py-4 text-muted-foreground">{c.status}</td>
                  <td className="px-6 py-4 text-muted-foreground text-xs">
                    {c.lastUpdate}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() =>
                        router.push(`/peer-consultant/cases/${c.id}`)
                      }
                      className="flex items-center gap-1 text-primary hover:text-[#3d6b52] font-medium text-xs transition-colors"
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

        <div className="md:hidden divide-y divide-gray-50">
          {CASES.map((c) => (
            <button
              key={c.id}
              onClick={() => router.push(`/peer-consultant/cases/${c.id}`)}
              className="w-full px-4 py-4 text-left hover:bg-muted transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-semibold text-primary text-sm">
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
                  <ChevronRight size={14} className="text-muted-foreground" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{c.type}</p>
              <p className="text-xs text-muted-foreground mt-1">{c.lastUpdate}</p>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
