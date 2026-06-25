"use client";

import { ReactNode, useState, useEffect } from "react";
import { ReportProvider } from "../../_contexts/ReportContext";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "../../../../lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  LayoutDashboard,
  MessageCircle,
  BookOpen,
  Lightbulb,
  Menu,
  X,
  Home,
  Search
} from "lucide-react";
import SafePlaceLogo from "../../_components/SafePlaceLogo";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

function SidebarContent({
  pathname,
  userName,
  trackingCode,
  unreadCount,
  onClose,
}: {
  pathname: string;
  userName: string;
  trackingCode: string;
  unreadCount: number;
  onClose?: () => void;
}) {
  const router = useRouter();

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      href: "/report/dashboard",
      icon: <LayoutDashboard size={18} />,
    },
    {
      label: "Chat",
      href: "/report/chat",
      icon: <MessageCircle size={18} />,
      badge: unreadCount,
    },
    {
      label: "Jurnal",
      href: "/report/jurnal",
      icon: <BookOpen size={18} />,
    },
    {
      label: "Edukasi",
      href: "/edukasi",
      icon: <Lightbulb size={18} />,
    },
    {
      label: "Lacak laporan",
      href: "/report/track",
      icon: <Search size={18} />,
    },
  ];

  return (
    <div className="h-full bg-card border-r border-border flex flex-col">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <SafePlaceLogo iconSize={22} textSize="text-base" />
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted transition md:hidden"
          >
            <X size={18} className="text-muted-foreground" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.includes(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {item.badge && item.badge > 0 ? (
                <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-4 border-t border-border pt-3 space-y-1">
        {trackingCode && (
          <div className="px-3 py-2 mb-2 bg-muted rounded-xl">
            <p className="text-xs text-muted-foreground mb-0.5">Kode laporan</p>
            <p className="text-xs font-mono font-semibold text-primary">
              {trackingCode}
            </p>
          </div>
        )}
        <div className="px-3 py-2 flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
            {userName?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">
              {userName || "Pelapor"}
            </p>
            <p className="text-[10px] text-muted-foreground">Akun pelapor</p>
          </div>
        </div>
        <button
          onClick={() => router.push("/")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
        >
          <Home size={18} />
          <span>Ke beranda</span>
        </button>
      </div>
    </div>
  );
}

export default function ReportLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const supabase = createClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [trackingCode, setTrackingCode] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("users")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();
      if (profile?.full_name) setUserName(profile.full_name);

      const { data: report } = await supabase
        .from("reports")
        .select("tracking_code, id")
        .eq("reporter_id", user.id)
        .neq("status", "closed")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (report?.tracking_code) setTrackingCode(report.tracking_code);

      if (report?.id) {
        const { count } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("report_id", report.id)
          .eq("is_read", false)
          .neq("sender_id", user.id);
        setUnreadCount(count || 0);
      }
    };
    fetchUser();
  }, [supabase]);

  return (
    <ReportProvider>
      <div className="flex h-screen bg-background text-foreground overflow-hidden">
        <aside className="hidden md:flex w-60 flex-shrink-0 flex-col">
          <SidebarContent
            pathname={pathname}
            userName={userName}
            trackingCode={trackingCode}
            unreadCount={unreadCount}
          />
        </aside>

        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 bg-black/40 z-40 md:hidden"
              />
              <motion.aside
                initial={{ x: -240 }}
                animate={{ x: 0 }}
                exit={{ x: -240 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed left-0 top-0 bottom-0 w-60 z-50 md:hidden"
              >
                <SidebarContent
                  pathname={pathname}
                  userName={userName}
                  trackingCode={trackingCode}
                  unreadCount={unreadCount}
                  onClose={() => setSidebarOpen(false)}
                />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="md:hidden flex items-center justify-between px-4 py-3 bg-card border-b border-border">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-muted transition"
              >
                <Menu size={20} className="text-muted-foreground" />
              </button>
              <SafePlaceLogo iconSize={18} textSize="text-sm" />
            </div>
            {trackingCode && (
              <div className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-lg font-mono">
                {trackingCode}
              </div>
            )}
          </div>

          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </ReportProvider>
  );
}
