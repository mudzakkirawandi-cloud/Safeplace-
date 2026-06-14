"use client";

import { motion } from "framer-motion";
import { Mail, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F6FA] p-4 py-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
      >
        <div className="bg-[#4ECDC4] p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-20 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
          <div className="relative z-10">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30">
              <Mail className="text-white" size={40} />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Cek email kamu untuk verifikasi</h1>
            <p className="text-white/90 text-sm">Tinggal satu langkah lagi untuk bergabung</p>
          </div>
        </div>

        <div className="p-8 text-center">
          <div className="mb-6 flex justify-center text-[#4ECDC4]">
            <CheckCircle size={48} />
          </div>
          
          <h2 className="text-xl font-bold text-gray-800 mb-3">Verifikasi Email Terkirim</h2>
          <p className="text-gray-600 mb-8 text-sm leading-relaxed">
            Kami telah mengirimkan tautan verifikasi ke alamat email Anda. 
            Silakan periksa kotak masuk (atau folder spam) dan klik tautan tersebut untuk mengaktifkan akun Anda.
          </p>

          <Link href="/report/start" className="inline-flex items-center justify-center w-full py-3.5 bg-[#2C3E6B] hover:bg-[#1f2b4a] text-white font-bold rounded-xl shadow-md transition-all hover:shadow-lg group">
            Lanjut ke Pelaporan
            <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              Belum menerima email? <button className="font-bold text-[#2C3E6B] hover:text-[#4ECDC4] transition-colors">Kirim ulang</button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
