"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function ImpactSection() {
  const t = useTranslations("homepage.impact");

  const stats = [
    { value: t("stat1_value"), label: t("stat1_label") },
    { value: t("stat2_value"), label: t("stat2_label") },
    { value: t("stat3_value"), label: t("stat3_label") },
  ];

  return (
    <section className="py-20 bg-primary text-white">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-display font-bold mb-4">
            {t("title")}
          </h2>
          <p className="text-[#A9CCE3] max-w-2xl mx-auto">
            SafePlace terus berkembang menjangkau lebih banyak institusi demi menciptakan ruang aman bagi semuanya.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-[#2C3E6B]">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
              className="text-center py-6"
            >
              <div className="text-5xl font-bold text-white mb-2 font-display">
                {stat.value}
              </div>
              <div className="text-[#A9CCE3] font-medium tracking-wide">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
