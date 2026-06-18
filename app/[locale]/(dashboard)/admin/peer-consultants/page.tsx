"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Filter, MoreVertical, MailWarning, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { v4 as uuidv4 } from "uuid";

// Note: In a real app, you would fetch these from the database
const CAMPUSES = [
  { id: "1", name: "Universitas Indonesia" },
  { id: "2", name: "Institut Teknologi Bandung" },
];

interface PeerConsultant {
  id: string;
  full_name: string;
  email: string;
  type: string;
  status: string;
  max_cases: number;
  active_cases: number;
}

export default function AdminPeerConsultantsPage() {
  const [consultants, setConsultants] = useState<PeerConsultant[]>([]);
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
    maxCases: 5,
  });

  useEffect(() => {
    fetchConsultants();
  }, []);

  const fetchConsultants = async () => {
    setLoading(true);
    // Mock data for UI demonstration since we don't have the explicit table yet
    // In production: fetch from 'users' joined with 'consultant_invites' where role='peer_consultant'
    const mockConsultants = [
      { id: "1", full_name: "Mahasiswa A", email: "mhs.a@example.com", type: "Volunteer", status: "Aktif", max_cases: 5, active_cases: 2 },
      { id: "2", full_name: "Mahasiswa B", email: "mhs.b@example.com", type: "Volunteer", status: "Undangan Terkirim", max_cases: 5, active_cases: 0 },
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

    // Simulated DB insertion, in real app insert to `consultant_invites` with role='peer_consultant'
    console.log("Inserting to users and consultant_invites with role peer_consultant:", { ...formData, token, expiresAt });
    
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
      fullName: "", email: "", whatsapp: "", education: "", experience: "", type: "Volunteer", campusId: "", maxCases: 5
    });
  };

  const resendInvite = (id: string) => {
    alert(`Mengirim ulang undangan ke peer consultant ID: ${id}`);
    setConsultants(consultants.map(c => c.id === id ? { ...c, status: "Undangan Terkirim" } : c));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Aktif": return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">Aktif</span>;
      case "Undangan Terkirim": return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">Menunggu</span>;
      case "Undangan Expired": return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">Kedaluwarsa</span>;
      case "Diarsipkan": return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-muted-foreground">Diarsipkan</span>;
      default: return null;
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Manajemen Peer Consultant</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola akses dan data peer consultant (konselor sebaya).</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-[#1a2540] text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold transition-colors"
        >
          <Plus size={16} />
          Undang Peer Consultant Baru
        </button>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input type="text" placeholder="Cari nama atau email..." className="w-full pl-9 pr-4 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2C3E6B]/20" />
          </div>
          <button className="px-4 py-2 border border-border rounded-lg flex items-center gap-2 text-sm text-muted-foreground hover:bg-muted">
            <Filter size={16} />
            Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted text-muted-foreground font-medium">
              <tr>
                <th className="px-6 py-4">Nama Lengkap</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Kasus Aktif</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Memuat data...
                  </td>
                </tr>
              ) : consultants.map((c) => (
                <tr key={c.id} className="hover:bg-muted transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-card-foreground">{c.full_name}</div>
                    <div className="text-muted-foreground text-xs">{c.email}</div>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(c.status)}</td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {c.active_cases} <span className="text-muted-foreground">/ {c.max_cases}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {c.status === "Undangan Expired" && (
                        <button onClick={() => resendInvite(c.id)} className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg" title="Kirim Ulang Undangan">
                          <MailWarning size={16} />
                        </button>
                      )}
                      <button className="p-2 text-muted-foreground hover:bg-gray-100 rounded-lg">
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
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card rounded-2xl shadow-xl w-full max-w-2xl relative z-10 max-h-[90vh] flex flex-col">
              <div className="p-6 border-b border-border">
                <h2 className="text-lg font-bold text-primary">Undang Peer Consultant Baru</h2>
                <p className="text-sm text-muted-foreground">Kirim undangan akses dashboard peer consultant.</p>
              </div>
              <div className="p-6 overflow-y-auto">
                <form id="invite-form" onSubmit={handleInvite} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-card-foreground">Nama Lengkap</label>
                      <input required type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full border border-border rounded-xl px-4 py-2 text-sm focus:border-[#2C3E6B] focus:ring-1 focus:ring-[#2C3E6B] outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-card-foreground">Email</label>
                      <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border border-border rounded-xl px-4 py-2 text-sm focus:border-[#2C3E6B] focus:ring-1 focus:ring-[#2C3E6B] outline-none" />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-card-foreground">Nomor WhatsApp</label>
                    <input required type="tel" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full border border-border rounded-xl px-4 py-2 text-sm focus:border-[#2C3E6B] focus:ring-1 focus:ring-[#2C3E6B] outline-none" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-card-foreground">Maksimal Kasus Aktif</label>
                      <input type="number" min="1" value={formData.maxCases} onChange={e => setFormData({...formData, maxCases: parseInt(e.target.value)})} className="w-full border border-border rounded-xl px-4 py-2 text-sm focus:border-[#2C3E6B] outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-card-foreground">Kampus Afiliasi</label>
                      <select required value={formData.campusId} onChange={e => setFormData({...formData, campusId: e.target.value})} className="w-full border border-border rounded-xl px-4 py-2 text-sm focus:border-[#2C3E6B] outline-none">
                        <option value="">Pilih Kampus...</option>
                        {CAMPUSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>
                </form>
              </div>
              <div className="p-6 border-t border-border flex justify-end gap-3 bg-muted rounded-b-2xl">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-gray-200 rounded-xl transition-colors">Batal</button>
                <button form="invite-form" type="submit" disabled={submitting} className="px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-[#1a2540] rounded-xl flex items-center gap-2 transition-colors disabled:opacity-70">
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
