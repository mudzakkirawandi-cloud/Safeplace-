"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Globe, Shield, PenLine, CheckCircle2 } from "lucide-react";

export default function DemoAnimationSection() {
  const t = useTranslations("homepage.demo");
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { title: t("step_1"), icon: Search },
    { title: t("step_2"), icon: Globe },
    { title: t("step_3"), icon: Shield },
    { title: t("step_4"), icon: PenLine },
    { title: t("step_5"), icon: CheckCircle2 },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <section className="py-24 bg-[#FAFBFF]">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-display font-bold text-[#1B4F72] mb-4">
            {t("title")}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Steps List */}
          <div className="w-full lg:w-1/3 flex flex-col gap-4">
            {steps.map((step, index) => (
              <div 
                key={index}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                  currentStep === index 
                    ? "bg-white shadow-md border-l-4 border-[#1B4F72] transform scale-105" 
                    : "opacity-50 grayscale hover:grayscale-0 hover:opacity-100 cursor-pointer"
                }`}
                onClick={() => setCurrentStep(index)}
              >
                <div className={`p-2 rounded-lg ${currentStep === index ? "bg-[#1B4F72]/10 text-[#1B4F72]" : "bg-gray-100 text-gray-500"}`}>
                  <step.icon size={24} />
                </div>
                <span className={`font-semibold ${currentStep === index ? "text-[#1B4F72]" : "text-gray-500"}`}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>

          {/* Browser Mockup */}
          <div className="w-full lg:w-2/3">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              {/* Browser Header */}
              <div className="bg-gray-100 px-4 py-3 flex items-center gap-2 border-b border-gray-200">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="mx-auto bg-white px-4 py-1 rounded-md text-xs text-gray-400 font-medium w-1/2 text-center flex items-center justify-center gap-2">
                  <Shield size={12} className="text-[#4A90B8]" /> safeplace.id
                </div>
              </div>

              {/* Browser Content */}
              <div className="relative h-[400px] bg-gray-50 p-6 overflow-hidden flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {currentStep === 0 && (
                    <motion.div
                      key="step0"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="w-full max-w-sm bg-white p-4 rounded-full shadow-sm border border-gray-200 flex items-center gap-3"
                    >
                      <Search size={20} className="text-gray-400" />
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: "100%" }} 
                        transition={{ duration: 1.5, ease: "linear" }}
                        className="overflow-hidden whitespace-nowrap text-gray-700 font-medium"
                      >
                        SafePlace
                      </motion.div>
                    </motion.div>
                  )}

                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.05 }}
                      className="w-full h-full flex flex-col"
                    >
                      <div className="h-12 bg-white flex items-center px-6 shadow-sm mb-6 rounded-xl">
                        <div className="w-8 h-8 bg-[#1B4F72] rounded-lg mr-4"></div>
                        <div className="flex-1 flex gap-4">
                          <div className="w-16 h-3 bg-gray-200 rounded"></div>
                          <div className="w-16 h-3 bg-gray-200 rounded"></div>
                          <div className="w-16 h-3 bg-gray-200 rounded"></div>
                        </div>
                        <div className="w-24 h-8 bg-[#E74C3C] rounded-lg"></div>
                      </div>
                      <div className="flex-1 bg-white rounded-xl shadow-sm p-8 flex flex-col items-center justify-center gap-6">
                        <div className="w-3/4 h-8 bg-gray-200 rounded-lg"></div>
                        <div className="w-1/2 h-4 bg-gray-100 rounded"></div>
                        <div className="w-32 h-10 bg-[#E74C3C] rounded-lg mt-4"></div>
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="relative w-full h-full bg-white rounded-xl shadow-sm p-8 flex flex-col items-center justify-center gap-6"
                    >
                      <div className="w-3/4 h-8 bg-gray-200 rounded-lg"></div>
                      <div className="w-1/2 h-4 bg-gray-100 rounded"></div>
                      <div className="relative">
                        <div className="w-32 h-10 bg-[#E74C3C] rounded-lg mt-4"></div>
                        <motion.div 
                          initial={{ top: 100, left: 100 }}
                          animate={{ top: 10, left: 64 }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="absolute w-6 h-6 z-10"
                        >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5.5 3.21V20.8C5.5 21.46 6.22 21.87 6.78 21.52L11.83 18.36C12.06 18.22 12.33 18.15 12.61 18.17L18.42 18.57C19.08 18.62 19.58 18.06 19.46 17.41L16.29 4.38C16.14 3.75 15.42 3.44 14.86 3.78L6.46 8.84C5.87 9.2 5.5 9.85 5.5 10.54V3.21Z" fill="#1B4F72" stroke="white" strokeWidth="2"/>
                          </svg>
                        </motion.div>
                        <motion.div 
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 2, opacity: [0, 0.5, 0] }}
                          transition={{ duration: 0.5, delay: 1.5 }}
                          className="absolute top-5 left-[64px] w-6 h-6 bg-[#1B4F72] rounded-full -ml-3 -mt-3"
                        ></motion.div>
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="w-full h-full flex items-center justify-center gap-6"
                    >
                      <div className="w-40 h-48 bg-white rounded-xl shadow-md border-2 border-transparent p-6 flex flex-col items-center justify-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-full"></div>
                        <div className="w-24 h-4 bg-gray-200 rounded"></div>
                        <div className="w-20 h-8 bg-gray-100 rounded mt-2"></div>
                      </div>
                      <motion.div 
                        initial={{ borderColor: "transparent" }}
                        animate={{ borderColor: "#4A90B8" }}
                        className="w-40 h-48 bg-white rounded-xl shadow-md border-2 p-6 flex flex-col items-center justify-center gap-4 relative"
                      >
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-3 -right-3 w-6 h-6 bg-[#4A90B8] rounded-full border-2 border-white"
                        ></motion.div>
                        <div className="w-12 h-12 bg-blue-50 rounded-full"></div>
                        <div className="w-24 h-4 bg-gray-200 rounded"></div>
                        <div className="w-20 h-8 bg-gray-100 rounded mt-2"></div>
                      </motion.div>
                    </motion.div>
                  )}

                  {currentStep === 4 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.05 }}
                      className="w-full h-full bg-white rounded-xl shadow-sm p-8 flex flex-col items-center justify-center"
                    >
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 10 }}
                        className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6"
                      >
                        <CheckCircle2 size={40} className="text-green-500" />
                      </motion.div>
                      <div className="w-48 h-6 bg-gray-200 rounded mb-4"></div>
                      <div className="w-32 h-4 bg-gray-100 rounded"></div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
