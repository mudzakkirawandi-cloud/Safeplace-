"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Mail, Phone, BookOpen, Briefcase, Archive, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Mock data
const MOCK_CONSULTANT = {
  id: "1",
  full_name: "Dr. Amanda Larasati",
  email: "amanda@example.com",
  whatsapp: "+6281234567890",
  type: "Profesional",
  status: "Aktif",
  education: "S3 Psikologi Klinis, Universitas Indonesia",
  experience: "10 tahun pendampingan korban kekerasan berbasis gender.",
  campus: "Universitas Indonesia",
  max_cases: 10,
  active_cases: 4,
};

const MOCK_REPLACEMENT_CONSULTANTS = [
  { id: "5", full_name: "Budi Santoso", active_cases: 2, max_cases: 5 },
  { id: "6", full_name: "Citra Kirana", active_cases: 1, max_cases: 8 },
];

interface Consultant {
  id: string;
  full_name: string;
  email: string;
  whatsapp: string;
  type: string;
  status: string;
  education: string;
  experience: string;
  campus: string;
  max_cases: number;
  active_cases: number;
}

export default function ConsultantDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [consultant, setConsultant] = useState<Consultant | null>(null);
  const [loading, setLoading] = useState(true);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [replacementId, setReplacementId] = useState("");
  const [archiving, setArchiving] = useState(false);

  useEffect(() => {
    // Simulate fetch
    setTimeout(() => {
      setConsultant({ ...MOCK_CONSULTANT, id: params.id });
      setLoading(false);
    }, 500);
  }, [params.id]);

  const handleArchive = async () => {
    if (!consultant) return;

    if (consultant.active_cases > 0 && !replacementId) {
      alert("Pilih konsultan pengganti untuk kasus aktif!");
      return;
    }

    setArchiving(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1500));
    
    // In production:
    // 1. Update cases where assigned_consultant_id = consultant.id to replacementId
    // 2. Notify affected reporters
    // 3. Update users table: set status = 'Diarsipkan', name = name + ' (Tidak Aktif)'

    setConsultant({ ...consultant, status: "Diarsipkan", full_name: consultant.full_name + " (Tidak Aktif)" });
    setIsArchiveModalOpen(false);
    setArchiving(false);
    alert("Konsultan berhasil diarsipkan.");
  };

  if (loading || !consultant) {
    return <div className="p-6 flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[#2C3E6B]" /></div>;
  }

  const isArchived = consultant.status === "Diarsipkan";

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#2C3E6B] mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Kembali ke Daftar Konsultan
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-[#2C3E6B]/10 text-[#2C3E6B] rounded-2xl flex items-center justify-center">
            <User size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#2C3E6B] flex items-center gap-3">
              {consultant.full_name}
              {isArchived ? (
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">Diarsipkan</span>
              ) : (
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">Aktif</span>
              )}
            </h1>
            <p className="text-sm text-gray-500 mt-1">{consultant.type} • {consultant.campus || "Tidak terafiliasi kampus"}</p>
          </div>
        </div>
        
        {!isArchived && (
          <button 
            onClick={() => setIsArchiveModalOpen(true)}
            className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 rounded-xl flex items-center gap-2 text-sm font-semibold transition-colors"
          >
            <Archive size={16} />
            Arsipkan Konsultan
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-semibold text-gray-800 text-sm border-b border-gray-100 pb-3">Informasi Kontak & Pendidikan</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-xs text-gray-400 flex items-center gap-1.5"><Mail size={12} /> Email</span>
                <p className="text-sm font-medium text-gray-800">{consultant.email}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-gray-400 flex items-center gap-1.5"><Phone size={12} /> WhatsApp</span>
                <p className="text-sm font-medium text-gray-800">{consultant.whatsapp}</p>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <span className="text-xs text-gray-400 flex items-center gap-1.5"><BookOpen size={12} /> Latar Belakang Pendidikan</span>
                <p className="text-sm font-medium text-gray-800">{consultant.education}</p>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <span className="text-xs text-gray-400 flex items-center gap-1.5"><Briefcase size={12} /> Pengalaman Relevan</span>
                <p className="text-sm font-medium text-gray-800">{consultant.experience}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-800 text-sm border-b border-gray-100 pb-3 mb-4">Statistik Kasus</h3>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">Kasus Aktif</span>
              <span className="text-lg font-bold text-[#2C3E6B]">{consultant.active_cases}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Kapasitas Maksimal</span>
              <span className="text-sm font-medium text-gray-800">{consultant.max_cases}</span>
            </div>
            <div className="mt-4 w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full rounded-full ${consultant.active_cases >= consultant.max_cases ? 'bg-red-500' : 'bg-[#2C3E6B]'}`} 
                style={{ width: `${Math.min((consultant.active_cases / consultant.max_cases) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isArchiveModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsArchiveModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-xl w-full max-w-md relative z-10 flex flex-col overflow-hidden">
              <div className="p-6 bg-red-50 border-b border-red-100 flex items-start gap-4">
                <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Archive size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-red-900">Arsipkan Konsultan?</h2>
                  <p className="text-sm text-red-700 mt-1">Konsultan tidak akan bisa login atau menerima kasus baru.</p>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {consultant.active_cases > 0 ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
                      <AlertTriangle size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-yellow-800">
                        Konsultan ini masih menangani <span className="font-bold">{consultant.active_cases} kasus aktif</span>. Anda harus mengalihkan kasus-kasus ini ke konsultan lain.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Pilih Konsultan Pengganti</label>
                      <select 
                        value={replacementId} 
                        onChange={(e) => setReplacementId(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                      >
                        <option value="">-- Pilih Konsultan --</option>
                        {MOCK_REPLACEMENT_CONSULTANTS.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.full_name} ({c.active_cases}/{c.max_cases} Kasus Aktif)
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <p className="text-xs text-gray-500 flex items-start gap-1">
                      <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" />
                      Sistem akan otomatis mengabari pelapor terkait pergantian konsultan ini.
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    Tidak ada kasus aktif yang ditangani. Anda dapat langsung mengarsipkan konsultan ini.
                  </p>
                )}
              </div>

              <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                <button 
                  onClick={() => setIsArchiveModalOpen(false)} 
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={handleArchive}
                  disabled={archiving || (consultant.active_cases > 0 && !replacementId)}
                  className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {archiving ? <Loader2 size={16} className="animate-spin" /> : "Ya, Arsipkan"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
