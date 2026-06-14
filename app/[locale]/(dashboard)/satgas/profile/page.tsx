"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { UserCircle, Shield, Building } from "lucide-react";

export default function SatgasProfilePage() {
  const t = useTranslations("satgas");

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-[#154360]">{t("nav_profile")}</h1>
        <p className="text-[#1A5276]/80 text-sm mt-1">Informasi dan pengaturan profil Satgas PPKS.</p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 16 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white border border-blue-100 rounded-2xl overflow-hidden shadow-sm"
      >
        <div className="bg-[#1A5276] h-32 relative">
          <div className="absolute -bottom-12 left-6 w-24 h-24 bg-white rounded-2xl border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
            <UserCircle size={64} className="text-[#2471A3]" />
          </div>
        </div>
        
        <div className="pt-16 pb-6 px-6">
          <h2 className="text-xl font-bold text-[#154360]">Satgas PPKS Universitas SafePlace</h2>
          <div className="flex items-center gap-2 text-sm text-[#D4AC0D] font-medium mt-1">
            <Shield size={16} />
            Akun Resmi Satuan Tugas
          </div>

          <div className="mt-8 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Informasi Kontak</h3>
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400 font-medium">Email Satgas</label>
                  <div className="text-sm font-medium text-[#1A5276]">satgas-ppks@safeplace.ac.id</div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400 font-medium">Hotline Darurat</label>
                  <div className="text-sm font-medium text-[#1A5276]">0812-3456-7890</div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-blue-50">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Afiliasi</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#EBF5FB] flex items-center justify-center">
                  <Building size={20} className="text-[#2471A3]" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#154360]">Universitas SafePlace</div>
                  <div className="text-xs text-gray-500">Terverifikasi oleh Admin Pusat</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-blue-50 flex gap-3">
            <button className="px-4 py-2 bg-[#1A5276] hover:bg-[#154360] text-white text-sm font-semibold rounded-xl transition-colors">
              Edit Profil
            </button>
            <button className="px-4 py-2 bg-[#EBF5FB] text-[#1A5276] hover:bg-[#D4E6F1] text-sm font-semibold rounded-xl transition-colors">
              Ganti Password
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
