"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  MessageCircle,
  User,
  LogOut,
  Menu,
} from "lucide-react";
import { createClient } from "../../../../lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import NotificationBell from "../../_components/NotificationBell";
import LogoutConfirmModal from "../../_components/LogoutConfirmModal";
import SafePlaceLogo from "@/components/ui/SafePlaceLogo";

type OnlineStatus = "online" | "busy" | "offline";

const STATUS_CONFIG: Record<OnlineStatus, { label: string; color: string }> = {
  online: { label: "Online", color: "bg-green-500" },
  busy: { label: "Sibuk", color: "bg-yellow-400" },
  offline: { label: "Offline", color: "bg-gray-400" },
};

export default function ConsultantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("consultant");
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [status, setStatus] = useState<OnlineStatus>("online");
  const [statusDropdown, setStatusDropdown] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleStatusChange = async (newStatus: OnlineStatus) => {
    setStatus(newStatus);
    setStatusDropdown(false);
    // Di produksi: update ke Supabase
    // await supabase.from("users").update({ online_status: newStatus }).eq("id", userId);
  };

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    router.push("/");
  };

  const navItems = [
    {
      href: "/consultant/dashboard",
      icon: LayoutDashboard,
      labelKey: "nav_dashboard",
    },
    {
      href: "/consultant/cases",
      icon: FolderOpen,
      labelKey: "nav_cases",
    },
    {
      href: "/consultant/messages",
      icon: MessageCircle,
      labelKey: "nav_messages",
    },
    {
      href: "/consultant/profile",
      icon: User,
      labelKey: "nav_profile",
    },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card border-r border-border">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-border">
        <SafePlaceLogo variant="colored" role="consultant" width={150} height={44} />
        <span className="text-xs text-primary font-medium mt-0.5 block">
          Portal Konsultan
        </span>
      </div>

      {/* Avatar + nama + status toggle */}
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-[#EAF3EE] flex items-center justify-center font-bold text-primary text-sm flex-shrink-0">
            DR
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-primary truncate">
              Dr. Ratna, M.Psi
            </p>
            <p className="text-xs text-muted-foreground">Konsultan</p>
          </div>
        </div>

        {/* Status toggle */}
        <div className="relative">
          <button
            onClick={() => setStatusDropdown(!statusDropdown)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-gray-100 transition-colors text-sm"
          >
            <span
              className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${STATUS_CONFIG[status].color}`}
            />
            <span className="font-medium text-card-foreground">
              {STATUS_CONFIG[status].label}
            </span>
            <span className="ml-auto text-muted-foreground text-xs">▾</span>
          </button>

          <AnimatePresence>
            {statusDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10 overflow-hidden"
              >
                {(Object.keys(STATUS_CONFIG) as OnlineStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-muted transition-colors ${
                      status === s ? "bg-muted font-semibold" : ""
                    }`}
                  >
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${STATUS_CONFIG[s].color}`}
                    />
                    {STATUS_CONFIG[s].label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.includes(item.href);
          const Icon = item.icon;
          return (
            <button
              key={item.href}
              onClick={() => {
                router.push(item.href);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-[#EAF3EE] text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-card-foreground"
              }`}
            >
              <Icon className="w-4.5 h-4.5 flex-shrink-0" size={18} />
              {t(item.labelKey)}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-border">
        <button
          onClick={handleLogoutClick}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut size={18} />
          {t("nav_logout")}
        </button>
      </div>
    </div>
  );

  return (
    <div data-role="konsultan" className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-60 flex-shrink-0 flex-col">
        <SidebarContent />
      </aside>

      {/* Sidebar mobile overlay */}
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
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar mobile */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-card border-b border-border">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu size={20} className="text-muted-foreground" />
            </button>
            <div className="flex items-center gap-2">
              <SafePlaceLogo variant="colored" role="consultant" width={120} height={35} />
            </div>
          </div>
          <div className="md:hidden text-card-foreground">
            <NotificationBell />
          </div>
        </div>

        {/* Topbar Desktop */}
        <header className="hidden md:flex items-center justify-end px-6 py-4 bg-card border-b border-border z-10 relative shadow-sm">
          <div className="flex items-center gap-4 text-card-foreground">
            <NotificationBell />
            <div className="h-8 w-8 rounded-full bg-[#EAF3EE] text-primary flex items-center justify-center font-bold text-sm">
              KN
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={confirmLogout}
        isLoggingOut={isLoggingOut}
      />
    </div>
  );
}
