"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Files,
  Users,
  User,
  LogOut,
  Menu,
  MessageSquare
} from "lucide-react";
import { createClient } from "../../../../lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import NotificationBell from "../../_components/NotificationBell";
import LogoutConfirmModal from "../../_components/LogoutConfirmModal";
import SafePlaceLogo from "@/components/ui/SafePlaceLogo";

export default function OperatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("operator");
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
    { href: "/operator/dashboard", icon: LayoutDashboard, labelKey: "nav_dashboard" },
    { href: "/operator/reports", icon: Files, labelKey: "nav_reports" },
    { href: "/operator/community", icon: MessageSquare, labelKey: "nav_community_moderation" },
    { href: "/operator/satgas", icon: Users, labelKey: "nav_satgas_directory" },
    { href: "/operator/profile", icon: User, labelKey: "nav_profile" },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-primary text-white">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-[#8c6ebf]">
        <SafePlaceLogo variant="white" role="operator" width={150} height={44} />
        <span className="text-xs text-[#F4A261] font-medium mt-0.5 block">
          Portal Operator Komunitas
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
                  ? "bg-[#F4A261] text-[#4a3568]"
                  : "text-gray-200 hover:bg-[#8c6ebf] hover:text-white"
              }`}
            >
              <Icon className="w-4.5 h-4.5 flex-shrink-0" size={18} />
              {t(item.labelKey)}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-[#8c6ebf]">
        <button
          onClick={handleLogoutClick}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-200 hover:bg-red-500/20 hover:text-red-100 transition-all"
        >
          <LogOut size={18} />
          {t("nav_logout")}
        </button>
      </div>
    </div>
  );

  return (
    <div data-role="operator" className="flex h-screen bg-background text-foreground overflow-hidden">
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
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-primary text-white">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-[#8c6ebf] transition-colors"
            >
              <Menu size={20} className="text-white" />
            </button>
            <div className="flex items-center gap-2">
              <SafePlaceLogo variant="white" role="operator" width={120} height={35} />
            </div>
          </div>
          <div className="md:hidden">
            <NotificationBell />
          </div>
        </div>

        {/* Topbar Desktop */}
        <header className="hidden md:flex items-center justify-end px-6 py-4 bg-card border-b border-border z-10 relative shadow-sm">
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
              OP
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
