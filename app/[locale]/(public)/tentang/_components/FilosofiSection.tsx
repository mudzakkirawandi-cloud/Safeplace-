"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Heart, Lock, Users, Star } from "lucide-react";

const icons = [Lock, Heart, Users, Star];
const iconColors = ["text-[#1B4F72]", "text-[#C9847A]", "text-[#4A90B8]", "text-[#5B8A6F]"];
const iconBgs = ["bg-[#E8F0F8]", "bg-[#FDF0ED]", "bg-[#EEF4F9]", "bg-[#EAF3EE]"];

export default function FilosofiSection() {
  const t = useTranslations("tentang.filosofi");

  const values: { title: string; desc: string }[] = t.raw("values") as { title: string; desc: string }[];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Makna nama */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-sm font-semibold text-primary/60 uppercase tracking-widest mb-2">{t("eyebrow")}</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-primary mb-6">{t("section_title")}</h2>
            <p className="text-muted-foreground leading-relaxed mb-6 text-base">{t("meaning")}</p>
            <div className="bg-gradient-to-br from-[#EBF5FB] to-white border border-border rounded-2xl p-6">
              <p className="text-primary font-display font-semibold text-lg leading-relaxed italic">
                &quot;{t("tagline")}&quot;
              </p>
            </div>
          </motion.div>

          {/* Right: Nilai-nilai */}
          <div className="grid grid-cols-2 gap-4">
            {values.map((val, i) => {
              const Icon = icons[i] || Star;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.5 }}
                  className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-shadow"
                >
                  <div className={`w-10 h-10 rounded-lg ${iconBgs[i] || "bg-primary/10"} flex items-center justify-center mb-3`}>
                    <Icon size={20} className={iconColors[i] || "text-primary"} />
                  </div>
                  <h4 className="font-display font-bold text-primary text-sm mb-1">{val.title}</h4>
                  <p className="text-muted-foreground text-xs leading-relaxed">{val.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
