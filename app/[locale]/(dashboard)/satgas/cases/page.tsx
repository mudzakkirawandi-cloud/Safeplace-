"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Search, Filter, Edit3, Eye } from "lucide-react";
import { motion } from "framer-motion";

export default function SatgasCasesPage() {
  const t = useTranslations("satgas");
  const [search, setSearch] = useState("");

  const CASES = [
    { id: "1", code: "RPT-UI-0128", date: "2024-06-18", type: "Pelecehan Fisik", priority: "Urgent", status: "Laporan Baru" },
    { id: "2", code: "RPT-UI-0122", date: "2024-06-17", type: "Kekerasan Seksual", priority: "Urgent", status: "Investigasi" },
    { id: "3", code: "RPT-UI-0115", date: "2024-06-15", type: "Kekerasan Seksual", priority: "Tinggi", status: "Penyusunan BAP" },
    { id: "4", code: "RPT-UI-0105", date: "2024-06-10", type: "Pelecehan Verbal", priority: "Sedang", status: "Mediasi" },
    { id: "5", code: "RPT-UI-0098", date: "2024-06-01", type: "Kekerasan Fisik", priority: "Urgent", status: "Selesai" },
  ];

  const filtered = CASES.filter(c => c.code.toLowerCase().includes(search.toLowerCase()) || c.type.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#154360]">{t("cases_title")}</h1>
          <p className="text-sm text-[#1A5276]/80 mt-1">Daftar kasus yang diteruskan dan ditangani oleh Satgas Anda.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 relative min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kode kasus..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276]"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-[#1A5276] text-sm font-medium">
            <Filter size={16} />
            Filter
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#EBF5FB] text-[#154360] text-xs uppercase font-bold border-b border-blue-100">
              <tr>
                <th className="px-6 py-4">{t("table_col_code")}</th>
                <th className="px-6 py-4">{t("table_col_date")}</th>
                <th className="px-6 py-4">{t("table_col_type")}</th>
                <th className="px-6 py-4">{t("table_col_priority")}</th>
                <th className="px-6 py-4">{t("table_col_status")}</th>
                <th className="px-6 py-4 text-right">{t("table_col_action")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50">
              {filtered.map((report, i) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={report.id} 
                  className="hover:bg-blue-50/50 transition-colors"
                >
                  <td className="px-6 py-4 font-mono font-semibold text-[#1A5276]">{report.code}</td>
                  <td className="px-6 py-4 text-gray-500">{report.date}</td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs font-medium">
                      {report.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      report.priority === 'Urgent' ? 'bg-red-100 text-red-700' :
                      report.priority === 'Tinggi' ? 'bg-orange-100 text-orange-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {report.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      report.status === 'Laporan Baru' ? 'bg-[#D4AC0D]/20 text-[#9c7d04]' : 
                      report.status === 'Selesai' ? 'bg-green-100 text-green-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button className="p-2 text-[#D4AC0D] hover:bg-[#D4AC0D]/10 rounded-lg transition-colors" title={t("btn_update_status")}>
                      <Edit3 size={18} />
                    </button>
                    <button className="p-2 text-[#1A5276] hover:bg-[#1A5276]/10 rounded-lg transition-colors" title={t("btn_view_details")}>
                      <Eye size={18} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
