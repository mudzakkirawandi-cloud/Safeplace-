"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Bell, CheckCircle2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../../../lib/supabase/client";

export default function SatgasDashboardPage() {
  const t = useTranslations("satgas");
  const router = useRouter();
  const supabase = createClient();

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  
  const [updateStatus, setUpdateStatus] = useState("Diterima");
  const [updateNotes, setUpdateNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [newEscalationNotif, setNewEscalationNotif] = useState<string | null>(null);
  const [showEscalationPopup, setShowEscalationPopup] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setCurrentUserId(data.user.id);
      }
    });
  }, [supabase]);

  useEffect(() => {
    if (!currentUserId) return
    
    const channel = supabase
      .channel(`escalation-satgas-${currentUserId}-${Date.now()}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'escalation_notifications',
        filter: `to_user_id=eq.${currentUserId}`
      }, (payload) => {
        const notif = payload.new as {
          report_id: string
          to_role: string
          status: string
        }
        if (notif.status === 'approved') {
          setNewEscalationNotif(notif.report_id)
          setShowEscalationPopup(true)
          setTimeout(() => setShowEscalationPopup(false), 8000)
        }
      })
      .subscribe()
    
    return () => { supabase.removeChannel(channel) }
  }, [currentUserId, supabase])

  const STATS = [
    { key: "pending", labelKey: "stat_pending_cases", value: 3, icon: Bell, color: "text-[#D4AC0D]", bg: "bg-[#D4AC0D]/20" },
    { key: "active", labelKey: "stat_active_cases", value: 12, icon: Activity, color: "text-primary", bg: "bg-primary/10" },
    { key: "resolved", labelKey: "stat_resolved_cases", value: 45, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100" },
  ];

  const RECENT_CASES = [
    { id: "1", code: "RPT-UI-0128", date: "2024-06-18", type: "Pelecehan Fisik", status: "Laporan Baru" },
    { id: "2", code: "RPT-UI-0122", date: "2024-06-17", type: "Kekerasan Seksual", status: "Investigasi" },
    { id: "3", code: "RPT-UI-0115", date: "2024-06-15", type: "Kekerasan Seksual", status: "Penyusunan BAP" },
  ];

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
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-[#154360]">{t("dashboard_title")}</h1>
        <p className="text-primary/80 text-sm mt-1">{t("dashboard_subtitle")}</p>
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
              className="bg-card rounded-2xl p-5 border border-blue-100 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-3xl font-bold text-[#154360]">{stat.value}</p>
                  <p className="text-sm text-primary/80 font-medium mt-1">{t(stat.labelKey)}</p>
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
        className="bg-card rounded-2xl border border-blue-100 shadow-sm overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-blue-50 flex justify-between items-center bg-background/50">
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
                  <span className="font-mono font-semibold text-primary">{report.code}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    report.status === 'Laporan Baru' ? 'bg-[#D4AC0D]/20 text-[#9c7d04]' : 'bg-blue-100 text-primary'
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
                onClick={() => openUpdateModal(report.id)}
                className="px-3 py-1.5 bg-card border border-[#2471A3] text-[#2471A3] hover:bg-[#2471A3] hover:text-white rounded-lg text-sm font-medium transition-colors"
              >
                {t("btn_update_status")}
              </button>
            </div>
          ))}
        </div>
      </motion.div>

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
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card rounded-2xl shadow-xl z-50 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <h2 className="font-bold text-lg text-[#154360]">{t("btn_update_status")}</h2>
                <button onClick={() => setIsUpdateModalOpen(false)} className="p-1 text-muted-foreground hover:text-muted-foreground hover:bg-gray-100 rounded-lg">
                  <X size={20} />
                </button>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-primary mb-1">Status Penanganan</label>
                  <select 
                    value={updateStatus}
                    onChange={(e) => setUpdateStatus(e.target.value)}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AC0D]/50 bg-card"
                  >
                    <option value="Diterima">Diterima</option>
                    <option value="Sedang Diinvestigasi">Sedang Diinvestigasi</option>
                    <option value="Mediasi">Mediasi</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary mb-1">Catatan Resmi</label>
                  <textarea 
                    rows={4} 
                    value={updateNotes}
                    onChange={(e) => setUpdateNotes(e.target.value)}
                    placeholder="Masukkan catatan perkembangan kasus..."
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AC0D]/50"
                  />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-border flex justify-end gap-3 bg-background/30">
                <button 
                  onClick={() => setIsUpdateModalOpen(false)} 
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-card-foreground"
                >
                  Batal
                </button>
                <button 
                  onClick={handleUpdateSubmit}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary hover:bg-[#154360] disabled:bg-gray-400 text-white text-sm font-semibold rounded-xl transition-all"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Update"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {showEscalationPopup && newEscalationNotif && (
        <div className="fixed bottom-6 right-6 bg-white rounded-2xl shadow-xl p-4 z-50 max-w-sm border border-blue-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-lg">⚡</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800 text-sm">
                Kasus Dieskalasi ke Anda
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Menunggu persetujuan pelapor
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => {
                router.push(`/satgas/cases`)
                setShowEscalationPopup(false)
              }}
              className="flex-1 bg-blue-600 text-white text-xs py-2 rounded-xl hover:bg-blue-700 transition font-medium">
              Lihat Kasus
            </button>
            <button
              onClick={() => setShowEscalationPopup(false)}
              className="flex-1 border border-gray-200 text-gray-600 text-xs py-2 rounded-xl hover:bg-gray-50 transition">
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
