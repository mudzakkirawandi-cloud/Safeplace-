"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Search, Filter, MoreHorizontal, CheckSquare, Square } from "lucide-react";

export default function AdminReportsPage() {
  const t = useTranslations("admin");
  const [selected, setSelected] = useState<string[]>([]);

  const DUMMY_REPORTS = [
    { id: "1", code: "RPT-0123", date: "2024-06-15", type: "Pelecehan Fisik", intent: "Satgas", priority: "Urgent", status: "Sedang Ditinjau" },
    { id: "2", code: "RPT-0124", date: "2024-06-16", type: "Kekerasan Digital", intent: "Konsultasi", priority: "Normal", status: "Konsultasi Aktif" },
  ];

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2C3E6B]">{t("reports_title")}</h1>
        </div>
        <div className="flex gap-2">
          {/* Action buttons show up if selected > 0 */}
          {selected.length > 0 && (
            <>
              <button className="px-3 py-1.5 bg-[#4ECDC4] text-white text-sm rounded-lg font-medium">
                {t("bulk_assign")}
              </button>
              <button className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg font-medium">
                {t("bulk_urgent")}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder={t("search_placeholder")}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]/50"
          />
        </div>
        <select className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none">
          <option>{t("filter_status")}</option>
        </select>
        <select className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none">
          <option>{t("filter_intent")}</option>
        </select>
        <select className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none">
          <option>{t("filter_priority")}</option>
        </select>
        <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500">
          <Filter size={18} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4 w-12">
                  <button onClick={() => setSelected(selected.length === DUMMY_REPORTS.length ? [] : DUMMY_REPORTS.map(r => r.id))}>
                    {selected.length === DUMMY_REPORTS.length ? <CheckSquare size={16} className="text-[#4ECDC4]" /> : <Square size={16} />}
                  </button>
                </th>
                <th className="px-6 py-4">{t("table_col_code")}</th>
                <th className="px-6 py-4">{t("table_col_date")}</th>
                <th className="px-6 py-4">{t("table_col_type")}</th>
                <th className="px-6 py-4">{t("table_col_intent")}</th>
                <th className="px-6 py-4">{t("table_col_priority")}</th>
                <th className="px-6 py-4">{t("table_col_status")}</th>
                <th className="px-6 py-4 text-right">{t("table_col_action")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {DUMMY_REPORTS.map(report => (
                <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <button onClick={() => toggleSelect(report.id)}>
                      {selected.includes(report.id) ? <CheckSquare size={16} className="text-[#4ECDC4]" /> : <Square size={16} className="text-gray-300" />}
                    </button>
                  </td>
                  <td className="px-6 py-4 font-mono font-medium text-[#2C3E6B]">{report.code}</td>
                  <td className="px-6 py-4 text-gray-500">{report.date}</td>
                  <td className="px-6 py-4 text-gray-700">{report.type}</td>
                  <td className="px-6 py-4 text-gray-500">{report.intent}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${report.priority === 'Urgent' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {report.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{report.status}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1 hover:bg-gray-200 rounded text-gray-400">
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
