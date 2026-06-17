"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Navbar from "../_components/Navbar";
import Footer from "../_components/Footer";
import { Users, Heart, Shield, GraduationCap, MessageSquare, Send, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function CommunityPage() {
  const t = useTranslations("homepage.community");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const categories = [
    { icon: Heart, title: t("cat_1"), desc: t("cat_1_desc"), color: "bg-red-50 text-red-500" },
    { icon: Shield, title: t("cat_2"), desc: t("cat_2_desc"), color: "bg-blue-50 text-blue-500" },
    { icon: Users, title: t("cat_3"), desc: t("cat_3_desc"), color: "bg-green-50 text-green-500" },
    { icon: GraduationCap, title: t("cat_4"), desc: t("cat_4_desc"), color: "bg-purple-50 text-purple-500" },
    { icon: MessageSquare, title: t("cat_5"), desc: t("cat_5_desc"), color: "bg-orange-50 text-orange-500" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFBFF]">
      <Navbar />
      <main className="flex-1 pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16 relative">
            <div className="inline-block px-4 py-1.5 bg-[#1B4F72]/10 text-[#1B4F72] text-sm font-bold rounded-full mb-6">
              Coming Soon
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-[#1B4F72] mb-6">
              {t("title")}
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
              {t("subtitle")}
            </p>
          </div>

          {/* Categories Preview */}
          <div className="mb-20">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-10">
              {t("preview_title")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
              {categories.map((cat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all ${index === 3 ? 'lg:col-start-2' : ''} ${index === 4 ? 'lg:col-start-3' : ''}`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${cat.color}`}>
                    <cat.icon size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{cat.title}</h3>
                  <p className="text-gray-500 text-sm">{cat.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Notify Form */}
          <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1B4F72] to-[#4A90B8]"></div>
            
            {submitted ? (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="py-6"
              >
                <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Sukses!</h3>
                <p className="text-gray-500">{t("notify_success")}</p>
              </motion.div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-[#1B4F72] mb-6">{t("notify_title")}</h3>
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("notify_placeholder")}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1B4F72]/20 focus:border-[#1B4F72] transition-all"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-[#1B4F72] hover:bg-[#1B4F72]/90 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <Send size={18} /> {t("notify_btn")}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
