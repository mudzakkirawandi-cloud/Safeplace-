"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useReportContext } from "../../../_contexts/ReportContext";
import { ClipboardList, MessageCircle, Building2, CheckCircle2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function ReportIntentPage() {
  const t = useTranslations("report.intent");
  const router = useRouter();
  const { state, setIntent } = useReportContext();
  const [selectedIntent, setSelectedIntent] = useState<"document" | "consult" | "satgas" | null>(state.intent);

  const handleContinue = () => {
    if (selectedIntent) {
      setIntent(selectedIntent);
      router.push("/report/form");
    }
  };

  const intents = [
    {
      id: "document" as const,
      icon: <ClipboardList className="w-8 h-8" />,
      title: t("document_title"),
      desc: t("document_desc"),
      color: "text-primary",
      bg: "bg-background"
    },
    {
      id: "consult" as const,
      icon: <MessageCircle className="w-8 h-8" />,
      title: t("consult_title"),
      desc: t("consult_desc"),
      color: "text-primary",
      bg: "bg-background"
    },
    {
      id: "satgas" as const,
      icon: <Building2 className="w-8 h-8" />,
      title: t("satgas_title"),
      desc: t("satgas_desc"),
      color: "text-primary",
      bg: "bg-[#EAECEE]"
    }
  ];

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 container mx-auto max-w-4xl py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">{t("title")}</h1>
      </motion.div>

      <div className="grid gap-6 w-full max-w-2xl mb-10">
        {intents.map((item, index) => {
          const isSelected = selectedIntent === item.id;
          
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedIntent(item.id)}
              className={`relative p-6 rounded-2xl shadow-sm border-2 transition-all text-left flex items-start gap-5 group
                ${isSelected 
                  ? "border-[#4A90B8] bg-card ring-4 ring-[#EBF5FB]" 
                  : "border-border bg-card hover:border-gray-300 hover:shadow-md"
                }
              `}
            >
              <div className={`p-4 rounded-full flex-shrink-0 ${item.bg} ${item.color}`}>
                {item.icon}
              </div>
              
              <div className="flex-1 pt-2">
                <h2 className="text-xl font-bold text-primary mb-2">{item.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>

              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-4 right-4 text-primary"
                >
                  <CheckCircle2 className="w-8 h-8 fill-blue-50" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col items-center w-full max-w-2xl"
      >
        <button
          onClick={handleContinue}
          disabled={!selectedIntent}
          className={`w-full py-4 rounded-xl font-bold text-lg flex justify-center items-center gap-2 transition-all
            ${selectedIntent 
              ? "bg-[#E74C3C] hover:bg-[#c0392b] text-white shadow-lg hover:shadow-xl" 
              : "bg-gray-200 text-muted-foreground cursor-not-allowed"
            }
          `}
        >
          {t("continue_btn")}
          <ArrowRight className="w-5 h-5" />
        </button>
        
        <p className="mt-4 text-sm text-muted-foreground">{t("change_later_note")}</p>
      </motion.div>
    </main>
  );
}
