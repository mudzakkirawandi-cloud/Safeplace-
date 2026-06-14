"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Search, Filter, Edit3, Eye, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "../../../../../lib/supabase/client";

export default function SatgasCasesPage() {
  const t = useTranslations("satgas");
  const supabase = createClient();

  const [search, setSearch] = useState("");
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  
  const [updateStatus, setUpdateStatus] = useState("Diterima");
  const [updateNotes, setUpdateNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const CASES = [
    { id: "1", code: "RPT-UI-0128", date: "2024-06-18", type: "Pelecehan Fisik", priority: "Urgent", status: "Laporan Baru" },
    { id: "2", code: "RPT-UI-0122", date: "2024-06-17", type: "Kekerasan Seksual", priority: "Urgent", status: "Investigasi" },
    { id: "3", code: "RPT-UI-0115", date: "2024-06-15", type: "Kekerasan Seksual", priority: "Tinggi", status: "Penyusunan BAP" },
    { id: "4", code: "RPT-UI-0105", date: "2024-06-10", type: "Pelecehan Verbal", priority: "Sedang", status: "Mediasi" },
    { id: "5", code: "RPT-UI-0098", date: "2024-06-01", type: "Kekerasan Fisik", priority: "Urgent", status: "Selesai" },
  ];

  const filtered = CASES.filter(c => c.code.toLowerCase().includes(search.toLowerCase()) || c.type.toLowerCase().includes(search.toLowerCase()));

  const openUpdateModal = (reportId: string) => {
    setSelectedReportId(reportId);
    setUpdateStatus("Diterima");
    setUpdateNotes("");
    setIsUpdateModalOpen(true);
  };

  const handleUpdateSubmit = async () => {
    if (!selectedReportId) return;
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from('satgas_case_updates').insert({
        report_id: selectedReportId,
        status: updateStatus,
        notes: updateNotes,
        updated_at: new Date().toISOString()
      });

      if (error) {
        console.error("Error saving update:", error);
        alert("Gagal menyimpan update ke database.");
      } else {
        alert("Status berhasil diperbarui!");
        setIsUpdateModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

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
                    <button 
                      onClick={() => openUpdateModal(report.id)}
                      className="p-2 text-[#D4AC0D] hover:bg-[#D4AC0D]/10 rounded-lg transition-colors" 
                      title={t("btn_update_status")}
                    >
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

      {/* Modal Update Status */}
      <AnimatePresence>
        {isUpdateModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsUpdateModalOpen(false)}
              className="fixed inset-0 bg-black/40 z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-xl z-50 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bold text-lg text-[#154360]">{t("btn_update_status")}</h2>
                <button onClick={() => setIsUpdateModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                  <X size={20} />
                </button>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#1A5276] mb-1">Status Penanganan</label>
                  <select 
                    value={updateStatus}
                    onChange={(e) => setUpdateStatus(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AC0D]/50 bg-white"
                  >
                    <option value="Diterima">Diterima</option>
                    <option value="Sedang Diinvestigasi">Sedang Diinvestigasi</option>
                    <option value="Mediasi">Mediasi</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1A5276] mb-1">Catatan Resmi</label>
                  <textarea 
                    rows={4} 
                    value={updateNotes}
                    onChange={(e) => setUpdateNotes(e.target.value)}
                    placeholder="Masukkan catatan perkembangan kasus..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AC0D]/50"
                  />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-[#EBF5FB]/30">
                <button 
                  onClick={() => setIsUpdateModalOpen(false)} 
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
                >
                  Batal
                </button>
                <button 
                  onClick={handleUpdateSubmit}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#1A5276] hover:bg-[#154360] disabled:bg-gray-400 text-white text-sm font-semibold rounded-xl transition-all"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Update"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
