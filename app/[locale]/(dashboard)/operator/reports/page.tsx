"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Search, Filter, ShieldAlert, Eye } from "lucide-react";
import { motion } from "framer-motion";

export default function OperatorReportsPage() {
  const t = useTranslations("operator");
  const [search, setSearch] = useState("");

  const REPORTS = [
    { id: "1", code: "RPT-UI-0123", date: "2024-06-15", type: "Pelecehan Fisik", status: "Menunggu Triase" },
    { id: "2", code: "RPT-UI-0124", date: "2024-06-16", type: "Kekerasan Digital", status: "Diteruskan ke Satgas" },
    { id: "3", code: "RPT-UI-0125", date: "2024-06-16", type: "Pelecehan Verbal", status: "Menunggu Triase" },
    { id: "4", code: "RPT-UI-0126", date: "2024-06-17", type: "Kekerasan Seksual", status: "Dalam Penanganan" },
    { id: "5", code: "RPT-UI-0127", date: "2024-06-18", type: "Pelecehan Verbal", status: "Selesai" },
  ];

  const filtered = REPORTS.filter(r => r.code.toLowerCase().includes(search.toLowerCase()) || r.type.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#4a3568]">{t("reports_title")}</h1>
          <p className="text-sm text-gray-500 mt-1">Hanya menampilkan laporan anonim dari kampus Anda.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 relative min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kode atau jenis..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7B5EA7]/30 focus:border-[#7B5EA7]"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 text-sm font-medium">
            <Filter size={16} />
            Filter
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#F8F5FC] text-[#4a3568] text-xs uppercase font-bold border-b border-purple-100">
              <tr>
                <th className="px-6 py-4">{t("table_col_code")}</th>
                <th className="px-6 py-4">{t("table_col_date")}</th>
                <th className="px-6 py-4">{t("table_col_type")}</th>
                <th className="px-6 py-4">{t("table_col_status")}</th>
                <th className="px-6 py-4 text-right">{t("table_col_action")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50">
              {filtered.map((report, i) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={report.id} 
                  className="hover:bg-purple-50/30 transition-colors"
                >
                  <td className="px-6 py-4 font-mono font-semibold text-[#7B5EA7]">{report.code}</td>
                  <td className="px-6 py-4 text-gray-500">{report.date}</td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs font-medium">
                      {report.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      report.status.includes('Triase') ? 'bg-[#F4A261]/20 text-[#c87630]' : 
                      report.status.includes('Satgas') ? 'bg-red-100 text-red-700' :
                      report.status === 'Selesai' ? 'bg-green-100 text-green-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {report.status.includes('Triase') && (
                      <button className="p-2 text-[#F4A261] hover:bg-[#F4A261]/10 rounded-lg transition-colors" title={t("btn_escalate")}>
                        <ShieldAlert size={18} />
                      </button>
                    )}
                    <button className="p-2 text-[#7B5EA7] hover:bg-[#7B5EA7]/10 rounded-lg transition-colors" title={t("btn_view_details")}>
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
