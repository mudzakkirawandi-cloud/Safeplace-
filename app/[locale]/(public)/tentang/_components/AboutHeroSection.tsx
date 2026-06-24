"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ShieldCheck } from "lucide-react";

export default function AboutHeroSection() {
  const t = useTranslations("tentang.hero");

  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-background">
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 opacity-10">
        <svg width="600" height="600" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="#4A90B8" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,81.1,-46.2C90.4,-33.3,96,-16.6,95.5,-0.3C95,16,88.4,32,78.8,45.2C69.2,58.4,56.6,68.8,42.5,76.2C28.4,83.6,14.2,88,-0.5,88.9C-15.2,89.8,-30.4,87.2,-43.8,79.9C-57.2,72.6,-68.8,60.6,-77.6,46.7C-86.4,32.8,-92.4,16.4,-92.6,-0.1C-92.8,-16.6,-87.2,-33.2,-78.3,-47.5C-69.4,-61.8,-57.2,-73.8,-43.1,-81C-29,-88.2,-14.5,-90.6,0.5,-91.4C15.5,-92.2,31,-91.4,44.7,-76.4Z" transform="translate(100 100)" />
        </svg>
      </div>

      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-sm font-semibold text-primary/60 uppercase tracking-widest mb-3"
            >
              {t("eyebrow")}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-primary mb-6 leading-tight"
            >
              {t("title")}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-lg text-muted-foreground leading-relaxed max-w-lg"
            >
              {t("subtitle")}
            </motion.p>
          </div>

          {/* Right: Animated Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 1, type: "spring", stiffness: 80 }}
            className="hidden lg:flex justify-center items-center"
          >
            <div className="relative flex items-center justify-center">
              {/* Outer pulse ring 1 */}
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.05, 0.15] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute w-72 h-72 rounded-full bg-primary"
              />
              {/* Outer pulse ring 2 */}
              <motion.div
                animate={{ scale: [1, 1.25, 1], opacity: [0.1, 0.03, 0.1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute w-72 h-72 rounded-full bg-primary"
              />
              {/* Main circle */}
              <div className="relative w-64 h-64 rounded-full bg-gradient-to-tr from-[#EBF5FB] to-white flex items-center justify-center shadow-[0_0_80px_rgba(74,144,184,0.2)] border border-border">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ShieldCheck size={110} className="text-primary opacity-80" />
                </motion.div>
                <div className="absolute bottom-10 text-center">
                  <p className="font-display font-bold text-primary text-xl tracking-wide">SafePlace</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
