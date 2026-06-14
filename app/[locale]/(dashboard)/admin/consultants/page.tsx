"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../../../../lib/supabase/client";
import { Plus, Search, Filter, MoreVertical, Mail, MailWarning, UserX, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { v4 as uuidv4 } from "uuid";

// Note: In a real app, you would fetch these from the database
const CAMPUSES = [
  { id: "1", name: "Universitas Indonesia" },
  { id: "2", name: "Institut Teknologi Bandung" },
];

export default function AdminConsultantsPage() {
  const supabase = createClient();
  const [consultants, setConsultants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    whatsapp: "",
    education: "",
    experience: "",
    type: "Volunteer",
    campusId: "",
    maxCases: 10,
  });

  useEffect(() => {
    fetchConsultants();
  }, []);

  const fetchConsultants = async () => {
    setLoading(true);
    // Mock data for UI demonstration since we don't have the explicit table yet
    // In production: fetch from 'users' joined with 'consultant_invites'
    const mockConsultants = [
      { id: "1", full_name: "Dr. Amanda Larasati", email: "amanda@example.com", type: "Profesional", status: "Aktif", max_cases: 10, active_cases: 4 },
      { id: "2", full_name: "Budi Santoso", email: "budi@example.com", type: "Volunteer", status: "Undangan Terkirim", max_cases: 5, active_cases: 0 },
      { id: "3", full_name: "Citra Kirana", email: "citra@example.com", type: "Volunteer", status: "Undangan Expired", max_cases: 5, active_cases: 0 },
      { id: "4", full_name: "Deni Pratama (Tidak Aktif)", email: "deni@example.com", type: "Profesional", status: "Diarsipkan", max_cases: 15, active_cases: 0 },
    ];
    setConsultants(mockConsultants);
    setLoading(false);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    // Simulated DB insertion
    console.log("Inserting to users and consultant_invites:", { ...formData, token, expiresAt });
    
    // Add to UI immediately for demo
    setConsultants([{
      id: Date.now().toString(),
      full_name: formData.fullName,
      email: formData.email,
      type: formData.type,
      status: "Undangan Terkirim",
      max_cases: formData.maxCases,
      active_cases: 0
    }, ...consultants]);

    setSubmitting(false);
    setIsModalOpen(false);
    setFormData({
      fullName: "", email: "", whatsapp: "", education: "", experience: "", type: "Volunteer", campusId: "", maxCases: 10
    });
  };

  const resendInvite = (id: string) => {
    alert(`Mengirim ulang undangan ke konsultan ID: ${id}`);
    setConsultants(consultants.map(c => c.id === id ? { ...c, status: "Undangan Terkirim" } : c));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Aktif": return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">Aktif</span>;
      case "Undangan Terkirim": return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">Menunggu</span>;
      case "Undangan Expired": return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">Kedaluwarsa</span>;
      case "Diarsipkan": return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">Diarsipkan</span>;
      default: return null;
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2C3E6B]">Manajemen Konsultan</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola akses dan data konsultan pendamping.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#2C3E6B] hover:bg-[#1a2540] text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold transition-colors"
        >
          <Plus size={16} />
          Undang Konsultan Baru
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Cari nama atau email..." className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2C3E6B]/20" />
          </div>
          <button className="px-4 py-2 border border-gray-200 rounded-lg flex items-center gap-2 text-sm text-gray-600 hover:bg-gray-50">
            <Filter size={16} />
            Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-medium">
              <tr>
                <th className="px-6 py-4">Nama Lengkap</th>
                <th className="px-6 py-4">Tipe</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Kasus Aktif</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Memuat data...
                  </td>
                </tr>
              ) : consultants.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-800">{c.full_name}</div>
                    <div className="text-gray-500 text-xs">{c.email}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{c.type}</td>
                  <td className="px-6 py-4">{getStatusBadge(c.status)}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {c.active_cases} <span className="text-gray-400">/ {c.max_cases}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {c.status === "Undangan Expired" && (
                        <button onClick={() => resendInvite(c.id)} className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg" title="Kirim Ulang Undangan">
                          <MailWarning size={16} />
                        </button>
                      )}
                      <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-xl w-full max-w-2xl relative z-10 max-h-[90vh] flex flex-col">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-[#2C3E6B]">Undang Konsultan Baru</h2>
                <p className="text-sm text-gray-500">Kirim undangan akses dashboard konsultan.</p>
              </div>
              <div className="p-6 overflow-y-auto">
                <form id="invite-form" onSubmit={handleInvite} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">Nama Lengkap</label>
                      <input required type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:border-[#2C3E6B] focus:ring-1 focus:ring-[#2C3E6B] outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">Email</label>
                      <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:border-[#2C3E6B] focus:ring-1 focus:ring-[#2C3E6B] outline-none" />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Nomor WhatsApp</label>
                    <input required type="tel" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:border-[#2C3E6B] focus:ring-1 focus:ring-[#2C3E6B] outline-none" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Latar Belakang Pendidikan</label>
                    <textarea rows={2} required value={formData.education} onChange={e => setFormData({...formData, education: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:border-[#2C3E6B] focus:ring-1 focus:ring-[#2C3E6B] outline-none resize-none" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Pengalaman Relevan</label>
                    <textarea rows={2} required value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:border-[#2C3E6B] focus:ring-1 focus:ring-[#2C3E6B] outline-none resize-none" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Tipe Konsultan</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-sm"><input type="radio" name="type" checked={formData.type === "Volunteer"} onChange={() => setFormData({...formData, type: "Volunteer"})} /> Volunteer</label>
                        <label className="flex items-center gap-2 text-sm"><input type="radio" name="type" checked={formData.type === "Profesional"} onChange={() => setFormData({...formData, type: "Profesional"})} /> Profesional</label>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">Maksimal Kasus Aktif</label>
                      <input type="number" min="1" value={formData.maxCases} onChange={e => setFormData({...formData, maxCases: parseInt(e.target.value)})} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:border-[#2C3E6B] outline-none" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Kampus Afiliasi (Opsional)</label>
                    <select value={formData.campusId} onChange={e => setFormData({...formData, campusId: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:border-[#2C3E6B] outline-none">
                      <option value="">Pilih Kampus...</option>
                      {CAMPUSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </form>
              </div>
              <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors">Batal</button>
                <button form="invite-form" type="submit" disabled={submitting} className="px-4 py-2 text-sm font-semibold text-white bg-[#2C3E6B] hover:bg-[#1a2540] rounded-xl flex items-center gap-2 transition-colors disabled:opacity-70">
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  Kirim Undangan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
