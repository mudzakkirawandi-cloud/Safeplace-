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

export default function PeerConsultantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("consultant"); // Menggunakan translation konsultan untuk menghemat
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
      href: "/peer-consultant/dashboard",
      icon: LayoutDashboard,
      labelKey: "nav_dashboard",
    },
    {
      href: "/peer-consultant/cases",
      icon: FolderOpen,
      labelKey: "nav_cases",
    },
    {
      href: "/peer-consultant/messages",
      icon: MessageCircle,
      labelKey: "nav_messages",
    },
    {
      href: "/peer-consultant/profile",
      icon: User,
      labelKey: "nav_profile",
    },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-gray-100">
      <div className="px-6 py-5 border-b border-gray-100">
        <SafePlaceLogo variant="colored" role="consultant" iconSize={20} textSize="text-base" />
        <span className="text-xs text-[#5B8A6F] font-medium mt-0.5 block">
          Portal Peer Consultant
        </span>
      </div>

      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-[#EAF3EE] flex items-center justify-center font-bold text-[#5B8A6F] text-sm flex-shrink-0">
            PC
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-[#1B4F72] truncate">
              Peer Consultant
            </p>
            <p className="text-xs text-gray-400">Konselor Sebaya</p>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setStatusDropdown(!statusDropdown)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-sm"
          >
            <span
              className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${STATUS_CONFIG[status].color}`}
            />
            <span className="font-medium text-gray-700">
              {STATUS_CONFIG[status].label}
            </span>
            <span className="ml-auto text-gray-400 text-xs">▾</span>
          </button>

          <AnimatePresence>
            {statusDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-lg shadow-lg z-10 overflow-hidden"
              >
                {(Object.keys(STATUS_CONFIG) as OnlineStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                      status === s ? "bg-gray-50 font-semibold" : ""
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
                  ? "bg-[#EAF3EE] text-[#5B8A6F]"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }`}
            >
              <Icon className="w-4.5 h-4.5 flex-shrink-0" size={18} />
              {t(item.labelKey)}
            </button>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={handleLogoutClick}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut size={18} />
          {t("nav_logout")}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F4F9F6] overflow-hidden">
      <aside className="hidden md:flex w-60 flex-shrink-0 flex-col">
        <SidebarContent />
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
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu size={20} className="text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <SafePlaceLogo variant="colored" role="consultant" iconSize={16} textSize="text-sm" />
            </div>
          </div>
          <div className="md:hidden text-gray-800">
            <NotificationBell />
          </div>
        </div>

        <header className="hidden md:flex items-center justify-end px-6 py-4 bg-white border-b border-gray-100 z-10 relative shadow-sm">
          <div className="flex items-center gap-4 text-gray-800">
            <NotificationBell />
            <div className="h-8 w-8 rounded-full bg-[#EAF3EE] text-[#5B8A6F] flex items-center justify-center font-bold text-sm">
              PC
            </div>
          </div>
        </header>

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
