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
  Search, 
  MessageCircle, 
  Clock, 
  CheckCircle, 
  AlertCircle 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Report {
  id: string;
  tracking_code: string;
  incident_type: string;
  status: string;
  created_at: string;
  updated_at: string;
  consultant_id?: string;
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

  const [user, setUser] = useState<UserProfile | null>(null); // State for current user
  const [reports, setReports] = useState<Report[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndData = async () => {
      const { data: { user: currentUser }, error } = await supabase.auth.getUser();
      if (error || !currentUser) {
        router.push("/id/login");
        return;
      }

      // Check role
      const { data: profile } = await supabase
        .from("users")
        .select("full_name, role")
        .eq("id", currentUser.id)
        .single();

      if (profile?.role !== "reporter") {
        router.push("/id");
        return;
      }

      setUser({ ...currentUser, ...profile });

      // Fetch reports
      const { data: reportsData } = await supabase
        .from("reports")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (reportsData) setReports(reportsData);

      // Fetch notifications
      const { data: notifData } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (notifData) setNotifications(notifData);
      setLoading(false);

      // Subscriptions
      const reportSub = supabase
        .channel("public:reports")
        .on("postgres_changes", { event: "*", schema: "public", table: "reports", filter: `user_id=eq.${currentUser.id}` }, (payload) => {
          setReports((prev) => {
            if (payload.eventType === "INSERT") return [payload.new as Report, ...prev];
            if (payload.eventType === "UPDATE") return prev.map(r => r.id === payload.new.id ? (payload.new as Report) : r);
            if (payload.eventType === "DELETE") return prev.filter(r => r.id !== payload.old.id);
            return prev;
          });
        })
        .subscribe();

      const notifSub = supabase
        .channel("public:notifications")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${currentUser.id}` }, (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev].slice(0, 5));
        })
        .subscribe();

      return () => {
        supabase.removeChannel(reportSub);
        supabase.removeChannel(notifSub);
      };
    };

    fetchUserAndData();
  }, [router, supabase]);

  const handleLogout = async () => {
    // We will replace this with LogoutConfirmModal later in Phase 13 Task 3
    await supabase.auth.signOut();
    router.push("/id");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "diterima": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "diproses": return "bg-blue-100 text-blue-700 border-blue-200";
      case "selesai": return "bg-green-100 text-green-700 border-green-200";
      case "ditutup": return "bg-gray-100 text-gray-700 border-gray-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
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

  return (
    <div className="min-h-screen bg-[#FAFBFF]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between max-w-6xl">
          <h1 className="text-xl font-bold text-[#1B4F72]">SafePlace</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-500 hover:text-[#1B4F72] hover:bg-gray-50 rounded-full transition-colors relative"
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
                    className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-100 font-semibold text-gray-800">
                      {t("notifications_title")}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          {t("notifications_empty")}
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div key={notif.id} className={`p-4 border-b border-gray-50 text-sm ${notif.is_read ? 'bg-white' : 'bg-blue-50/50'}`}>
                            <p className="font-semibold text-gray-800 mb-1">{notif.title}</p>
                            <p className="text-gray-600 mb-2">{notif.message}</p>
                            <p className="text-xs text-gray-400">
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
              onClick={handleLogout}
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
          <h2 className="text-3xl font-bold text-[#1B4F72] mb-2">
            {t("title", { name: user?.full_name?.split(' ')[0] || 'User' })}
          </h2>
          <p className="text-gray-600">{t("subtitle")}</p>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">{t("stat_total")}</p>
              <p className="text-2xl font-bold text-gray-800">{reports.length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">{t("stat_active")}</p>
              <p className="text-2xl font-bold text-gray-800">{activeReports.length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">{t("stat_done")}</p>
              <p className="text-2xl font-bold text-gray-800">{reports.length - activeReports.length}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <Link href="/report/start" className="flex items-center justify-center gap-2 bg-[#1B4F72] text-white py-4 px-6 rounded-xl hover:bg-[#123650] transition-colors shadow-md hover:shadow-lg font-medium">
            <PlusCircle size={20} />
            {t("btn_new_report")}
          </Link>
          <Link href="/report/track" className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-[#1B4F72] py-4 px-6 rounded-xl hover:bg-gray-50 transition-colors font-medium">
            <Search size={20} />
            {t("btn_track_anon")}
          </Link>
        </div>

        {/* Reports Sections */}
        <div className="space-y-10">
          {activeReports.length > 0 && (
            <section>
              <h3 className="text-xl font-bold text-gray-800 mb-4">{t("active_reports_title")}</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {activeReports.map(report => (
                  <div key={report.id} className="bg-white p-6 rounded-2xl border-2 border-[#EBF5FB] shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#4A90B8]"></div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">ID: {report.tracking_code}</p>
                        <h4 className="font-semibold text-gray-800">{report.incident_type}</h4>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
                        {getStatusText(report.status)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-6">
                      Dilaporkan pada: {new Date(report.created_at).toLocaleDateString()}
                    </p>
                    {report.consultant_id && (
                      <Link href={`/report/chat/${report.id}`} className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#EBF5FB] text-[#1B4F72] rounded-lg text-sm font-semibold hover:bg-[#D6EAF8] transition-colors">
                        <MessageCircle size={16} />
                        {t("continue_chat")}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-4">{t("history_title")}</h3>
            {reports.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                  <AlertCircle size={32} />
                </div>
                <p className="text-gray-500">{t("empty_state")}</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Tracking Code</th>
                        <th className="px-6 py-4 font-semibold">Jenis</th>
                        <th className="px-6 py-4 font-semibold">Tanggal</th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {reports.map((report) => (
                        <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-800">{report.tracking_code}</td>
                          <td className="px-6 py-4 capitalize">{report.incident_type}</td>
                          <td className="px-6 py-4">{new Date(report.created_at).toLocaleDateString()}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
                              {getStatusText(report.status)}
                            </span>
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
    </div>
  );
}
