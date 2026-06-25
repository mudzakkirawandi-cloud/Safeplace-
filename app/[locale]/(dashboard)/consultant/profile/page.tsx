"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Mail, Phone, BookOpen, Award } from "lucide-react";

export default function ProfilePage() {
  const [name, setName] = useState("Dr. Ratna, M.Psi");
  const [email, setEmail] = useState("ratna@safeplace.id");
  const [phone, setPhone] = useState("+62 812-3456-7890");
  const [bio, setBio] = useState("Psikolog klinis dengan pengalaman 8 tahun di bidang trauma dan kekerasan berbasis gender.");
  const [specialization, setSpecialization] = useState("Trauma, Kekerasan Berbasis Gender, Konseling Krisis");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-primary">Profil Saya</h1>
        <p className="text-muted-foreground text-sm mt-1">Kelola informasi dan preferensi akun konsultanmu</p>
      </motion.div>

      {/* Avatar section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl border border-border p-6 flex items-center gap-5"
      >
        <div className="w-16 h-16 rounded-full bg-[#EAF3EE] border-2 border-[#5B8A6F] flex items-center justify-center text-2xl font-bold text-primary flex-shrink-0">
          DR
        </div>
        <div>
          <p className="font-bold text-primary text-lg">{name}</p>
          <p className="text-sm text-muted-foreground">Konsultan Psikolog</p>
          <span className="inline-flex items-center gap-1.5 mt-1 text-xs bg-[#EAF3EE] text-primary px-2.5 py-0.5 rounded-full font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Terverifikasi
          </span>
        </div>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-card rounded-2xl border border-border p-6 space-y-5"
      >
        <h2 className="font-semibold text-primary text-sm">Informasi Pribadi</h2>

        {/* Nama */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Nama Lengkap</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#5B8A6F] focus:ring-2 focus:ring-[#5B8A6F]/20 transition"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            <Mail size={11} className="inline mr-1" />Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#5B8A6F] focus:ring-2 focus:ring-[#5B8A6F]/20 transition"
          />
        </div>

        {/* Telepon */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            <Phone size={11} className="inline mr-1" />Nomor Telepon
          </label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#5B8A6F] focus:ring-2 focus:ring-[#5B8A6F]/20 transition"
          />
        </div>

        {/* Spesialisasi */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            <Award size={11} className="inline mr-1" />Spesialisasi
          </label>
          <input
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#5B8A6F] focus:ring-2 focus:ring-[#5B8A6F]/20 transition"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            <BookOpen size={11} className="inline mr-1" />Bio Singkat
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full border border-border rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:border-[#5B8A6F] focus:ring-2 focus:ring-[#5B8A6F]/20 transition"
          />
        </div>

        {/* Tombol simpan */}
        <div className="flex items-center justify-between pt-2">
          {saved && (
            <span className="text-sm text-primary font-medium">✓ Perubahan disimpan!</span>
          )}
          {!saved && <span />}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-[#3d6b52] disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition active:scale-95"
          >
            <Save size={14} />
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </motion.div>

      {/* Statistik */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-2xl border border-border p-6"
      >
        <h2 className="font-semibold text-primary text-sm mb-4">Statistik Pendampingan</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-primary">47</p>
            <p className="text-xs text-muted-foreground mt-1">Total Kasus</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">43</p>
            <p className="text-xs text-muted-foreground mt-1">Selesai</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-500">4</p>
            <p className="text-xs text-muted-foreground mt-1">Aktif</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
