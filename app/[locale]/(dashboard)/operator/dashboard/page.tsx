"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { FileText, AlertCircle, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";

export default function OperatorDashboardPage() {
  const t = useTranslations("operator");
  const router = useRouter();

  const STATS = [
    { key: "total", labelKey: "stat_campus_reports", value: 45, icon: FileText, color: "text-primary", bg: "bg-primary/10" },
    { key: "pending", labelKey: "stat_pending_triage", value: 12, icon: AlertCircle, color: "text-[#F4A261]", bg: "bg-[#F4A261]/20" },
    { key: "escalated", labelKey: "stat_escalated", value: 8, icon: ShieldAlert, color: "text-red-500", bg: "bg-red-100" },
  ];

  const RECENT_REPORTS = [
    { id: "1", code: "RPT-UI-0123", date: "2024-06-15", type: "Pelecehan Fisik", status: "Menunggu Triase" },
    { id: "2", code: "RPT-UI-0124", date: "2024-06-16", type: "Kekerasan Digital", status: "Diteruskan ke Satgas" },
    { id: "3", code: "RPT-UI-0125", date: "2024-06-16", type: "Pelecehan Verbal", status: "Menunggu Triase" },
  ];

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-[#4a3568]">{t("dashboard_title")}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t("dashboard_subtitle")}</p>
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
              className="bg-card rounded-2xl p-5 border border-purple-100 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-3xl font-bold text-[#4a3568]">{stat.value}</p>
                  <p className="text-sm text-muted-foreground font-medium mt-1">{t(stat.labelKey)}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Reports */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card rounded-2xl border border-purple-100 shadow-sm overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-purple-50 flex justify-between items-center bg-background">
          <h2 className="font-bold text-[#4a3568]">{t("recent_reports_title")}</h2>
          <button 
            onClick={() => router.push('/operator/reports')}
            className="text-sm font-semibold text-primary hover:text-[#5a4282]"
          >
            Lihat Semua
          </button>
        </div>
        <div className="divide-y divide-purple-50">
          {RECENT_REPORTS.map((report) => (
            <div key={report.id} className="p-4 flex items-center justify-between hover:bg-purple-50/50 transition-colors">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-semibold text-primary">{report.code}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    report.status.includes('Triase') ? 'bg-[#F4A261]/20 text-[#c87630]' : 'bg-red-100 text-red-700'
                  }`}>
                    {report.status}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                  <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{report.type}</span>
                  <span className="text-muted-foreground">&bull;</span>
                  <span>{report.date}</span>
                </div>
              </div>
              <button 
                onClick={() => router.push(`/operator/reports/${report.id}`)}
                className="px-3 py-1.5 bg-card border border-[#7B5EA7] text-primary hover:bg-primary hover:text-white rounded-lg text-sm font-medium transition-colors"
              >
                {t("btn_view_details")}
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
