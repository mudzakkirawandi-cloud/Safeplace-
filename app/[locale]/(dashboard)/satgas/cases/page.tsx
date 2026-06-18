"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Search, Filter, Edit3, Eye, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "../../../../../lib/supabase/client";
import { useRouter, useParams } from "next/navigation";

interface Report {
  id: string;
  tracking_code?: string;
  status: string;
  incident_type: string;
  priority: string;
  created_at: string;
  [key: string]: unknown;
}

export default function SatgasCasesPage() {
  const t = useTranslations("satgas");
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();

  const [search, setSearch] = useState("");
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  
  const [updateStatus, setUpdateStatus] = useState("under_review");
  const [updateNotes, setUpdateNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [cases, setCases] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCases = async () => {
    setLoading(true);
    // RLS handles the filtering by assigned_satgas_campus_id
    const { data } = await supabase
      .from("reports")
      .select("*")
      .not("assigned_satgas_campus_id", "is", null)
      .order("created_at", { ascending: false });
    
    if (data) setCases(data);
    setLoading(false);
  };

  const filtered = cases.filter(c => 
    (c.tracking_code?.toLowerCase().includes(search.toLowerCase()) || "") || 
    (c.incident_type?.toLowerCase().includes(search.toLowerCase()) || "")
  );

  const openUpdateModal = (reportId: string, currentStatus: string) => {
    setSelectedReportId(reportId);
    setUpdateStatus(currentStatus || "under_review");
    setUpdateNotes("");
    setIsUpdateModalOpen(true);
  };

  const handleUpdateSubmit = async () => {
    if (!selectedReportId) return;
    setIsSubmitting(true);
    
    try {
      const { error: updateError } = await supabase
        .from('reports')
        .update({ status: updateStatus, updated_at: new Date().toISOString() })
        .eq('id', selectedReportId);

      if (updateError) throw updateError;

      const { data: { session } } = await supabase.auth.getSession();
      
      const { error: notesError } = await supabase.from('satgas_case_updates').insert({
        report_id: selectedReportId,
        satgas_id: session?.user.id,
        status: updateStatus,
        notes: updateNotes,
        created_at: new Date().toISOString()
      });

      if (notesError) throw notesError;

      alert("Status berhasil diperbarui!");
      setIsUpdateModalOpen(false);
      fetchCases();
    } catch (err) {
      console.error("Error saving update:", err);
      alert("Gagal menyimpan update ke database.");
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
              placeholder="Cari kode kasus atau jenis..."
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
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">Memuat data...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">Tidak ada laporan ditemukan.</td>
                </tr>
              ) : (
                filtered.map((report, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={report.id} 
                    className="hover:bg-blue-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono font-semibold text-[#1A5276]">{report.tracking_code || report.id.substring(0,8)}</td>
                    <td className="px-6 py-4 text-gray-500">{new Date(report.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs font-medium uppercase">
                        {report.incident_type?.replace("_", " ") || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium uppercase ${
                        report.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                        report.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {report.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase ${
                        report.status === 'received' ? 'bg-[#D4AC0D]/20 text-[#9c7d04]' : 
                        report.status === 'resolved' ? 'bg-green-100 text-green-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {report.status?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => openUpdateModal(report.id, report.status)}
                        className="p-2 text-[#D4AC0D] hover:bg-[#D4AC0D]/10 rounded-lg transition-colors" 
                        title={t("btn_update_status")}
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => router.push(`/${params.locale}/satgas/cases/${report.id}`)}
                        className="p-2 text-[#1A5276] hover:bg-[#1A5276]/10 rounded-lg transition-colors" 
                        title={t("btn_view_details")}
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
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
                    <option value="received">Diterima (Received)</option>
                    <option value="under_review">Sedang Diinvestigasi (Under Review)</option>
                    <option value="escalated">Eskalasi (Escalated)</option>
                    <option value="resolved">Selesai (Resolved)</option>
                    <option value="closed">Ditutup (Closed)</option>
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
