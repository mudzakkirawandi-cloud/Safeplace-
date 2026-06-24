"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Eye, Target } from "lucide-react";

export default function VisiMisiSection() {
  const t = useTranslations("tentang.visimisi");

  const misiItems: string[] = t.raw("misi_items") as string[];

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
          <h2 className="text-3xl md:text-4xl font-display font-bold text-primary">{t("section_title")}</h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Visi */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="bg-card border border-border rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Eye size={24} className="text-primary" />
              </div>
              <h3 className="text-xl font-display font-bold text-primary">{t("visi_title")}</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed text-base">{t("visi_content")}</p>
          </motion.div>

          {/* Misi */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="bg-card border border-border rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Target size={24} className="text-primary" />
              </div>
              <h3 className="text-xl font-display font-bold text-primary">{t("misi_title")}</h3>
            </div>
            <ul className="space-y-3">
              {misiItems.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3 text-muted-foreground text-base"
                >
                  <span className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0" />
                  {item}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
