"use client";

import { SearchX } from "lucide-react";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-6 text-center">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-muted-foreground">
        <SearchX size={40} />
      </div>
      <h1 className="text-3xl font-bold text-card-foreground mb-3">Halaman Tidak Ditemukan</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        Maaf, halaman yang Anda cari mungkin telah dipindahkan atau dihapus. Silakan kembali ke Beranda untuk melanjutkan.
      </p>
      <Link 
        href="/"
        className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-[#153e5b] transition-colors shadow-lg shadow-[#1B4F72]/20"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
