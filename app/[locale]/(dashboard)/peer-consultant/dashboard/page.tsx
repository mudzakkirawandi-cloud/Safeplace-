"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  FolderOpen,
  MessageCircle,
  Clock,
  CheckCircle2,
  ChevronRight,
  MessageSquare,
  X
} from "lucide-react";

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

interface AssignmentNotification {
  id: string;
  report_id: string;
  status: string;
}

interface AssignmentDetails {
  incident_type: string;
  emergency: boolean;
}

export default function PeerConsultantDashboardPage() {
  const t = useTranslations("consultant");
  const router = useRouter();
  const supabase = createClient();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ id: string, name: string, active_cases_count?: number } | null>(null);
  const [statusText, setStatusText] = useState<"Tersedia" | "Sibuk" | "Istirahat">("Tersedia");

  const [newAssignment, setNewAssignment] = useState<AssignmentNotification | null>(null);
  const [showAssignmentPopup, setShowAssignmentPopup] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignmentDetails, setAssignmentDetails] = useState<AssignmentDetails | null>(null);

  const [newChatNotif, setNewChatNotif] = useState<{
    reportId: string;
    content: string;
    trackingCode: string;
  } | null>(null);
  const [showChatNotifPopup, setShowChatNotifPopup] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let reportSub: ReturnType<typeof supabase.channel> | null = null;

    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        const { data: profile } = await supabase
          .from("users")
          .select("full_name, is_online, active_cases_count")
          .eq("id", user.id)
          .maybeSingle();

        if (isMounted) {
          setCurrentUser({ id: user.id, name: profile?.full_name || "Peer Consultant", active_cases_count: profile?.active_cases_count || 0 });
          if (profile?.is_online !== undefined) {
            setStatusText(profile.is_online ? "Tersedia" : "Istirahat");
          }
        }

        // Fetch reports assigned to this consultant
        const { data: reportData, error: reportError } = await supabase
          .from("reports")
          .select("id, tracking_code, incident_type, status, created_at, reporter_id, emergency")
          .eq("assigned_consultant_id", user.id)
          .order("created_at", { ascending: false });

        if (reportError) throw reportError;

        if (reportData && isMounted) {
          // Fetch unread count for each report
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

        // Subscriptions
        const timestamp = Date.now();
        reportSub = supabase
          .channel(`peer-dashboard-${user.id}-${timestamp}`)
          .on("postgres_changes", { event: "*", schema: "public", table: "reports", filter: `assigned_consultant_id=eq.${user.id}` }, (payload: Record<string, unknown>) => {
            if (!isMounted) return;
            
            if (payload.eventType === "INSERT") {
              const newRep = { ...(payload.new as Report), unreadCount: 0 };
              setReports((prev) => [newRep, ...prev]);
            } else if (payload.eventType === "UPDATE") {
              const updated = payload.new as Report;
              setReports((prev) => prev.map(r => r.id === updated.id ? { ...r, ...updated } : r));
            } else if (payload.eventType === "DELETE") {
              const deleted = payload.old as { id: string };
              setReports((prev) => prev.filter(r => r.id !== deleted.id));
            }
          })
          .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload: Record<string, unknown>) => {
            if (!isMounted) return;
            const newMsg = payload.new as { sender_id: string; report_id: string; content: string };
            if (newMsg.sender_id !== user.id) {
              setReports((prev) => prev.map(r => r.id === newMsg.report_id ? { ...r, unreadCount: (r.unreadCount || 0) + 1 } : r));

              // Tambahan baru - tampilkan popup LANGSUNG tanpa delay
              const report = reports.find(r => r.id === newMsg.report_id);
              setNewChatNotif({
                reportId: newMsg.report_id,
                content: newMsg.content || 'Pesan baru',
                trackingCode: report?.tracking_code || ''
              });
              setShowChatNotifPopup(true);

              // Auto hide setelah 5 detik
              setTimeout(() => setShowChatNotifPopup(false), 5000);
            }
          })
          .subscribe();

      } catch (err) {
        console.error("Error fetching consultant dashboard data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      if (reportSub) supabase.removeChannel(reportSub);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, supabase]);

  useEffect(() => {
    if (!currentUser?.id) return;
    
    console.log('Setting up assignment listener for:', currentUser.id);
    
    const channel = supabase
      .channel(`assignments-${currentUser.id}-${Date.now()}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'assignment_notifications',
        filter: `peer_consultant_id=eq.${currentUser.id}`
      }, async (payload) => {
        console.log('🔔 New assignment received:', payload.new);
        const notif = payload.new as AssignmentNotification;
        if (notif.status === 'pending') {
          setNewAssignment(notif);
          setShowAssignmentPopup(true);
          
          // Fetch report details for modal
          const { data: repData } = await supabase
            .from('reports')
            .select('incident_type, emergency')
            .eq('id', notif.report_id)
            .maybeSingle();
          if (repData) setAssignmentDetails(repData);

          // Auto dismiss after 30 seconds
          setTimeout(() => {
            setShowAssignmentPopup(false);
            setShowAssignmentModal(false);
          }, 30000);
        }
      })
      .subscribe((status) => {
        console.log('Assignment subscription status:', status);
        if (status === 'CHANNEL_ERROR') {
          console.error('Channel error - reconnecting...');
        }
      });

    return () => {
      console.log('Cleaning up assignment channel');
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id, supabase]);

  // Polling fallback
  useEffect(() => {
    if (!currentUser?.id) return;
    
    const pollAssignments = async () => {
      const { data } = await supabase
        .from('assignment_notifications')
        .select('*')
        .eq('peer_consultant_id', currentUser.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (data && data.length > 0) {
        const latest = data[0];
        // Cek apakah ini notifikasi baru (dalam 30 detik terakhir)
        const isRecent = new Date().getTime() - 
          new Date(latest.created_at).getTime() < 30000;
        
        if (isRecent && !showAssignmentPopup) {
          console.log('📊 Polling found new assignment:', latest);
          setNewAssignment(latest);
          setShowAssignmentPopup(true);
          
          // Fetch report details for modal
          const { data: repData } = await supabase
            .from('reports')
            .select('incident_type, emergency')
            .eq('id', latest.report_id)
            .maybeSingle();
          if (repData) setAssignmentDetails(repData);

          // Auto dismiss after 30 seconds
          setTimeout(() => {
            setShowAssignmentPopup(false);
            setShowAssignmentModal(false);
          }, 30000);
        }
      }
    };
    
    // Poll setiap 10 detik sebagai fallback
    const pollInterval = setInterval(pollAssignments, 10000);
    pollAssignments(); // Jalankan sekali langsung
    
    return () => clearInterval(pollInterval);
  }, [currentUser?.id, showAssignmentPopup, supabase]);

  const toggleStatus = async (newStatus: "Tersedia" | "Sibuk" | "Istirahat") => {
    setStatusText(newStatus);
    if (currentUser) {
      const isOnline = newStatus === "Tersedia";
      await supabase.from("users").update({ is_online: isOnline }).eq("id", currentUser.id);
    }
  };

  const handleAcceptAssignment = async () => {
    if (!newAssignment || !currentUser) return;
    try {
      await supabase.from('assignment_notifications')
        .update({ status: 'accepted', responded_at: new Date().toISOString() })
        .eq('id', newAssignment.id);

      await supabase.from('reports')
        .update({ 
          assigned_consultant_id: currentUser.id,
          assignment_status: 'assigned'
        })
        .eq('id', newAssignment.report_id);

      await supabase.from('assignment_notifications')
        .update({ status: 'expired' })
        .eq('report_id', newAssignment.report_id)
        .neq('id', newAssignment.id)
        .eq('status', 'pending');

      await supabase.from('users')
        .update({ active_cases_count: (currentUser.active_cases_count || 0) + 1 })
        .eq('id', currentUser.id);

      setShowAssignmentPopup(false);
      setShowAssignmentModal(false);
      router.push(`/peer-consultant/chat/${newAssignment.report_id}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSkipAssignment = async () => {
    if (!newAssignment) return;
    try {
      await supabase.from('assignment_notifications')
        .update({ status: 'skipped', responded_at: new Date().toISOString() })
        .eq('id', newAssignment.id);
        
      // Cek peer consultant lain yang pending
      const { data: pendingOthers } = await supabase.from('assignment_notifications')
        .select('id')
        .eq('report_id', newAssignment.report_id)
        .eq('status', 'pending');

      if (!pendingOthers || pendingOthers.length === 0) {
        // Panggil ulang API assignment
        fetch('/api/assign-consultant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ report_id: newAssignment.report_id })
        });
      }
      
      setShowAssignmentPopup(false);
      setShowAssignmentModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const getPriorityStyle = (emergency: boolean, status: string) => {
    if (emergency) return "bg-red-50 text-red-700 border-red-500 border shadow-sm";
    if (status === "under_review" || status === "in_consultation") return "bg-yellow-50 text-yellow-700 border-yellow-400 border";
    if (status === "resolved") return "bg-green-50 text-green-700 border-green-400 border";
    return "bg-gray-50 text-gray-700 border-gray-300 border";
  };

  const getPriorityLabel = (emergency: boolean, status: string) => {
    if (emergency) return "Darurat";
    if (status === "under_review" || status === "in_consultation") return "Aktif";
    if (status === "resolved") return "Selesai";
    return "Menunggu";
  };

  const sortedReports = [...reports].sort((a, b) => {
    if (a.emergency && !b.emergency) return -1;
    if (!a.emergency && b.emergency) return 1;
    return 0;
  });

  const STATS = [
    { key: "active", labelKey: "stat_active", value: reports.filter(r => r.status === "in_consultation" || r.status === "under_review").length, icon: FolderOpen, color: "text-primary", bg: "bg-[#EAF3EE]" },
    { key: "messages", labelKey: "stat_messages", value: reports.reduce((acc, curr) => acc + (curr.unreadCount || 0), 0), icon: MessageCircle, color: "text-[#E8A87C]", bg: "bg-[#FDF3EB]" },
    { key: "waiting", labelKey: "stat_waiting", value: reports.filter(r => r.status === "received").length, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
    { key: "done", labelKey: "stat_done_week", value: reports.filter(r => r.status === "resolved").length, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
  ];

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse h-12 w-12 bg-gray-200 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-primary">
            Halo, {currentUser?.name?.split(' ')[0] || "Peer Consultant"} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Ini adalah ringkasan kasus yang Anda dampingi hari ini.</p>
        </div>
        
        {/* Status Toggle */}
        <div className="flex bg-white rounded-full border border-gray-200 p-1 shadow-sm">
          {(["Tersedia", "Sibuk", "Istirahat"] as const).map((s) => (
            <button
              key={s}
              onClick={() => toggleStatus(s)}
              className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all ${statusText === s ? "bg-[#1B4F72] text-white shadow-md" : "text-gray-500 hover:text-gray-800"}`}
            >
              {s === "Tersedia" ? "● Tersedia" : s === "Sibuk" ? "◐ Sibuk" : "○ Istirahat"}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-card rounded-2xl p-5 border border-border shadow-sm"
            >
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-3xl font-bold text-primary">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{t(stat.labelKey)}</p>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gray-50/50">
          <h2 className="font-semibold text-primary">{t("cases_title")}</h2>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="px-6 py-3">{t("table_code")}</th>
                <th className="px-6 py-3">{t("table_type")}</th>
                <th className="px-6 py-3">{t("table_priority")}</th>
                <th className="px-6 py-3">{t("table_last_update")}</th>
                <th className="px-6 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sortedReports.map((c) => (
                <tr key={c.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-semibold text-primary">
                    #{c.tracking_code}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground capitalize">{c.incident_type.replace('_', ' ')}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-bold ${getPriorityStyle(c.emergency, c.status)}`}>
                      {c.emergency && <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />}
                      {getPriorityLabel(c.emergency, c.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-xs">
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => router.push(`/peer-consultant/chat/${c.id}`)}
                        className="flex items-center gap-1.5 bg-[#F0F7FC] text-[#1B4F72] hover:bg-[#E1F0FA] px-3 py-1.5 rounded-lg font-bold text-xs transition-colors relative"
                      >
                        <MessageSquare size={14} />
                        Chat
                        {c.unreadCount ? (
                          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                            {c.unreadCount}
                          </span>
                        ) : null}
                      </button>
                      <button
                        onClick={() => router.push(`/report/dashboard/${c.id}`)}
                        className="flex items-center gap-1 text-gray-500 hover:text-gray-800 font-medium text-xs transition-colors"
                      >
                        Detail <ChevronRight size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {sortedReports.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Belum ada laporan yang ditugaskan kepada Anda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-gray-50">
          {sortedReports.map((c) => (
            <div key={c.id} className="p-4 bg-white hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-mono font-bold text-[#1B4F72] text-sm mr-2">#{c.tracking_code}</span>
                  <span className={`inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full font-bold ${getPriorityStyle(c.emergency, c.status)}`}>
                    {getPriorityLabel(c.emergency, c.status)}
                  </span>
                </div>
                <button
                  onClick={() => router.push(`/peer-consultant/chat/${c.id}`)}
                  className="flex items-center justify-center bg-[#1B4F72] text-white w-8 h-8 rounded-full relative"
                >
                  <MessageSquare size={14} />
                  {c.unreadCount ? (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                      {c.unreadCount}
                    </span>
                  ) : null}
                </button>
              </div>
              <p className="text-sm font-medium text-gray-800 capitalize mb-1">{c.incident_type.replace('_', ' ')}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">{new Date(c.created_at).toLocaleDateString()}</span>
                <button onClick={() => router.push(`/report/dashboard/${c.id}`)} className="text-xs font-semibold text-[#1B4F72]">Detail →</button>
              </div>
            </div>
          ))}
          {sortedReports.length === 0 && (
            <div className="px-6 py-12 text-center text-gray-500 text-sm">
              Belum ada laporan.
            </div>
          )}
        </div>
      </motion.div>

      {/* Assignment Popup */}
      {showAssignmentPopup && !showAssignmentModal && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }} 
          animate={{ opacity: 1, y: 0 }} 
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 z-50 bg-white rounded-2xl shadow-xl border-l-4 border-l-teal-500 p-5 max-w-sm w-full"
        >
          <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
            <span className="text-xl">🔔</span> Pelapor Baru Membutuhkan Bantuan
          </h3>
          <p className="text-sm text-gray-600 mb-4">Ada seseorang yang membutuhkan pendampingan sekarang.</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowAssignmentModal(true)} className="flex-1 py-2 text-sm font-semibold text-[#1B4F72] bg-[#F0F7FC] rounded-xl hover:bg-[#E1F0FA]">Lihat Detail</button>
            <button onClick={handleAcceptAssignment} className="flex-1 py-2 text-sm font-bold text-white bg-teal-600 rounded-xl hover:bg-teal-700">Terima</button>
            <button onClick={handleSkipAssignment} className="flex-1 py-2 text-sm font-semibold text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200">Lewati</button>
          </div>
        </motion.div>
      )}

      {/* Assignment Modal Detail */}
      {showAssignmentModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Detail Laporan Masuk</h3>
            <div className="bg-gray-50 p-4 rounded-xl space-y-3 mb-6">
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Jenis Kekerasan</p>
                <p className="text-gray-900 font-medium capitalize">{assignmentDetails?.incident_type?.replace('_', ' ') || 'Tidak disebutkan'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Status Darurat</p>
                <p className={`font-medium ${assignmentDetails?.emergency ? 'text-red-600' : 'text-green-600'}`}>
                  {assignmentDetails?.emergency ? 'Ya, Darurat' : 'Tidak Darurat'}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleSkipAssignment} className="flex-1 py-3 text-sm font-semibold text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200">Lewati Kasus</button>
              <button onClick={handleAcceptAssignment} className="flex-1 py-3 text-sm font-bold text-white bg-teal-600 rounded-xl hover:bg-teal-700">Terima Kasus</button>
            </div>
          </motion.div>
        </div>
      )}

      {showChatNotifPopup && newChatNotif && (
        <div className="fixed bottom-6 right-6 bg-white rounded-2xl 
          shadow-xl p-4 z-50 max-w-sm border border-teal-100 
          animate-in slide-in-from-bottom-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-teal-500 rounded-full flex 
              items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 text-sm">
                💬 Pesan Baru
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Laporan #{newChatNotif.trackingCode}
              </p>
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                {newChatNotif.content}
              </p>
            </div>
            <button onClick={() => setShowChatNotifPopup(false)}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => {
                router.push(`/peer-consultant/chat/${newChatNotif.reportId}`)
                setShowChatNotifPopup(false)
              }}
              className="flex-1 bg-teal-600 text-white text-xs py-2 
                rounded-xl hover:bg-teal-700 transition font-medium">
              Buka Chat
            </button>
            <button
              onClick={() => setShowChatNotifPopup(false)}
              className="flex-1 border border-gray-200 text-gray-600 
                text-xs py-2 rounded-xl hover:bg-gray-50 transition">
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
