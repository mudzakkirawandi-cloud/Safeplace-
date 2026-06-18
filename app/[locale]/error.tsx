"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-6 text-center">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6 text-red-600">
        <AlertCircle size={40} />
      </div>
      <h1 className="text-3xl font-bold text-card-foreground mb-3">Terjadi Kesalahan Teknis</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        Mohon maaf, sistem kami mengalami kendala. Tim teknis kami telah mendapatkan laporan mengenai masalah ini.
      </p>
      <div className="flex gap-4 flex-wrap justify-center">
        <button 
          onClick={() => reset()} 
          className="px-6 py-3 bg-card text-primary border border-[#1B4F72] rounded-xl font-semibold hover:bg-muted transition-colors"
        >
          Coba Lagi
        </button>
        <button 
          onClick={() => window.location.href = "/"} 
          className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-[#153e5b] transition-colors shadow-lg shadow-[#1B4F72]/20"
        >
          Kembali ke Beranda
        </button>
      </div>
    </div>
  );
}
