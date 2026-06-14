"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: "1", title: "Laporan Baru", message: "Ada laporan kasus masuk dari kampus Anda.", time: "2 menit lalu", read: false },
    { id: "2", title: "Update Status", message: "Status kasus RPT-UI-0128 diperbarui menjadi Diinvestigasi.", time: "1 jam lalu", read: false },
    { id: "3", title: "Pesan Konsultasi", message: "Pesan baru dari pelapor anonim.", time: "3 jam lalu", read: true },
  ]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-black/5 text-gray-200 hover:text-white transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] items-center justify-center text-white font-bold">
              {unreadCount}
            </span>
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-semibold text-gray-800 text-sm">Notifikasi</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
                >
                  <Check size={14} /> Tandai semua dibaca
                </button>
              )}
            </div>
            
            <div className="max-h-80 overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-500">
                  Tidak ada notifikasi baru.
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${notif.read ? 'opacity-70' : 'bg-blue-50/30'}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-sm font-semibold ${notif.read ? 'text-gray-700' : 'text-gray-900'}`}>{notif.title}</span>
                        <span className="text-[10px] text-gray-400">{notif.time}</span>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">{notif.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-2 border-t border-gray-100 text-center bg-gray-50/50">
              <button className="text-xs text-gray-500 font-medium hover:text-gray-800 transition-colors">
                Lihat Semua Notifikasi
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
