"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ShieldCheck, PenLine, Users } from "lucide-react";

export default function HowItWorksSection() {
  const t = useTranslations("homepage.howItWorks");

  const steps = [
    {
      icon: <ShieldCheck size={32} className="text-primary" />,
      title: t("step1_title"),
      desc: t("step1_desc"),
    },
    {
      icon: <PenLine size={32} className="text-[#E74C3C]" />,
      title: t("step2_title"),
      desc: t("step2_desc"),
    },
    {
      icon: <Users size={32} className="text-primary" />,
      title: t("step3_title"),
      desc: t("step3_desc"),
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-card">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-display font-bold text-primary mb-4">
            {t("title")}
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gray-100 z-0"></div>

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              className="relative z-10 flex flex-col items-center text-center bg-card p-8 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-border hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-shadow"
            >
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6 shadow-sm">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold text-primary mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-muted-foreground text-sm">
                {index + 1}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
