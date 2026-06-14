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
} from "lucide-react";
import { createClient } from "../../../../lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const navItems = [
    { href: "/operator/dashboard", icon: LayoutDashboard, labelKey: "nav_dashboard" },
    { href: "/operator/reports", icon: Files, labelKey: "nav_reports" },
    { href: "/operator/satgas", icon: Users, labelKey: "nav_satgas_directory" },
    { href: "/operator/profile", icon: User, labelKey: "nav_profile" },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#7B5EA7] text-white">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-[#8c6ebf]">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#F4A261]" />
          <span className="font-bold text-white text-base tracking-tight">
            SafePlace
          </span>
        </div>
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
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-200 hover:bg-red-500/20 hover:text-red-100 transition-all"
        >
          <LogOut size={18} />
          {t("nav_logout")}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F8F5FC] overflow-hidden">
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
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-[#7B5EA7] text-white">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-[#8c6ebf] transition-colors"
          >
            <Menu size={20} className="text-white" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#F4A261]" />
            <span className="font-bold text-sm">Operator Portal</span>
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
