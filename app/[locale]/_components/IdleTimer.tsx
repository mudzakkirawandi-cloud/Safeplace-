"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";

const IDLE_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
const COUNTDOWN_SECONDS = 60;

export default function IdleTimer({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabase = createClient();

  const [isIdle, setIsIdle] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());

  const resetTimer = useCallback(() => {
    setLastActivity(Date.now());
    if (isIdle) {
      setIsIdle(false);
      setCountdown(COUNTDOWN_SECONDS);
    }
  }, [isIdle]);

  useEffect(() => {
    // Only apply idle check on dashboard paths where user is logged in
    if (!window.location.pathname.match(/\/(admin|consultant|operator|satgas|report\/track)/)) return;

    const activityEvents = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];

    const handleActivity = () => resetTimer();

    activityEvents.forEach((e) => document.addEventListener(e, handleActivity));

    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastActivity > IDLE_TIMEOUT_MS && !isIdle) {
        setIsIdle(true);
      }
    }, 1000);

    return () => {
      activityEvents.forEach((e) => document.removeEventListener(e, handleActivity));
      clearInterval(interval);
    };
  }, [lastActivity, isIdle, resetTimer]);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    setIsIdle(false);
    router.push("/login?reason=idle");
  }, [supabase.auth, router]);

  useEffect(() => {
    let countdownInterval: NodeJS.Timeout;
    
    if (isIdle) {
      countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            handleLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(countdownInterval);
  }, [isIdle, handleLogout]);

  return (
    <>
      {children}
      <AnimatePresence>
        {isIdle && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-sm w-full text-center"
            >
              <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Sesi Tidak Aktif</h2>
              <p className="text-sm text-gray-500 mb-6">
                Demi keamanan, sesi Anda akan otomatis keluar dalam <strong className="text-red-500">{countdown} detik</strong> jika tidak ada aktivitas.
              </p>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={resetTimer}
                  className="w-full py-3 bg-[#2C3E6B] hover:bg-[#1f2b4a] text-white rounded-xl font-semibold transition-colors"
                >
                  Tetap Masuk
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                >
                  Keluar Sekarang
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
