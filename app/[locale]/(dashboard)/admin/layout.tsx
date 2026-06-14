"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Files,
  Users,
  UserCheck,
  ShieldAlert,
  Building,
  Settings,
  Download,
  Activity,
  LogOut,
  Menu,
  Shield,
} from "lucide-react";
import { createClient } from "../../../../lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("admin");
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const navItems = [
    { href: "/admin/dashboard", icon: LayoutDashboard, labelKey: "nav_dashboard" },
    { href: "/admin/reports", icon: Files, labelKey: "nav_reports" },
    { href: "/admin/users", icon: Users, labelKey: "nav_users" },
    { href: "/admin/consultants", icon: UserCheck, labelKey: "nav_consultants" },
    { href: "/admin/operators", icon: Shield, labelKey: "nav_operators" },
    { href: "/admin/satgas", icon: ShieldAlert, labelKey: "nav_satgas" },
    { href: "/admin/campuses", icon: Building, labelKey: "nav_campuses" },
    { href: "/admin/settings", icon: Settings, labelKey: "nav_settings" },
    { href: "/admin/export", icon: Download, labelKey: "nav_export" },
    { href: "/admin/audit", icon: Activity, labelKey: "nav_audit_log" },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#2C3E6B] text-white">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-[#3b5082]">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#4ECDC4]" />
          <span className="font-bold text-white text-base tracking-tight">
            SafePlace
          </span>
        </div>
        <span className="text-xs text-[#4ECDC4] font-medium mt-0.5 block">
          Portal Admin
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
                  ? "bg-[#4ECDC4] text-[#1B4F72]"
                  : "text-gray-300 hover:bg-[#3b5082] hover:text-white"
              }`}
            >
              <Icon className="w-4.5 h-4.5 flex-shrink-0" size={18} />
              {t(item.labelKey)}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-[#3b5082]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all"
        >
          <LogOut size={18} />
          {t("nav_logout")}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F5F6FA] overflow-hidden">
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
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-[#2C3E6B] text-white">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-[#3b5082] transition-colors"
          >
            <Menu size={20} className="text-white" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#4ECDC4]" />
            <span className="font-bold text-sm">SafePlace Admin</span>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
