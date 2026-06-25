"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "../../../../../../lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import ChatWindow from "../../../../_components/ChatWindow";
import {
  ArrowLeft,
  FileText,
  MessageCircle,
  NotebookPen,
  ChevronDown,
  Clock,
  User,
  Save,
} from "lucide-react";

type TabKey = "info" | "chat" | "notes";

const STATUS_OPTIONS = [
  { value: "in_review", label: "Sedang Ditinjau" },
  { value: "in_consultation", label: "Konsultasi Aktif" },
  { value: "escalated_satgas", label: "Diteruskan ke Satgas" },
  { value: "done", label: "Selesai" },
];

export default function CaseDetailPage() {
  const t = useTranslations("consultant");
  const router = useRouter();
  const params = useParams();

  const [activeTab, setActiveTab] = useState<TabKey>("info");
  
  const [report, setReport] = useState<{
    id: string
    tracking_code: string
    incident_type: string
    description: string
    status: string
    assigned_consultant_id: string
    created_at: string
    reporter?: { full_name: string }
  } | null>(null)
  
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  
  const [statusDropdown, setStatusDropdown] = useState(false);
  const [newNote, setNewNote] = useState("");
  // NOTE: Ideally notes should also be fetched from Supabase, but keeping it local state for now as instructed.
  const [notes, setNotes] = useState<{id: string, content: string, timestamp: string}[]>([]);
  const [savingNote, setSavingNote] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')
      setCurrentUserId(user.id)
      
      const { data: reportData } = await supabase
        .from('reports')
        .select('*, reporter:users!reports_reporter_id_fkey(full_name)')
        .eq('id', params.id as string)
        .eq('assigned_consultant_id', user.id)
        .maybeSingle()
      
      if (reportData) setReport(reportData)
      setLoading(false)

      channel = supabase
        .channel(`escalation-consultant-${user.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'escalation_notifications',
          filter: `to_user_id=eq.${user.id}`
        }, (payload) => {
          const notif = payload.new as {
            report_id: string, to_role: string, message: string, status: string
          }
          if (notif.status === 'approved' || notif.status === 'waiting_reporter_approval') {
            alert(`Kasus baru dieskalasi kepada Anda. Buka halaman Cases untuk melihat.`)
            router.push('/consultant/cases')
          }
        })
        .subscribe()
    }
    fetchData()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [params.id, router, supabase])

  const handleSaveNote = async () => {
    if (!newNote.trim()) return;
    setSavingNote(true);
    await new Promise((r) => setTimeout(r, 600)); // simulasi save
    setNotes((prev) => [
      ...prev,
      {
        id: `n${Date.now()}`,
        content: newNote,
        timestamp: new Date().toLocaleString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    setNewNote("");
    setSavingNote(false);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!report) return;
    // update status locally and to supabase
    setReport(prev => prev ? { ...prev, status: newStatus } : null);
    setStatusDropdown(false);
    await supabase.from('reports').update({ status: newStatus }).eq('id', report.id);
  }

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Memuat detail kasus...</div>;
  }

  if (!report) {
    return <div className="p-8 text-center text-muted-foreground">Kasus tidak ditemukan atau Anda tidak memiliki akses.</div>;
  }

  const currentStatusLabel =
    STATUS_OPTIONS.find((s) => s.value === report.status)?.label ?? report.status;

  const tabs: { key: TabKey; labelKey: string; icon: React.ElementType }[] = [
    { key: "info", labelKey: "tab_info", icon: FileText },
    { key: "chat", labelKey: "tab_chat", icon: MessageCircle },
    { key: "notes", labelKey: "tab_notes", icon: NotebookPen },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Back + header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-4 transition-colors"
        >
          <ArrowLeft size={16} />
          {t("back")}
        </button>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-primary font-mono">
              #{report.tracking_code || report.id.substring(0,8)}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">{report.incident_type?.replace(/_/g, " ")}</p>
          </div>

          {/* Dropdown status */}
          <div className="relative">
            <button
              onClick={() => setStatusDropdown(!statusDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-[#EAF3EE] text-primary rounded-xl text-sm font-semibold hover:bg-[#d6eade] transition-colors"
            >
              {currentStatusLabel}
              <ChevronDown size={14} />
            </button>

            <AnimatePresence>
              {statusDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-lg z-10 overflow-hidden min-w-[200px]"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleStatusChange(opt.value)}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors ${
                        report.status === opt.value
                          ? "font-semibold text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive
                  ? "bg-card text-primary shadow-sm"
                  : "text-muted-foreground hover:text-muted-foreground"
              }`}
            >
              <Icon size={15} />
              <span className="hidden sm:inline">{t(tab.labelKey)}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {/* TAB: Info laporan */}
        {activeTab === "info" && (
          <motion.div
            key="info"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            className="space-y-4"
          >
            <InfoCard
              icon={FileText}
              title={t("info_incident")}
              items={[
                { label: t("info_type"), value: report.incident_type?.replace(/_/g, " ") },
                { label: t("info_date"), value: new Date(report.created_at).toLocaleDateString("id-ID") },
              ]}
            />
            <InfoCard
              icon={User}
              title={t("info_perpetrator")}
              items={[
                {
                  label: "Pelapor",
                  value: report.reporter?.full_name || "Anonim",
                },
              ]}
            />
            {/* Deskripsi */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <h3 className="font-semibold text-primary text-sm mb-3">
                {t("info_description")}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {report.description || "Tidak ada deskripsi."}
              </p>
            </div>
          </motion.div>
        )}

        {/* TAB: Chat */}
        {activeTab === "chat" && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            className="w-full"
          >
            {currentUserId ? (
              <ChatWindow 
                reportId={report.id}
                currentUserId={currentUserId}
                userRole="consultant"
              />
            ) : (
              <div className="bg-card rounded-2xl border border-border p-8 text-center text-muted-foreground">
                Memuat obrolan...
              </div>
            )}
          </motion.div>
        )}

        {/* TAB: Catatan pribadi */}
        {activeTab === "notes" && (
          <motion.div
            key="notes"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            className="space-y-4"
          >
            {/* Input catatan baru */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <label className="block text-sm font-semibold text-primary mb-2">
                {t("notes_new_label")}
              </label>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={4}
                placeholder={t("notes_placeholder")}
                className="w-full border border-border rounded-xl px-4 py-3 text-sm text-card-foreground resize-none focus:outline-none focus:border-[#5B8A6F] focus:ring-2 focus:ring-[#5B8A6F]/20 transition placeholder:text-gray-300"
              />
              <div className="flex justify-end mt-3">
                <button
                  onClick={handleSaveNote}
                  disabled={!newNote.trim() || savingNote}
                  className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-[#3d6b52] disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition active:scale-95"
                >
                  <Save size={14} />
                  {savingNote ? t("notes_saving") : t("notes_save")}
                </button>
              </div>
            </div>

            {/* Riwayat catatan */}
            <div className="space-y-3">
              {notes.length === 0 && (
                <p className="text-center text-sm text-gray-300 py-6">
                  {t("notes_empty")}
                </p>
              )}
              {[...notes].reverse().map((note) => (
                <div
                  key={note.id}
                  className="bg-card rounded-2xl border border-border p-5"
                >
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    {note.content}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-gray-300">
                    <Clock size={11} />
                    {note.timestamp}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Sub-komponen ──────────────────────────────────────────

function InfoCard({
  icon: Icon,
  title,
  items,
}: {
  icon: React.ElementType;
  title: string;
  items: { label: string; value: string }[];
}) {
  return (
    <div className="bg-card rounded-2xl border border-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-[#EAF3EE] flex items-center justify-center">
          <Icon size={14} className="text-primary" />
        </div>
        <h3 className="font-semibold text-primary text-sm">{title}</h3>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex justify-between text-sm gap-4">
            <span className="text-muted-foreground flex-shrink-0">{item.label}</span>
            <span className="text-card-foreground font-medium text-right">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
