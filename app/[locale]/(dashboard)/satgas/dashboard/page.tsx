"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Activity, Bell, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SatgasDashboardPage() {
  const t = useTranslations("satgas");
  const router = useRouter();

  const STATS = [
    { key: "pending", labelKey: "stat_pending_cases", value: 3, icon: Bell, color: "text-[#D4AC0D]", bg: "bg-[#D4AC0D]/20" },
    { key: "active", labelKey: "stat_active_cases", value: 12, icon: Activity, color: "text-[#1A5276]", bg: "bg-[#1A5276]/10" },
    { key: "resolved", labelKey: "stat_resolved_cases", value: 45, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100" },
  ];

  const RECENT_CASES = [
    { id: "1", code: "RPT-UI-0128", date: "2024-06-18", type: "Pelecehan Fisik", status: "Laporan Baru" },
    { id: "2", code: "RPT-UI-0122", date: "2024-06-17", type: "Kekerasan Seksual", status: "Investigasi" },
    { id: "3", code: "RPT-UI-0115", date: "2024-06-15", type: "Kekerasan Seksual", status: "Penyusunan BAP" },
  ];

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-[#154360]">{t("dashboard_title")}</h1>
        <p className="text-[#1A5276]/80 text-sm mt-1">{t("dashboard_subtitle")}</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STATS.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-5 border border-blue-100 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-3xl font-bold text-[#154360]">{stat.value}</p>
                  <p className="text-sm text-[#1A5276]/80 font-medium mt-1">{t(stat.labelKey)}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Cases */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-blue-50 flex justify-between items-center bg-[#EBF5FB]/50">
          <h2 className="font-bold text-[#154360]">{t("recent_cases_title")}</h2>
          <button 
            onClick={() => router.push('/satgas/cases')}
            className="text-sm font-semibold text-[#2471A3] hover:text-[#154360]"
          >
            Lihat Semua
          </button>
        </div>
        <div className="divide-y divide-blue-50">
          {RECENT_CASES.map((report) => (
            <div key={report.id} className="p-4 flex items-center justify-between hover:bg-blue-50/50 transition-colors">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-semibold text-[#1A5276]">{report.code}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    report.status === 'Laporan Baru' ? 'bg-[#D4AC0D]/20 text-[#9c7d04]' : 'bg-blue-100 text-[#1A5276]'
                  }`}>
                    {report.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                  <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{report.type}</span>
                  <span className="text-gray-400">&bull;</span>
                  <span>{report.date}</span>
                </div>
              </div>
              <button 
                onClick={() => router.push(`/satgas/cases/${report.id}`)}
                className="px-3 py-1.5 bg-white border border-[#2471A3] text-[#2471A3] hover:bg-[#2471A3] hover:text-white rounded-lg text-sm font-medium transition-colors"
              >
                {t("btn_update_status")}
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
