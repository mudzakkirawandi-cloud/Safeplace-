"use client";

import { motion, Variants } from "framer-motion";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { ArrowRight, HeartHandshake } from "lucide-react";

export default function HeroSection() {
  const t = useTranslations("homepage.hero");

  const titleWords = t("title").split(" ");

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.04 * i },
    }),
  };

  const child: Variants = {
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", damping: 12, stiffness: 100 },
    },
    hidden: { opacity: 0, y: 20 },
  };

  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-background">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 opacity-20">
        <svg width="600" height="600" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="#4A90B8" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,81.1,-46.2C90.4,-33.3,96,-16.6,95.5,-0.3C95,16,88.4,32,78.8,45.2C69.2,58.4,56.6,68.8,42.5,76.2C28.4,83.6,14.2,88,-0.5,88.9C-15.2,89.8,-30.4,87.2,-43.8,79.9C-57.2,72.6,-68.8,60.6,-77.6,46.7C-86.4,32.8,-92.4,16.4,-92.6,-0.1C-92.8,-16.6,-87.2,-33.2,-78.3,-47.5C-69.4,-61.8,-57.2,-73.8,-43.1,-81C-29,-88.2,-14.5,-90.6,0.5,-91.4C15.5,-92.2,31,-91.4,44.7,-76.4Z" transform="translate(100 100)" />
        </svg>
      </div>

      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-2xl">
            <motion.div
              style={{ overflow: "hidden", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}
              variants={container}
              initial="hidden"
              animate="visible"
              className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-primary mb-6 leading-tight"
            >
              {titleWords.map((word, index) => (
                <motion.span variants={child} key={index}>
                  {word}
                </motion.span>
              ))}
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-lg"
            >
              {t("subtitle")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/report/start"
                  className="flex justify-center items-center gap-2 px-8 py-4 bg-[#E74C3C] text-white font-medium rounded-xl hover:bg-[#c0392b] hover:shadow-lg transition-all"
                >
                  {t("primary_cta")}
                  <ArrowRight size={20} />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="#how-it-works"
                  className="flex justify-center items-center px-8 py-4 bg-card text-primary font-medium rounded-xl hover:bg-muted border border-border transition-all"
                >
                  {t("secondary_cta")}
                </Link>
              </motion.div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="hidden lg:flex justify-center"
          >
            <div className="relative w-full max-w-md aspect-square rounded-full bg-gradient-to-tr from-[#EBF5FB] to-white flex items-center justify-center shadow-[0_0_80px_rgba(74,144,184,0.15)] border border-border">
              <HeartHandshake size={160} className="text-primary opacity-80" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
