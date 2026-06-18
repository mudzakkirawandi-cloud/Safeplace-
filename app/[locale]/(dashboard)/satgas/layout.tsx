"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShieldAlert,
  BarChart3,
  UserCircle,
  LogOut,
  Menu,
} from "lucide-react";
import { createClient } from "../../../../lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import NotificationBell from "../../_components/NotificationBell";
import LogoutConfirmModal from "../../_components/LogoutConfirmModal";
import SafePlaceLogo from "../../_components/SafePlaceLogo";

export default function SatgasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("satgas");
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    router.push("/");
  };

  const navItems = [
    { href: "/satgas/dashboard", icon: LayoutDashboard, labelKey: "nav_dashboard" },
    { href: "/satgas/cases", icon: ShieldAlert, labelKey: "nav_cases" },
    { href: "/satgas/stats", icon: BarChart3, labelKey: "nav_campus_stats" },
    { href: "/satgas/profile", icon: UserCircle, labelKey: "nav_profile" },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#1A5276] text-white">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-[#2471A3]">
        <SafePlaceLogo variant="white" role="satgas" iconSize={20} textSize="text-base" />
        <span className="text-xs text-[#D4AC0D] font-medium mt-0.5 block">
          Portal Satgas PPKS
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
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
                  ? "bg-[#D4AC0D] text-[#154360]"
                  : "text-gray-300 hover:bg-[#2471A3] hover:text-white"
              }`}
            >
              <Icon className="w-4.5 h-4.5 flex-shrink-0" size={18} />
              {t(item.labelKey)}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-[#2471A3]">
        <button
          onClick={handleLogoutClick}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all"
        >
          <LogOut size={18} />
          {t("nav_logout")}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#EBF5FB] overflow-hidden">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-64 flex-shrink-0 flex-col">
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
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-64 z-50 md:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar mobile */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#1A5276] text-white">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-[#2471A3] transition-colors"
            >
              <Menu size={20} className="text-white" />
            </button>
            <div className="flex items-center gap-2">
              <SafePlaceLogo variant="white" role="satgas" iconSize={16} textSize="text-sm" />
            </div>
          </div>
          <div className="md:hidden">
            <NotificationBell />
          </div>
        </div>

        {/* Topbar Desktop */}
        <header className="hidden md:flex items-center justify-end px-6 py-4 bg-white border-b border-gray-100 z-10 relative shadow-sm">
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="h-8 w-8 rounded-full bg-[#1A5276] text-white flex items-center justify-center font-bold text-sm">
              SG
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          {children}
        </main>
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
