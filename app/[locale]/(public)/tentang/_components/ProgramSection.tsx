"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { BookOpen, Mic, Users } from "lucide-react";

const programIcons = [Users, BookOpen, Mic];
const badgeStyles: Record<string, string> = {
  "Sudah Berjalan": "bg-[#EAF3EE] text-[#5B8A6F]",
  "Segera Hadir": "bg-[#F2EEF9] text-[#7B5EA7]",
  "Akan Datang": "bg-[#F5F6FA] text-[#6B7280]",
};

export default function ProgramSection() {
  const t = useTranslations("tentang.program");

  const programs: { title: string; badge: string; desc: string; detail: string }[] =
    t.raw("items") as { title: string; badge: string; desc: string; detail: string }[];

  return (
    <section className="py-20 bg-gradient-to-b from-[#FAFBFF] to-white">
      <div className="container mx-auto px-6 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-sm font-semibold text-primary/60 uppercase tracking-widest mb-2">{t("eyebrow")}</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-primary mb-4">{t("section_title")}</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">{t("subtitle")}</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {programs.map((program, i) => {
            const Icon = programIcons[i] || BookOpen;
            const badgeClass = badgeStyles[program.badge] || "bg-[#F5F6FA] text-[#6B7280]";
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className="bg-card border border-border rounded-2xl p-7 hover:shadow-lg transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                  <Icon size={24} className="text-primary" />
                </div>
                <span className={`inline-block text-xs font-semibold rounded-full px-3 py-1 mb-3 ${badgeClass}`}>
                  {program.badge}
                </span>
                <h3 className="font-display font-bold text-primary text-lg mb-2">{program.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-3">{program.desc}</p>
                <p className="text-xs text-primary/60 font-medium">{program.detail}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
