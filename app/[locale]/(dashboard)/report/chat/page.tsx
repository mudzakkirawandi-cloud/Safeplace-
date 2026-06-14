"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ChatWindow from "../../../_components/ChatWindow";
import { createClient } from "../../../../../lib/supabase/client";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reportId = searchParams.get("id");
  
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [trackingCode, setTrackingCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const initUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setCurrentUserId(data.user.id);
      } else {
        // Fallback to tracking code for anonymous reporters
        const storedCode = localStorage.getItem("safeplace_tracking_code");
        if (storedCode) {
          setTrackingCode(storedCode);
        }
      }
      setLoading(false);
    };
    
    initUser();
  }, [supabase.auth]);

  if (!reportId) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-gray-500">ID Laporan tidak ditemukan.</p>
        <button onClick={() => router.back()} className="mt-4 text-[#4A90B8] hover:underline">
          Kembali
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Memuat...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-center justify-between"
      >
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#4A90B8] transition-colors"
        >
          <ArrowLeft size={16} />
          Kembali
        </button>
        <h1 className="text-xl font-bold text-[#1B4F72] font-mono">
          #{reportId}
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <ChatWindow 
          reportId={reportId}
          currentUserId={currentUserId}
          trackingCode={trackingCode}
          userRole="reporter"
        />
      </motion.div>
    </div>
  );
}

export default function ReporterChatPage() {
  return (
    <main className="flex-1 p-6 container mx-auto">
      <Suspense fallback={<div className="text-center mt-10">Memuat Obrolan...</div>}>
        <ChatContent />
      </Suspense>
    </main>
  );
}
