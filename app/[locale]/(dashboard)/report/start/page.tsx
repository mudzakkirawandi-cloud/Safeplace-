"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useReportContext } from "../../../_contexts/ReportContext";
import { Shield, User, AlertCircle, ArrowRight, Heart, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type FlowState = "assessment" | "emergency" | "recommendation" | "waiting" | "path_selection";

const questions = [
  {
    title: "Bagaimana kondisimu saat ini?",
    options: [
      { id: "A", text: "😰 Saya takut dan butuh seseorang untuk diajak bicara sekarang" },
      { id: "B", text: "😔 Saya bingung dan tidak tahu harus berbuat apa" },
      { id: "C", text: "😤 Saya ingin kejadian ini ditangani secara resmi" },
      { id: "D", text: "📝 Saya hanya ingin mencatat kejadian ini dulu" },
    ],
  },
  {
    title: "Seberapa aman kondisimu saat ini?",
    options: [
      { id: "A", text: "🔴 Saya masih dalam bahaya / dekat dengan pelaku" },
      { id: "B", text: "🟡 Saya sudah aman tapi masih sangat tertekan" },
      { id: "C", text: "🟢 Saya sudah aman dan cukup tenang" },
    ],
  },
  {
    title: "Apakah ini pertama kali kamu menceritakan kejadian ini?",
    options: [
      { id: "A", text: "Ya, belum pernah cerita ke siapapun" },
      { id: "B", text: "Sudah cerita ke orang terdekat" },
      { id: "C", text: "Sudah pernah lapor sebelumnya" },
    ],
  },
];

const waitTexts = [
  "Kamu sudah berani mengambil langkah pertama",
  "Kamu tidak sendirian dalam menghadapi ini",
  "Ada seseorang yang siap mendengarkanmu",
  "Butuh waktu sebentar, terima kasih sudah menunggu",
];

export default function ReportStartPage() {
  const t = useTranslations("report.start");
  const router = useRouter();
  const { setPath } = useReportContext();
  const supabase = createClient();

  const [flowState, setFlowState] = useState<FlowState>("assessment");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  
  const [waitTextIndex, setWaitTextIndex] = useState(0);
  const [hasCheckedOnline, setHasCheckedOnline] = useState(false);

  useEffect(() => {
    if (flowState === "waiting") {
      const interval = setInterval(() => {
        setWaitTextIndex((prev) => (prev + 1) % waitTexts.length);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [flowState]);

  useEffect(() => {
    if (flowState === "waiting" && !hasCheckedOnline) {
      const checkOnline = async () => {
        const { data } = await supabase
          .from("users")
          .select("id")
          .eq("role", "peer_consultant")
          .eq("is_online", true)
          .limit(1);

        if (data && data.length > 0) {
          setTimeout(() => {
             setFlowState("path_selection");
          }, 3000);
        } else {
          setTimeout(() => {
            setFlowState("path_selection");
          }, 5000);
        }
        setHasCheckedOnline(true);
      };
      
      checkOnline();
    }
  }, [flowState, hasCheckedOnline, supabase]);

  const handleSelectOption = (optionId: string) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = optionId;
    setAnswers(newAnswers);

    if (questionIndex === 1 && optionId === "A") {
      setFlowState("emergency");
      return;
    }

    if (questionIndex < questions.length - 1) {
      setQuestionIndex(questionIndex + 1);
    } else {
      setFlowState("recommendation");
    }
  };

  const handleSelectPath = (path: "anonymous" | "identified") => {
    setPath(path);
    router.push("/report/mode");
  };

  const getRecommendation = () => {
    const q1 = answers[0];
    
    if (q1 === "A" || q1 === "B") {
      return {
        title: "Kami rekomendasikan kamu bicara dengan Peer Consultant dulu",
        sub: "Mereka adalah teman sebaya yang terlatih dan siap mendengarkan",
      };
    } else if (q1 === "C") {
      return {
        title: "Kami akan hubungkan kamu dengan Peer Consultant",
        sub: "Yang akan membantu mengarahkan ke penanganan resmi",
      };
    } else {
      return {
        title: "Kami akan bantu kamu mencatat kejadian ini",
        sub: "Dan kami juga siap jika kamu ingin bicara lebih lanjut",
      };
    }
  };

  return (
    <div className="min-h-screen bg-[#F4FAF8] flex flex-col relative overflow-hidden -m-6 rounded-xl">
      <div className="absolute top-4 right-4 z-50">
        <button 
          onClick={() => setFlowState("emergency")}
          className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-full font-medium shadow-sm border border-red-100 flex items-center gap-2 transition-colors"
        >
          <Phone className="w-4 h-4" />
          Darurat
        </button>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center p-6 container mx-auto max-w-4xl relative z-10 min-h-[80vh]">
        <AnimatePresence mode="wait">
          {flowState === "assessment" && (
            <motion.div
              key={`question-${questionIndex}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-[640px] md:max-w-[560px] mx-auto"
            >
              <div className="flex justify-center gap-2 mb-8">
                {questions.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === questionIndex ? "w-8 bg-[#5B8A6F]" : "w-2 bg-[#D1E0D9]"
                    }`}
                  />
                ))}
              </div>

              <h1 className="text-[22px] md:text-[24px] font-bold text-[#1B4F72] mb-8 text-center leading-snug">
                {questions[questionIndex].title}
              </h1>

              <div className="flex flex-col gap-4">
                {questions[questionIndex].options.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    className="w-full min-h-[72px] bg-white p-5 rounded-2xl shadow-sm border border-transparent hover:border-[#5B8A6F] hover:bg-[#F4F9F6] focus:border-[#5B8A6F] focus:bg-[#F4F9F6] transition-all text-left group"
                  >
                    <span className="text-gray-800 font-medium group-hover:text-[#2C3E6B]">
                      {opt.text}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {flowState === "emergency" && (
            <motion.div
              key="emergency"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-2xl bg-white p-8 rounded-3xl shadow-xl border border-red-100"
            >
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-10 h-10 text-red-600" />
                </div>
                <h1 className="text-2xl font-bold text-red-600 mb-2">Keselamatanmu adalah prioritas utama</h1>
                <p className="text-gray-600">Jika kamu dalam bahaya, segera hubungi layanan darurat berikut:</p>
              </div>

              <div className="space-y-4 mb-8">
                <a href="tel:110" className="block bg-red-50 p-4 rounded-2xl hover:bg-red-100 transition-colors border border-red-100">
                  <h3 className="font-bold text-red-700 text-lg mb-1">📞 Polri 110</h3>
                  <p className="text-red-600/80 text-sm">Jika dalam bahaya fisik langsung</p>
                </a>
                <a href="tel:119" className="block bg-red-50 p-4 rounded-2xl hover:bg-red-100 transition-colors border border-red-100">
                  <h3 className="font-bold text-red-700 text-lg mb-1">📞 119 ext 8</h3>
                  <p className="text-red-600/80 text-sm">Layanan kesehatan jiwa 24 jam</p>
                </a>
                <a href="tel:129" className="block bg-red-50 p-4 rounded-2xl hover:bg-red-100 transition-colors border border-red-100">
                  <h3 className="font-bold text-red-700 text-lg mb-1">📞 SAPA 129</h3>
                  <p className="text-red-600/80 text-sm">Pendampingan kekerasan berbasis gender</p>
                </a>
              </div>

              <button
                onClick={() => setFlowState(questionIndex >= questions.length - 1 ? "recommendation" : "assessment")}
                className="w-full py-4 text-gray-500 font-medium hover:text-gray-800 transition-colors"
              >
                Saya sudah aman, lanjutkan laporan
              </button>
            </motion.div>
          )}

          {flowState === "recommendation" && (
            <motion.div
              key="recommendation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-xl text-center"
            >
              <div className="bg-white p-8 md:p-12 rounded-3xl shadow-lg border border-[#E7E9EB] mb-6">
                <div className="w-16 h-16 bg-[#F4F9F6] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-8 h-8 text-[#5B8A6F]" />
                </div>
                <h1 className="text-2xl font-bold text-[#1B4F72] mb-3">
                  {getRecommendation().title}
                </h1>
                <p className="text-gray-500 mb-8">
                  {getRecommendation().sub}
                </p>

                <button
                  onClick={() => setFlowState("waiting")}
                  className="w-full bg-[#5B8A6F] text-white py-4 rounded-2xl font-bold text-lg hover:bg-[#4A735C] transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2 mb-4"
                >
                  Ya, saya siap <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setFlowState("path_selection")}
                  className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
                >
                  Saya ingin langsung ke konsultan / satgas
                </button>
              </div>
            </motion.div>
          )}

          {flowState === "waiting" && (
            <motion.div
              key="waiting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full max-w-md text-center"
            >
              <h1 className="text-2xl font-bold text-[#1B4F72] mb-12">Kami sedang menghubungkanmu...</h1>
              
              <div className="relative w-40 h-40 mx-auto mb-12">
                <div className="absolute inset-0 bg-[#5B8A6F]/20 rounded-full animate-breathing"></div>
                <div className="absolute inset-4 bg-[#5B8A6F]/40 rounded-full animate-breathing" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute inset-8 bg-[#5B8A6F] rounded-full flex items-center justify-center">
                  <Heart className="w-10 h-10 text-white animate-pulse" />
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.p
                  key={waitTextIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-lg text-gray-700 font-medium h-14 flex items-center justify-center"
                >
                  {waitTexts[waitTextIndex]}
                </motion.p>
              </AnimatePresence>

              <p className="text-sm text-gray-400 mt-4">
                Biasanya terhubung dalam 2-5 menit
              </p>

              <style dangerouslySetInnerHTML={{__html: `
                @keyframes breathing {
                  0% { transform: scale(0.9); opacity: 0.5; }
                  50% { transform: scale(1.1); opacity: 0.8; }
                  100% { transform: scale(0.9); opacity: 0.5; }
                }
                .animate-breathing {
                  animation: breathing 3s ease-in-out infinite;
                }
              `}} />
            </motion.div>
          )}

          {flowState === "path_selection" && (
            <motion.div
              key="path_selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full"
            >
              <div className="text-center mb-12">
                <h1 className="text-3xl md:text-4xl font-bold text-[#1B4F72] mb-4">{t("title")}</h1>
                <p className="text-gray-500 text-lg">{t("subtitle")}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 w-full mb-8">
                <button
                  onClick={() => handleSelectPath("anonymous")}
                  className="bg-white p-8 rounded-2xl shadow-sm border border-[#E7E9EB] hover:shadow-md hover:border-[#4A90B8] transition-all text-left group"
                >
                  <div className="bg-[#F0F7FC] w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Shield className="w-8 h-8 text-[#4A90B8]" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#1B4F72] mb-3">{t("anonymous_title")}</h2>
                  <p className="text-gray-500 leading-relaxed">{t("anonymous_desc")}</p>
                </button>

                <button
                  onClick={() => handleSelectPath("identified")}
                  className="bg-white p-8 rounded-2xl shadow-sm border border-[#E7E9EB] hover:shadow-md hover:border-[#4A90B8] transition-all text-left group"
                >
                  <div className="bg-[#F0F7FC] w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <User className="w-8 h-8 text-[#4A90B8]" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#1B4F72] mb-3">{t("identified_title")}</h2>
                  <p className="text-gray-500 leading-relaxed">{t("identified_desc")}</p>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {flowState === "assessment" && (
        <div className="absolute bottom-6 left-6 z-50">
          <button 
            onClick={() => router.push("/id")}
            className="text-gray-400 hover:text-gray-600 font-medium transition-colors"
          >
            Istirahat Dulu
          </button>
        </div>
      )}
    </div>
  );
}
