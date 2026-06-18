"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { LogOut } from "lucide-react";

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoggingOut?: boolean;
}

export default function LogoutConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isLoggingOut = false,
}: LogoutConfirmModalProps) {
  const t = useTranslations("auth");

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isLoggingOut ? onClose : undefined}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
          />
          <div className="fixed inset-0 flex items-center justify-center z-[101] p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card rounded-2xl shadow-xl w-full max-w-md overflow-hidden pointer-events-auto"
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <LogOut className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="text-xl font-semibold text-primary mb-2">
                      {t("logout_confirm_title")}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {t("logout_confirm_desc")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-muted px-6 py-4 flex items-center justify-end gap-3 border-t border-border">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoggingOut}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-card-foreground bg-card border border-border hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
                >
                  {t("logout_cancel")}
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isLoggingOut}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoggingOut ? (
                    <div className="w-4 h-4 border-2 border-border/30 border-t-white rounded-full animate-spin" />
                  ) : null}
                  {t("logout_confirm")}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
