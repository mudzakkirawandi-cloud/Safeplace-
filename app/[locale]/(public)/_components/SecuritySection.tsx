"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Ghost, Lock, UserX, LogOut } from "lucide-react";

export default function SecuritySection() {
  const t = useTranslations("homepage.security");

  const features = [
    {
      icon: <Ghost size={28} className="text-white" />,
      title: t("feature1_title"),
      desc: t("feature1_desc"),
      color: "bg-primary",
    },
    {
      icon: <Lock size={28} className="text-white" />,
      title: t("feature2_title"),
      desc: t("feature2_desc"),
      color: "bg-primary",
    },
    {
      icon: <UserX size={28} className="text-white" />,
      title: t("feature3_title"),
      desc: t("feature3_desc"),
      color: "bg-primary",
    },
    {
      icon: <LogOut size={28} className="text-white" />,
      title: t("feature4_title"),
      desc: t("feature4_desc"),
      color: "bg-[#E74C3C]",
    },
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-display font-bold text-primary mb-6">
              {t("title")}
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Prioritas utama SafePlace adalah keamanan dan privasimu. Sistem kami dirancang sedemikian rupa agar kamu memiliki kendali penuh atas cerita dan identitasmu.
            </p>
            <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground bg-card p-4 rounded-lg shadow-sm w-max border border-border">
              <Lock size={18} className="text-primary" />
              End-to-End Encryption Applied
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                className="bg-card p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-border"
              >
                <div className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mb-5 shadow-sm`}>
                  {feature.icon}
                </div>
                <h4 className="font-bold text-primary mb-2">{feature.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
