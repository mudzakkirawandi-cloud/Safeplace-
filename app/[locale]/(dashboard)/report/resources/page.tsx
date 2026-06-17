"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { PhoneCall, MessageCircle, MapPin, ArrowLeft, Info, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function ResourcesPage() {
  const t = useTranslations("report.resources");

  const contacts = [
    {
      id: "polri",
      title: t("polri_title"),
      desc: t("polri_desc"),
      icon: <PhoneCall size={24} />,
      action: "tel:110",
      actionLabel: t("btn_call_now"),
      color: "bg-red-50 text-red-600 border-red-200",
      btnColor: "bg-red-600 hover:bg-red-700 text-white"
    },
    {
      id: "sapa",
      title: t("sapa_title"),
      desc: t("sapa_desc"),
      icon: <PhoneCall size={24} />,
      action: "tel:129",
      actionLabel: t("btn_call_now"),
      color: "bg-orange-50 text-orange-600 border-orange-200",
      btnColor: "bg-orange-600 hover:bg-orange-700 text-white"
    },
    {
      id: "wa_sapa",
      title: t("wa_sapa_title"),
      desc: t("wa_sapa_desc"),
      icon: <MessageCircle size={24} />,
      action: "https://wa.me/628212600129",
      actionLabel: t("btn_whatsapp"),
      color: "bg-green-50 text-green-600 border-green-200",
      btnColor: "bg-green-600 hover:bg-green-700 text-white"
    },
    {
      id: "wa_humas",
      title: t("wa_humas_title"),
      desc: t("wa_humas_desc"),
      icon: <MessageCircle size={24} />,
      action: "https://wa.me/6289682333678",
      actionLabel: t("btn_whatsapp"),
      color: "bg-teal-50 text-teal-600 border-teal-200",
      btnColor: "bg-teal-600 hover:bg-teal-700 text-white"
    },
    {
      id: "spkt",
      title: t("spkt_title"),
      desc: t("spkt_desc"),
      icon: <MapPin size={24} />,
      action: "https://www.google.com/maps/search/kantor+polisi+terdekat",
      actionLabel: t("spkt_btn"),
      color: "bg-blue-50 text-blue-600 border-blue-200",
      btnColor: "bg-blue-600 hover:bg-blue-700 text-white"
    }
  ];

  const guides = [
    t("guide_1"),
    t("guide_2"),
    t("guide_3"),
    t("guide_4")
  ];

  return (
    <div className="min-h-screen bg-[#F0F7FC] py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#1B4F72] transition-colors mb-8 font-medium">
          <ArrowLeft size={20} />
          {t("back_to_home")}
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert size={32} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1B4F72] mb-4">
            {t("title")}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {contacts.map((contact, index) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-2xl border-2 ${contact.color.split(' ')[2]} p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full`}
            >
              <div className="flex items-start gap-4 mb-6 flex-1">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${contact.color.split(' ')[0]} ${contact.color.split(' ')[1]}`}>
                  {contact.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg mb-1">{contact.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{contact.desc}</p>
                </div>
              </div>
              <a 
                href={contact.action}
                target={contact.action.startsWith("http") ? "_blank" : undefined}
                rel={contact.action.startsWith("http") ? "noopener noreferrer" : undefined}
                className={`w-full py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors ${contact.btnColor}`}
              >
                {contact.icon}
                {contact.actionLabel}
              </a>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
              <Info size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">{t("guide_title")}</h2>
          </div>
          <ul className="space-y-4">
            {guides.map((guide, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 text-sm font-bold mt-0.5">
                  {idx + 1}
                </span>
                <span className="text-gray-700 leading-relaxed">{guide}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
