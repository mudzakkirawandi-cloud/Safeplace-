"use client";

import { useTranslations } from "next-intl";
import { Phone, MessageCircle, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function EmergencySection() {
  const t = useTranslations("homepage.emergency");

  const emergencies = [
    {
      icon: Phone,
      label: t("polri"),
      href: "tel:110",
      color: "bg-red-100 text-red-600"
    },
    {
      icon: Phone,
      label: t("sapa"),
      href: "tel:129",
      color: "bg-orange-100 text-orange-600"
    },
    {
      icon: MessageCircle,
      label: t("wa_sapa"),
      href: "https://wa.me/628212600129",
      color: "bg-green-100 text-green-600"
    },
    {
      icon: MessageCircle,
      label: t("wa_humas"),
      href: "https://wa.me/6289682333678",
      color: "bg-blue-100 text-blue-600"
    }
  ];

  return (
    <section className="py-16 bg-red-50/50 border-t border-red-100">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10">
          <div className="flex items-center gap-4">
            <div className="bg-red-100 p-3 rounded-full">
              <AlertTriangle className="text-red-600 w-8 h-8" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              {t("title")}
            </h2>
          </div>
          
          <Link 
            href="/report/resources"
            className="flex items-center gap-2 text-[#E74C3C] font-medium hover:text-red-700 transition-colors"
          >
            {t("view_all")} <ArrowRight size={20} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {emergencies.map((item, index) => (
            <motion.a
              key={index}
              href={item.href}
              target={item.href.startsWith("http") ? "_blank" : undefined}
              rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col items-center text-center gap-4 group"
            >
              <div className={`p-4 rounded-full transition-transform group-hover:scale-110 ${item.color}`}>
                <item.icon size={28} />
              </div>
              <span className="font-semibold text-gray-800 text-sm md:text-base">
                {item.label}
              </span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
