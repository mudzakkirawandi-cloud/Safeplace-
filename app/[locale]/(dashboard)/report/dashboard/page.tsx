"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { createClient } from "../../../../../lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { 
  Bell, 
  LogOut, 
  PlusCircle, 
  MessageCircle, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  MoreVertical
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import SafePlaceLogo from "@/components/ui/SafePlaceLogo";
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

export default function ReportDashboardPage() {
  const t = useTranslations("report.dashboard");
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

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
              setReports((prev) => prev.map(r => r.id === newMsg.report_id ? { ...r, unreadCount: (r.unreadCount || 0) + 1 } : r));
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
  }, [router, supabase]);

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      await supabase.from('users').update({ is_online: false }).eq('id', data.user.id);
    }
    await supabase.auth.signOut();
    router.push("/");
  };

  const markAsRead = async (notifId: string) => {
    // Optimistic UI update
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, is_read: true } : n));
    
    // Update in database
    await supabase.from("notifications").update({ is_read: true }).eq("id", notifId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "diterima": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "diproses": return "bg-blue-100 text-blue-700 border-blue-200";
      case "selesai": return "bg-green-100 text-green-700 border-green-200";
      case "ditutup": return "bg-gray-100 text-card-foreground border-border";
      default: return "bg-gray-100 text-card-foreground border-border";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "diterima": return t("status_received");
      case "diproses": return t("status_in_review");
      case "selesai": return t("status_done");
      case "ditutup": return t("status_closed");
      default: return status;
    }
  };

  const activeReports = reports.filter(r => r.status !== "selesai" && r.status !== "ditutup");
  const unreadNotifs = notifications.filter(n => !n.is_read).length;

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-30">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between max-w-6xl">
          <SafePlaceLogo iconSize={24} textSize="text-lg" textColor="text-primary" />
          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-full transition-colors relative"
              >
                <Bell size={20} />
                {unreadNotifs > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-80 bg-card rounded-xl shadow-lg border border-border overflow-hidden"
                  >
                    <div className="p-4 border-b border-border font-semibold text-card-foreground">
                      {t("notifications_title")}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground text-sm">
                          {t("notifications_empty")}
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div 
                            key={notif.id} 
                            onClick={() => !notif.is_read && markAsRead(notif.id)}
                            className={`p-4 border-b border-border text-sm transition-colors ${notif.is_read ? 'bg-card' : 'bg-blue-50/50 hover:bg-blue-50 cursor-pointer'}`}
                          >
                            <p className="font-semibold text-card-foreground mb-1">{notif.title}</p>
                            <p className="text-muted-foreground mb-2">{notif.message}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(notif.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <button 
              onClick={handleLogoutClick}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-primary mb-2">
            {t("title", { name: user?.full_name?.split(' ')[0] || 'User' })}
          </h2>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">{t("stat_total")}</p>
              <p className="text-2xl font-bold text-card-foreground">{reports.length}</p>
            </div>
          </div>
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">{t("stat_active")}</p>
              <p className="text-2xl font-bold text-card-foreground">{activeReports.length}</p>
            </div>
          </div>
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">{t("stat_done")}</p>
              <p className="text-2xl font-bold text-card-foreground">{reports.length - activeReports.length}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex mb-10">
          <Link href="/report/start" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-white py-4 px-8 rounded-xl hover:bg-[#123650] transition-colors shadow-md hover:shadow-lg font-medium">
            <PlusCircle size={20} />
            {t("btn_new_report")}
          </Link>
        </div>

        {/* Reports Sections */}
        <div className="space-y-10">
          {activeReports.length > 0 && (
            <section>
              <h3 className="text-xl font-bold text-card-foreground mb-4">{t("active_reports_title")}</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {activeReports.map(report => (
                  <div key={report.id} className="bg-card p-6 rounded-2xl border-2 border-[#EBF5FB] shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">ID: {report.tracking_code}</p>
                        <h4 className="font-semibold text-card-foreground">{report.incident_type}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
                          {getStatusText(report.status)}
                        </span>
                        <div className="relative">
                          <button 
                            onClick={() => setActiveDropdown(activeDropdown === report.id ? null : report.id)}
                            className="p-1 text-muted-foreground hover:text-primary hover:bg-muted rounded-full transition-colors"
                          >
                            <MoreVertical size={20} />
                          </button>
                          {activeDropdown === report.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-card rounded-xl shadow-lg border border-border overflow-hidden z-20">
                              <Link href={`/report/dashboard/${report.id}`} className="block px-4 py-3 text-sm text-card-foreground hover:bg-muted transition-colors">
                                Lihat Detail
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-6">
                      Dilaporkan pada: {new Date(report.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex flex-col gap-2">
                      <Link href={`/report/chat/${report.id}`} className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#1B4F72] text-white rounded-lg text-sm font-semibold hover:bg-[#123650] transition-colors relative">
                        <MessageCircle size={16} />
                        {t("continue_chat")}
                        {report.unreadCount ? (
                          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                            {report.unreadCount}
                          </span>
                        ) : null}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <h3 className="text-xl font-bold text-card-foreground mb-4">{t("history_title")}</h3>
            {reports.length === 0 ? (
              <div className="bg-card p-12 rounded-3xl border border-border text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                  <AlertCircle size={32} />
                </div>
                <p className="text-muted-foreground">{t("empty_state")}</p>
              </div>
            ) : (
              <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-muted-foreground">
                    <thead className="bg-muted text-card-foreground uppercase text-xs">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Tracking Code</th>
                        <th className="px-6 py-4 font-semibold">Jenis</th>
                        <th className="px-6 py-4 font-semibold">Tanggal</th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                        <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {reports.map((report) => (
                        <tr key={report.id} className="hover:bg-muted transition-colors">
                          <td className="px-6 py-4 font-medium text-card-foreground">{report.tracking_code}</td>
                          <td className="px-6 py-4 capitalize">{report.incident_type}</td>
                          <td className="px-6 py-4">{new Date(report.created_at).toLocaleDateString()}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
                              {getStatusText(report.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="relative inline-block text-left">
                              <button 
                                onClick={() => setActiveDropdown(activeDropdown === `table-${report.id}` ? null : `table-${report.id}`)}
                                className="p-1 text-muted-foreground hover:text-primary hover:bg-muted rounded-full transition-colors"
                              >
                                <MoreVertical size={20} />
                              </button>
                              {activeDropdown === `table-${report.id}` && (
                                <div className="absolute right-0 mt-2 w-48 bg-card rounded-xl shadow-lg border border-border overflow-hidden z-20 text-left">
                                  <Link href={`/report/dashboard/${report.id}`} className="block px-4 py-3 text-sm text-card-foreground hover:bg-muted transition-colors">
                                    Lihat Detail
                                  </Link>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={confirmLogout}
        isLoggingOut={isLoggingOut}
      />
    </div>
  );
}
