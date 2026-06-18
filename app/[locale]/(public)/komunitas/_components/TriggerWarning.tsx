"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Eye } from "lucide-react";
import { useTranslations } from "next-intl";

interface TriggerWarningProps {
  postId: string;
  triggerText: string;
  children: React.ReactNode;
}

export default function TriggerWarning({ postId, triggerText, children }: TriggerWarningProps) {
  const t = useTranslations("community_page");
  const [isReady, setIsReady] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const stored = sessionStorage.getItem(`tw_ready_${postId}`);
    if (stored === "true") {
      setIsReady(true);
    }
  }, [postId]);

  const handleReady = () => {
    setIsReady(true);
    sessionStorage.setItem(`tw_ready_${postId}`, "true");
  };

  // Prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="relative overflow-hidden rounded-xl bg-gray-50 border border-gray-100 min-h-[300px]">
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-xl">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-14 w-14 bg-red-50 rounded-full mb-4"></div>
            <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
            <div className="h-10 w-36 bg-gray-300 rounded-xl mt-2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-xl bg-white overflow-hidden border border-gray-100">
      <AnimatePresence>
        {!isReady && (
          <motion.div
            initial={{ opacity: 1, backdropFilter: "blur(16px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/40 backdrop-blur-xl p-6 text-center"
          >
            <div className="max-w-md rounded-2xl bg-white/95 p-8 shadow-2xl border border-red-50 flex flex-col items-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
                <AlertTriangle className="h-7 w-7" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">Trigger Warning</h3>
              <p className="mb-6 text-sm text-gray-600 leading-relaxed">
                {t("trigger_warning_hidden")} <br />
                <span className="font-semibold text-red-600 mt-1.5 inline-block px-3 py-1 bg-red-50 rounded-lg">&quot;{triggerText}&quot;</span>
              </p>
              <button
                onClick={handleReady}
                className="flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-gray-900/20"
              >
                <Eye className="h-4 w-4" />
                {t("trigger_warning_ready")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`p-6 md:p-8 transition-opacity duration-500 ${!isReady ? "opacity-20 pointer-events-none select-none h-[300px] overflow-hidden" : "opacity-100"}`}>
        {isReady && (
          <div className="mb-4 flex items-center justify-between rounded-lg bg-red-50 p-3 text-sm border border-red-100">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span><span className="font-semibold">TW:</span> {triggerText}</span>
            </div>
            <button 
              onClick={() => {
                setIsReady(false);
                sessionStorage.removeItem(`tw_ready_${postId}`);
              }} 
              className="text-red-600 hover:text-red-800 underline text-xs font-medium"
            >
              {t("trigger_warning_hide")}
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
