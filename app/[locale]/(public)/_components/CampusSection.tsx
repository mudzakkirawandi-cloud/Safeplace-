"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Building } from "lucide-react";
import Link from "next/link";

export default function CampusSection() {
  const t = useTranslations("homepage.campus");

  return (
    <section className="py-24 bg-card">
      <div className="container mx-auto px-6 max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-background rounded-3xl p-10 md:p-16 border border-[#D6EAF8]"
        >
          <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
            <Building size={32} />
          </div>
          <h2 className="text-3xl font-display font-bold text-primary mb-4">
            {t("title")}
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
          <Link
            href="/register-campus"
            className="inline-flex justify-center items-center px-8 py-3 bg-primary text-white font-medium rounded-xl hover:bg-[#154360] shadow-md hover:shadow-lg transition"
          >
            {t("cta")}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
