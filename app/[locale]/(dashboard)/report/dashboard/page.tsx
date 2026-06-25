"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../../../lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { 
  MessageCircle, 
  AlertCircle,
  X,
  RefreshCw,
  User as UserIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import LogoutConfirmModal from "../../../_components/LogoutConfirmModal";

interface Report {
  id: string;
  tracking_code: string;
  incident_type: string;
  status: string;
  created_at: string;
  description?: string;
  consultant_id?: string;
  unreadCount?: number;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface UserProfile extends User {
  full_name?: string;
  role?: string;
}

interface Journal {
  id: string;
  title: string | null;
  content: string;
  mood: string;
  image_url: string | null;
  created_at: string;
}

export default function ReportDashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [newMsgNotif, setNewMsgNotif] = useState<{
    reportId: string
    content: string
    trackingCode: string
  } | null>(null);
  const [showMsgNotifPopup, setShowMsgNotifPopup] = useState(false);

  const [aiReminder, setAiReminder] = useState<string>('')
  const [loadingReminder, setLoadingReminder] = useState(false)
  const [recentJournals, setRecentJournals] = useState<Journal[]>([])

  const fetchAiReminder = async (currentUser?: UserProfile, currentReports?: Report[]) => {
    const activeUser = currentUser || user;
    const activeReports = currentReports || reports;
    if (!activeUser || !activeReports?.length) return
    setLoadingReminder(true)
    try {
      const activeReport = activeReports.find(r => 
        r.status !== 'closed' && r.status !== 'selesai' && r.status !== 'ditutup'
      )
      const hour = new Date().getHours()
      const timeOfDay = hour < 12 ? 'pagi' : hour < 17 ? 'siang' : 'malam'
      const daysSince = activeReport ? Math.floor(
        (Date.now() - new Date(activeReport.created_at).getTime()) 
        / (1000 * 60 * 60 * 24)
      ) : 0

      const res = await fetch('/api/ai-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentType: activeReport?.incident_type || '',
          daysSinceReport: daysSince,
          lastMessage: '',
          consultantName: 'Sahabat Tangguh',
          timeOfDay
        })
      })
      const data = await res.json()
      setAiReminder(data.message)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_err) {
    } finally {
      setLoadingReminder(false)
    }
  }

  useEffect(() => {
    let isMounted = true;
    let reportSub: ReturnType<typeof supabase.channel> | null = null;
    let notifSub: ReturnType<typeof supabase.channel> | null = null;

    const fetchUserAndData = async () => {
      try {
        setFetchError(null);
        const { data: { user: currentUser }, error } = await supabase.auth.getUser();
        if (error || !currentUser) {
          console.error("Auth error:", error);
          if (isMounted) router.push("/id/login");
          return;
        }

        // Check role - use maybeSingle to prevent 406 if no profile exists
        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("full_name, role")
          .eq("id", currentUser.id)
          .maybeSingle();

        if (profileError) {
          console.error("Error fetching user profile:", profileError);
        }

        if (profile?.role && profile.role !== "reporter") {
          if (isMounted) router.push("/id");
          return;
        }

        if (isMounted) setUser({ ...currentUser, ...profile });

        // Fetch reports
        const { data: reportsData, error: reportsError } = await supabase
          .from("reports")
          .select("*")
          .eq("reporter_id", currentUser.id)
          .order("created_at", { ascending: false });

        if (reportsError) {
          console.error("Error fetching reports:", reportsError);
          if (isMounted) setFetchError("Gagal memuat data laporan.");
        } else if (reportsData && isMounted) {
          const enhancedReports = await Promise.all(
            reportsData.map(async (rep: Report) => {
              const { count } = await supabase
                .from("messages")
                .select("*", { count: "exact", head: true })
                .eq("report_id", rep.id)
                .eq("is_read", false)
                .neq("sender_id", currentUser.id);
              return { ...rep, unreadCount: count || 0 };
            })
          );
          setReports(enhancedReports);

          const { data: journalsData } = await supabase
            .from('journals')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false })
            .limit(3)
          
          if (journalsData && isMounted) {
            setRecentJournals(journalsData)
          }

          fetchAiReminder(currentUser, enhancedReports)
        }

        // Fetch notifications
        const { data: notifData, error: notifError } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", currentUser.id)
          .order("created_at", { ascending: false })
          .limit(5);

        if (notifError) {
          console.error("Error fetching notifications:", notifError);
        } else if (notifData && isMounted) {
          setNotifications(notifData);
        }

        if (!isMounted) return;

        // Subscriptions
        const timestamp = Date.now();
        reportSub = supabase
          .channel(`public:reports:${currentUser.id}-${timestamp}`)
          .on("postgres_changes", { event: "*", schema: "public", table: "reports", filter: `reporter_id=eq.${currentUser.id}` }, (payload) => {
            if (!isMounted) return;
            setReports((prev) => {
              if (payload.eventType === "INSERT") return [{ ...(payload.new as Report), unreadCount: 0 }, ...prev];
              if (payload.eventType === "UPDATE") return prev.map(r => r.id === payload.new.id ? { ...r, ...payload.new } : r);
              if (payload.eventType === "DELETE") return prev.filter(r => r.id !== payload.old.id);
              return prev;
            });
          })
          .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
            if (!isMounted) return;
            const newMsg = payload.new;
            if (newMsg.sender_id !== currentUser.id) {
              setReports((prev) => {
                const report = prev.find(r => r.id === newMsg.report_id);
                if (report) {
                  setTimeout(() => {
                    setNewMsgNotif({
                      reportId: newMsg.report_id,
                      content: newMsg.content || 'Pesan baru',
                      trackingCode: report.tracking_code || ''
                    });
                    setShowMsgNotifPopup(true);
                    setTimeout(() => setShowMsgNotifPopup(false), 5000);
                  }, 0);
                }
                return prev.map(r => r.id === newMsg.report_id ? { ...r, unreadCount: (r.unreadCount || 0) + 1 } : r);
              });
            }
          })
          .subscribe();

        notifSub = supabase
          .channel(`public:notifications:${currentUser.id}-${timestamp}`)
          .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${currentUser.id}` }, (payload) => {
            if (!isMounted) return;
            setNotifications((prev) => [payload.new as Notification, ...prev].slice(0, 5));
          })
          .subscribe();

      } catch (err) {
        console.error("Unexpected error in fetchUserAndData:", err);
        if (isMounted) setFetchError("Terjadi kesalahan sistem saat memuat data.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUserAndData();

    return () => {
      isMounted = false;
      if (reportSub) supabase.removeChannel(reportSub);
      if (notifSub) supabase.removeChannel(notifSub);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, supabase]);

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      await supabase.from('users').update({ is_online: false }).eq('id', data.user.id);
    }
    await supabase.auth.signOut();
    router.push("/");
  };

  const activeReports = reports.filter(r => r.status !== "selesai" && r.status !== "ditutup");

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <div className="bg-card p-8 rounded-3xl border border-border shadow-sm text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-card-foreground mb-2">Gagal Memuat Data</h2>
          <p className="text-muted-foreground mb-6">{fetchError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-primary hover:bg-[#1f2b4a] text-white font-bold rounded-xl shadow-md transition-all"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF6EC] font-sans pb-24">
      {/* 1. SECTION AI REMINDER (paling atas) */}
      <div className="container mx-auto px-6 max-w-2xl pt-8">
        <div className="bg-gradient-to-br from-[#4A9B8E]/10 to-[#C9847A]/10 rounded-3xl p-6 mb-6 border border-[#4A9B8E]/20 relative shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#4A9B8E] rounded-2xl flex items-center justify-center flex-shrink-0 text-xl shadow-inner">
              🌿
            </div>
            <div className="flex-1">
              <p className="text-xs text-[#4A9B8E] font-medium mb-1 tracking-wide uppercase">
                Untukmu hari ini
              </p>
              {loadingReminder ? (
                <div className="animate-pulse h-4 bg-[#C9847A]/20 rounded w-3/4 mb-2 mt-2"/>
              ) : (
                <p className="text-[#2D3748] leading-relaxed italic font-serif">
                  &ldquo;{aiReminder || 'Kamu sudah sangat berani hari ini.'}&rdquo;
                </p>
              )}
            </div>
            <button 
              onClick={() => fetchAiReminder()} 
              className="text-[#4A9B8E] hover:opacity-70 transition p-2 bg-white/50 rounded-full"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* 2. SECTION PENDAMPINGAN */}
        <div className="mb-8">
          <h2 className="font-semibold text-[#2D3748] mb-3">💬 Pendampingan Aktif</h2>
          {activeReports.length > 0 ? (
            <div className="grid gap-3">
              {activeReports.map(report => (
                <div key={report.id} className="bg-white rounded-2xl p-4 shadow-sm border border-[#4A9B8E]/10 hover:shadow-md transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#4A9B8E]/10 rounded-full flex items-center justify-center">
                      💬
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-[#2D3748] text-sm">
                        Peer Consultant
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {report.incident_type} • {report.unreadCount ? `${report.unreadCount} pesan baru` : 'Tidak ada pesan baru'}
                      </p>
                    </div>
                    {report.unreadCount ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E1F0FA] text-[#1B4F72] rounded-full text-xs font-semibold whitespace-nowrap">
                        <UserIcon size={12} className="opacity-70" />
                        Sahabat Tangguh
                      </span>
                    ) : null}
                  </div>
                  <button 
                    onClick={() => router.push(`/report/chat/${report.id}`)}
                    className="mt-3 w-full bg-[#4A9B8E] text-white py-2 rounded-xl text-sm font-medium hover:bg-[#3D8A7D] transition shadow-sm"
                  >
                    Lanjut Chat →
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 mb-3">Belum ada laporan aktif.</p>
              <Link href="/report/start" className="inline-block bg-[#4A9B8E] text-white py-2 px-6 rounded-xl text-sm font-medium hover:bg-[#3D8A7D] transition">
                Mulai Konsultasi
              </Link>
            </div>
          )}
        </div>

        {/* 3. SECTION JURNAL */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-[#2D3748]">📖 Jurnalku</h2>
            <Link href="/report/jurnal" className="text-xs text-[#4A9B8E] hover:underline font-medium">
              Lihat semua →
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {/* Tombol tulis baru */}
            <button 
              onClick={() => router.push('/report/jurnal')}
              className="flex-shrink-0 w-24 h-28 bg-[#4A9B8E]/5 border-2 border-dashed border-[#4A9B8E]/30 rounded-2xl flex flex-col items-center justify-center gap-1 hover:bg-[#4A9B8E]/10 transition"
            >
              <span className="text-2xl">✏️</span>
              <span className="text-xs text-[#4A9B8E] font-medium mt-1">Tulis</span>
            </button>
            {recentJournals.map(journal => (
              <div 
                key={journal.id} 
                onClick={() => router.push('/report/jurnal')}
                className="flex-shrink-0 w-24 h-28 bg-white border border-[#C9847A]/20 rounded-2xl p-3 cursor-pointer hover:shadow-md transition flex flex-col items-center justify-center gap-2"
              >
                <span className="text-3xl">{journal.mood || '📝'}</span>
                <p className="text-[10px] text-gray-500 text-center line-clamp-2 leading-tight font-serif italic">
                  {journal.content?.substring(0, 30)}...
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 4. SECTION EDUKASI */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-[#2D3748]">📚 Untukmu</h2>
            <Link href="/edukasi" className="text-xs text-[#4A9B8E] hover:underline font-medium">
              Lihat semua →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {[
              { title: 'Kamu Tidak Sendiri', desc: 'Memahami bahwa pengalaman ini bukan salahmu', icon: '🤝' },
              { title: 'Langkah Kecil itu Penting', desc: 'Pemulihan tidak harus sempurna', icon: '🌱' },
              { title: 'Mengenal Traumamu', desc: 'Memahami respons tubuh dan pikiran', icon: '💙' }
            ].map((article, i) => (
              <Link key={i} href="/edukasi" className="flex items-center gap-3 bg-white rounded-xl p-3 hover:shadow-sm transition border border-gray-100">
                <div className="w-10 h-10 bg-[#FDF6EC] rounded-lg flex items-center justify-center text-xl shrink-0">
                  {article.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#2D3748]">{article.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{article.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 5. SECTION DARURAT */}
        <div className="bg-[#C9847A]/10 rounded-2xl p-5 border border-[#C9847A]/20">
          <p className="text-sm font-semibold text-[#C9847A] mb-3 flex items-center gap-2">
            <span>🆘</span> Bantuan Darurat
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: 'Polri', number: '110' },
              { name: 'KEMENPPPA', number: '119 ext 8' },
              { name: 'Komnas Perempuan', number: '021-7884-5555' },
              { name: 'SAPA 129', number: '1500-454' }
            ].map((contact, i) => (
              <a key={i} href={`tel:${contact.number.replace(/\D/g,'')}`} className="bg-white rounded-xl p-3 text-center hover:shadow-sm transition border border-[#C9847A]/10 flex flex-col justify-center">
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">{contact.name}</p>
                <p className="text-sm text-[#C9847A] font-bold">{contact.number}</p>
              </a>
            ))}
          </div>
        </div>
      </div>

      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={confirmLogout}
        isLoggingOut={isLoggingOut}
      />

      <AnimatePresence>
        {showMsgNotifPopup && newMsgNotif && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 bg-white rounded-2xl shadow-xl p-4 z-50 max-w-sm border border-teal-100"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-[#4A9B8E] rounded-full flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[#1B4F72] mb-3 flex items-center gap-2 text-sm md:text-base">
                  💬 Pesan dari Sahabat Tangguh
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Laporan #{newMsgNotif.trackingCode}
                </p>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                  {newMsgNotif.content}
                </p>
              </div>
              <button onClick={() => setShowMsgNotifPopup(false)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => {
                  router.push(`/report/chat/${newMsgNotif.reportId}`);
                  setShowMsgNotifPopup(false);
                }}
                className="flex-1 bg-[#4A9B8E] text-white text-xs py-2 rounded-xl hover:bg-[#3D8A7D] transition font-medium"
              >
                Buka Chat
              </button>
              <button
                onClick={() => setShowMsgNotifPopup(false)}
                className="flex-1 border border-gray-200 text-gray-600 text-xs py-2 rounded-xl hover:bg-gray-50 transition"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
