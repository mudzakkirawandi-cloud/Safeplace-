"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  FileText,
  ActivitySquare,
  Users,
  Clock,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const STATS = [
  { key: "total", labelKey: "stat_total_reports", value: 1254, icon: FileText, color: "text-blue-500", bg: "bg-blue-100", trend: "+12%" },
  { key: "active", labelKey: "stat_active_cases", value: 142, icon: ActivitySquare, color: "text-orange-500", bg: "bg-orange-100", trend: "-5%" },
  { key: "online", labelKey: "stat_online_consultants", value: 38, icon: Users, color: "text-[#4ECDC4]", bg: "bg-[#4ECDC4]/20", trend: "+2" },
  { key: "avg", labelKey: "stat_avg_response_time", value: "14m", icon: Clock, color: "text-purple-500", bg: "bg-purple-100", trend: "-2m" },
];

const TREND_DATA = [
  { date: "1 Jun", reports: 12 },
  { date: "5 Jun", reports: 19 },
  { date: "10 Jun", reports: 15 },
  { date: "15 Jun", reports: 25 },
  { date: "20 Jun", reports: 22 },
  { date: "25 Jun", reports: 30 },
  { date: "30 Jun", reports: 28 },
];

const PIE_DATA = [
  { name: "Consultation", value: 400, color: "#4ECDC4" },
  { name: "Document", value: 300, color: "#2C3E6B" },
  { name: "Satgas", value: 300, color: "#FF6B6B" },
];

export default function AdminDashboardPage() {
  const t = useTranslations("admin");

  return (
    <div className="p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-[#2C3E6B]">{t("dashboard_title")}</h1>
        <p className="text-gray-500 text-sm mt-1">{t("dashboard_subtitle")}</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat, i) => {
          const Icon = stat.icon;
          const isPositive = stat.trend.startsWith("+");
          return (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${isPositive ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
                  {stat.trend}
                </span>
              </div>
              <p className="text-3xl font-bold text-[#2C3E6B]">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-1">{t(stat.labelKey)}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm lg:col-span-2"
        >
          <h2 className="font-semibold text-[#2C3E6B] mb-6">{t("chart_trend_title")}</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={TREND_DATA} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="reports" stroke="#4ECDC4" strokeWidth={3} dot={{ r: 4, fill: "#4ECDC4", strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
        >
          <h2 className="font-semibold text-[#2C3E6B] mb-6">{t("chart_intent_title")}</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={PIE_DATA}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {PIE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Table Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6"
      >
        <h2 className="font-semibold text-[#2C3E6B] mb-4">{t("recent_reports_title")}</h2>
        <p className="text-sm text-gray-500">To see full reports, go to the Reports menu.</p>
      </motion.div>
    </div>
  );
}
