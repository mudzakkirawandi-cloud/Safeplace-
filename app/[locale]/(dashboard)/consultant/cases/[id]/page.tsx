"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
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
  MapPin,
  User,
  Shield,
  Save,
} from "lucide-react";

type TabKey = "info" | "chat" | "notes";

// Data dummy — di produksi fetch dari Supabase berdasarkan params.id
const CASE = {
  id: "1",
  code: "RPT-0047",
  status: "in_consultation",
  intent: "consult",
  type: "Pelecehan Verbal",
  date: "10 Juni 2024",
  location: "Gedung A, Lantai 3",
  campus: "Universitas SafePlace",
  relationship: "Rekan kerja / teman sekelas",
  safety: "Aman",
  description:
    "Kejadian berlangsung di lingkungan kampus. Pelapor merasa tidak nyaman dengan perilaku yang diterima secara berulang.",
  attachments: 2,
  notes: [
    {
      id: "n1",
      content:
        "Pelapor tampak masih dalam kondisi stres. Perlu pendekatan yang hati-hati dan sabar.",
      timestamp: "12 Jun 2024, 10:30",
    },
  ],
};

const STATUS_OPTIONS = [
  { value: "in_review", label: "Sedang Ditinjau" },
  { value: "in_consultation", label: "Konsultasi Aktif" },
  { value: "escalated_satgas", label: "Diteruskan ke Satgas" },
  { value: "done", label: "Selesai" },
];

export default function CaseDetailPage() {
  const t = useTranslations("consultant");
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabKey>("info");
  const [status, setStatus] = useState(CASE.status);
  const [statusDropdown, setStatusDropdown] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [notes, setNotes] = useState(CASE.notes);
  const [savingNote, setSavingNote] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setCurrentUserId(data.user.id);
    });
  }, [supabase.auth]);

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

  const currentStatusLabel =
    STATUS_OPTIONS.find((s) => s.value === status)?.label ?? status;

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
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#5B8A6F] mb-4 transition-colors"
        >
          <ArrowLeft size={16} />
          {t("back")}
        </button>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-[#1B4F72] font-mono">
              #{CASE.code}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">{CASE.type}</p>
          </div>

          {/* Dropdown status */}
          <div className="relative">
            <button
              onClick={() => setStatusDropdown(!statusDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-[#EAF3EE] text-[#5B8A6F] rounded-xl text-sm font-semibold hover:bg-[#d6eade] transition-colors"
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
                  className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-10 overflow-hidden min-w-[200px]"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setStatus(opt.value);
                        setStatusDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                        status === opt.value
                          ? "font-semibold text-[#5B8A6F]"
                          : "text-gray-600"
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
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-white text-[#5B8A6F] shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
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
                { label: t("info_type"), value: CASE.type },
                { label: t("info_date"), value: CASE.date },
                {
                  label: t("info_attachments"),
                  value: `${CASE.attachments} file`,
                },
              ]}
            />
            <InfoCard
              icon={MapPin}
              title={t("info_location")}
              items={[
                { label: t("info_location_detail"), value: CASE.location },
                { label: t("info_campus"), value: CASE.campus },
              ]}
            />
            <InfoCard
              icon={User}
              title={t("info_perpetrator")}
              items={[
                {
                  label: t("info_relationship"),
                  value: CASE.relationship,
                },
              ]}
            />
            <InfoCard
              icon={Shield}
              title={t("info_safety")}
              items={[{ label: t("info_safety_status"), value: CASE.safety }]}
            />

            {/* Deskripsi */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-semibold text-[#1B4F72] text-sm mb-3">
                {t("info_description")}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {CASE.description}
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
                reportId={CASE.id}
                currentUserId={currentUserId}
                userRole="consultant"
              />
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400">
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
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <label className="block text-sm font-semibold text-[#1B4F72] mb-2">
                {t("notes_new_label")}
              </label>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={4}
                placeholder={t("notes_placeholder")}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 resize-none focus:outline-none focus:border-[#5B8A6F] focus:ring-2 focus:ring-[#5B8A6F]/20 transition-all placeholder:text-gray-300"
              />
              <div className="flex justify-end mt-3">
                <button
                  onClick={handleSaveNote}
                  disabled={!newNote.trim() || savingNote}
                  className="flex items-center gap-2 px-4 py-2 bg-[#5B8A6F] hover:bg-[#3d6b52] disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all active:scale-95"
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
                  className="bg-white rounded-2xl border border-gray-100 p-5"
                >
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">
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
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-[#EAF3EE] flex items-center justify-center">
          <Icon size={14} className="text-[#5B8A6F]" />
        </div>
        <h3 className="font-semibold text-[#1B4F72] text-sm">{title}</h3>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex justify-between text-sm gap-4">
            <span className="text-gray-400 flex-shrink-0">{item.label}</span>
            <span className="text-gray-700 font-medium text-right">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
