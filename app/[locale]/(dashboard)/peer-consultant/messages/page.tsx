"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MessageSquare, ChevronRight, Clock, CheckCircle2 } from "lucide-react";

interface Report {
  id: string;
  tracking_code: string;
  incident_type: string;
  status: string;
  created_at: string;
  reporter_id: string;
  emergency: boolean;
  unreadCount?: number;
}

export default function PeerConsultantMessagesPage() {
  const router = useRouter();
  const supabase = createClient();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let messageSub: ReturnType<typeof supabase.channel> | null = null;

    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        const { data: reportData, error: reportError } = await supabase
          .from("reports")
          .select("id, tracking_code, incident_type, status, created_at, reporter_id, emergency")
          .eq("assigned_consultant_id", user.id)
          .order("created_at", { ascending: false });

        if (reportError) throw reportError;

        if (reportData && isMounted) {
          const enhancedReports = await Promise.all(
            reportData.map(async (rep: Report) => {
              const { count } = await supabase
                .from("messages")
                .select("*", { count: "exact", head: true })
                .eq("report_id", rep.id)
                .eq("is_read", false)
                .neq("sender_id", user.id);
              return { ...rep, unreadCount: count || 0 };
            })
          );
          setReports(enhancedReports);
        }

        const timestamp = Date.now();
        messageSub = supabase
          .channel(`peer-messages-${user.id}-${timestamp}`)
          .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload: Record<string, unknown>) => {
            if (!isMounted) return;
            const newMsg = payload.new as { sender_id: string; report_id: string };
            if (newMsg.sender_id !== user.id) {
              setReports((prev) => prev.map(r => r.id === newMsg.report_id ? { ...r, unreadCount: (r.unreadCount || 0) + 1 } : r));
            }
          })
          .subscribe();

      } catch (err) {
        console.error("Error fetching messages data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      if (messageSub) supabase.removeChannel(messageSub);
    };
  }, [router, supabase]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "received": return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "in_review": return "bg-blue-50 text-blue-700 border-blue-200";
      case "in_consultation": return "bg-teal-50 text-teal-700 border-teal-200";
      case "escalated_satgas": return "bg-orange-50 text-orange-700 border-orange-200";
      case "resolved": return "bg-green-50 text-green-700 border-green-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "received": return "Diterima";
      case "in_review": return "Ditinjau";
      case "in_consultation": return "Konsultasi";
      case "escalated_satgas": return "Satgas";
      case "resolved": return "Selesai";
      default: return "Menunggu";
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse h-12 w-12 bg-gray-200 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-primary">
          Kotak Masuk Pesan
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Kelola dan balas pesan dari pelapor yang Anda dampingi.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gray-50/50">
          <h2 className="font-semibold text-primary">Daftar Percakapan</h2>
        </div>

        <div className="divide-y divide-gray-100">
          {reports.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Belum ada pesan atau kasus yang ditugaskan kepada Anda.
            </div>
          ) : (
            reports.map((report) => (
              <div key={report.id} className="p-4 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-primary text-sm">
                        #{report.tracking_code}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getStatusStyle(report.status)}`}>
                        {getStatusLabel(report.status)}
                      </span>
                      {report.emergency && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-red-50 text-red-700 border border-red-200">
                          Darurat
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 capitalize mb-1">
                      {report.incident_type.replace('_', ' ')}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(report.created_at).toLocaleDateString()}
                      </span>
                      {report.status === "resolved" && (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="w-3 h-3" />
                          Ditutup
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => router.push(`/peer-consultant/chat/${report.id}`)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm rounded-xl transition-colors relative sm:w-auto w-full"
                >
                  Buka Chat
                  <ChevronRight className="w-4 h-4" />
                  {report.unreadCount ? (
                    <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-bounce">
                      {report.unreadCount}
                    </span>
                  ) : null}
                </button>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
