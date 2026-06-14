"use client";

import { AlertOctagon } from "lucide-react";
import { usePathname } from "next/navigation";

export default function PanicButton() {
  const pathname = usePathname();

  // Hide panic button in dashboards
  if (pathname.match(/\/(admin|consultant|operator|satgas)/)) {
    return null;
  }

  const handlePanic = () => {
    // Escape routing pattern
    // Open an innocuous website instantly
    window.location.replace("https://www.google.com");
  };

  return (
    <div className="fixed bottom-6 right-6 z-[999]">
      <button
        onClick={handlePanic}
        title="Tutup Cepat (Panic Button)"
        className="group relative flex items-center justify-center w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-2xl transition-transform hover:scale-110 active:scale-95"
      >
        <AlertOctagon size={28} className="animate-pulse" />
        <span className="absolute -top-10 right-0 w-max px-3 py-1.5 bg-black/80 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
          Tutup Cepat!
        </span>
      </button>
    </div>
  );
}
