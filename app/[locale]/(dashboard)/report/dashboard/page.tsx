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
    <div className="min-h-full bg-[#F8FAFB] pb-10">
      <div className="hidden md:flex items-center justify-between px-8 py-5 bg-card border-b border-border sticky top-0 z-10">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Kamu aman di sini 🌿</p>
        </div>
        <div className="flex items-center gap-3">
        </div>
      </div>

      <div className="px-4 md:px-8 py-6 max-w-4xl mx-auto space-y-6">

        <div className="bg-[#E1F5EE] border border-[#9FE1CB] rounded-2xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-[#0F6E56] rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-[#E1F5EE] text-lg">🌿</span>
            </div>
            <div className="flex-1">
              <p className="text-xs text-[#0F6E56] font-semibold uppercase tracking-wider mb-1">Untukmu hari ini</p>
              {loadingReminder ? (
                <div className="animate-pulse h-4 bg-[#9FE1CB] rounded w-3/4"/>
              ) : (
                <p className="text-sm text-[#085041] leading-relaxed italic font-serif">
                  &ldquo;{aiReminder || 'Kamu sudah sangat berani hari ini.'}&rdquo;
                </p>
              )}
            </div>
            <button onClick={() => fetchAiReminder()} className="text-[#0F6E56] hover:opacity-70 transition p-1.5 rounded-full hover:bg-[#9FE1CB]/30">
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Aksi cepat</p>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => router.push('/report/start')} className="bg-card border border-border rounded-2xl p-4 text-left hover:shadow-sm hover:border-primary/20 transition-all group">
              <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-100 transition">
                <span className="text-blue-600 text-lg">📋</span>
              </div>
              <p className="text-sm font-semibold text-foreground">Buat laporan baru</p>
              <p className="text-xs text-muted-foreground mt-0.5">Mulai konsultasi</p>
            </button>
            <button
              onClick={() => {
                const activeReport = activeReports[0];
                if (activeReport) {
                  router.push(`/report/chat/${activeReport.id}`);
                } else {
                  router.push('/report/chat');
                }
              }}
              className="bg-card border border-border rounded-2xl p-4 text-left hover:shadow-sm hover:border-primary/20 transition-all group relative"
            >
              {activeReports.some(r => (r.unreadCount || 0) > 0) && (
                <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full"/>
              )}
              <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-teal-100 transition">
                <span className="text-teal-600 text-lg">💬</span>
              </div>
              <p className="text-sm font-semibold text-foreground">Buka chat</p>
              <p className="text-xs text-muted-foreground mt-0.5">Lanjut pendampingan</p>
            </button>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Pendampingan aktif</p>
          {activeReports.length > 0 ? (
            <div className="space-y-3">
              {activeReports.map(report => (
                <div key={report.id} className="bg-card border border-border rounded-2xl p-4 hover:shadow-sm transition">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <UserIcon size={18} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">Sahabat Tangguh</p>
                      <p className="text-xs text-muted-foreground capitalize truncate">
                        {report.incident_type}{report.unreadCount ? ` · ${report.unreadCount} pesan baru` : ''}
                      </p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-700 font-medium flex-shrink-0">Aktif</span>
                  </div>
                  <div className="bg-muted rounded-xl px-3 py-2 flex items-center gap-2 mb-3">
                    <span className="text-xs text-muted-foreground">Kode:</span>
                    <span className="text-xs font-mono font-semibold text-primary">{report.tracking_code}</span>
                  </div>
                  <button onClick={() => router.push(`/report/chat/${report.id}`)} className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition">
                    Lanjut chat →
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl p-6 text-center">
              <p className="text-sm text-muted-foreground mb-3">Belum ada laporan aktif.</p>
              <button onClick={() => router.push('/report/start')} className="inline-flex items-center gap-2 bg-primary text-primary-foreground py-2 px-5 rounded-xl text-sm font-medium hover:bg-primary/90 transition">
                Mulai konsultasi
              </button>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Jurnalku</p>
            <button onClick={() => router.push('/report/jurnal')} className="text-xs text-primary hover:underline font-medium">Lihat semua →</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            <button onClick={() => router.push('/report/jurnal')} className="flex-shrink-0 w-24 h-28 bg-card border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-1.5 hover:border-primary/30 hover:bg-primary/5 transition">
              <span className="text-xl">✏️</span>
              <span className="text-xs text-muted-foreground font-medium">Tulis</span>
            </button>
            {recentJournals.map(journal => (
              <div key={journal.id} onClick={() => router.push('/report/jurnal')} className="flex-shrink-0 w-24 h-28 bg-card border border-border rounded-2xl p-3 cursor-pointer hover:shadow-sm transition flex flex-col items-center justify-center gap-2">
                <span className="text-2xl">{journal.mood || '📝'}</span>
                <p className="text-[10px] text-muted-foreground text-center line-clamp-2 leading-tight italic">
                  {journal.content?.substring(0, 28)}...
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Untukmu</p>
            <button onClick={() => router.push('/edukasi')} className="text-xs text-primary hover:underline font-medium">Lihat semua →</button>
          </div>
          <div className="space-y-2">
            {[
              { title: 'Kamu Tidak Sendiri', desc: 'Memahami bahwa pengalaman ini bukan salahmu', icon: '🤝' },
              { title: 'Langkah Kecil itu Penting', desc: 'Pemulihan tidak harus sempurna', icon: '🌱' },
              { title: 'Mengenal Traumamu', desc: 'Memahami respons tubuh dan pikiran', icon: '💙' }
            ].map((article, i) => (
              <button key={i} onClick={() => router.push('/edukasi')} className="w-full flex items-center gap-3 bg-card border border-border rounded-xl p-3.5 hover:shadow-sm transition text-left">
                <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center text-xl flex-shrink-0">{article.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{article.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{article.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
          <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-3 flex items-center gap-2">
            <AlertCircle size={14} /> Bantuan darurat
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { name: 'Polri', number: '110' },
              { name: 'KEMENPPPA', number: '119 ext 8' },
              { name: 'Komnas Perempuan', number: '021-7884-5555' },
              { name: 'SAPA 129', number: '1500-454' }
            ].map((c, i) => (
              <a key={i} href={`tel:${c.number.replace(/\D/g,'')}`} className="bg-white border border-red-100 rounded-xl p-3 text-center hover:shadow-sm transition block">
                <p className="text-[10px] font-semibold text-red-400 uppercase tracking-wider mb-0.5">{c.name}</p>
                <p className="text-sm font-bold text-red-600">{c.number}</p>
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
            className="fixed bottom-6 right-6 bg-card rounded-2xl shadow-xl p-4 z-50 max-w-sm border border-border"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm">💬 Pesan dari Sahabat Tangguh</p>
                <p className="text-xs text-muted-foreground mt-0.5">#{newMsgNotif.trackingCode}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{newMsgNotif.content}</p>
              </div>
              <button onClick={() => setShowMsgNotifPopup(false)} className="text-muted-foreground hover:text-foreground flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => { router.push(`/report/chat/${newMsgNotif.reportId}`); setShowMsgNotifPopup(false); }}
                className="flex-1 bg-primary text-primary-foreground text-xs py-2 rounded-xl hover:bg-primary/90 transition font-medium"
              >
                Buka Chat
              </button>
              <button onClick={() => setShowMsgNotifPopup(false)} className="flex-1 border border-border text-muted-foreground text-xs py-2 rounded-xl hover:bg-muted transition">
                Tutup
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
