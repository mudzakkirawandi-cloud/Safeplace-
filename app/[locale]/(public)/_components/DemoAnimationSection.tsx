"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Globe, Shield, PenLine, CheckCircle2, Check, MousePointer2 } from "lucide-react";

export default function DemoAnimationSection() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { title: "Cari SafePlace", icon: Search },
    { title: "Buka Beranda", icon: Globe },
    { title: "Pilih Jalur", icon: Shield },
    { title: "Isi Form", icon: PenLine },
    { title: "Selesai!", icon: CheckCircle2 },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [steps.length]);

  // Framer motion variants
  const fade = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 }
  };

  const cursorVariants = {
    step2: {
      initial: { x: 150, y: 150 },
      animate: { x: 0, y: 30, transition: { delay: 0.5, duration: 1, ease: "easeInOut" } }
    },
    step3: {
      initial: { x: 0, y: 100 },
      animate: { x: -80, y: 10, transition: { delay: 0.5, duration: 1, ease: "easeInOut" } }
    },
    step4: {
      initial: { x: 100, y: 100 },
      animate: { x: 0, y: -20, transition: { delay: 0.5, duration: 1, ease: "easeInOut" } }
    }
  };

  return (
    <section className="py-24 bg-[#F0F7FC]">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-display font-bold text-[#1B4F72] mb-4">
            Lihat Bagaimana SafePlace Bekerja
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Pelaporan yang aman, mudah, dan terjamin kerahasiaannya.
          </p>
        </div>

        <div className="flex flex-col items-center gap-10">
          {/* Browser Mockup */}
          <div className="w-full max-w-[600px] h-[350px] bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 flex flex-col relative">
            {/* Browser Header */}
            <div className="bg-slate-100 px-4 py-3 flex items-center gap-4 border-b border-slate-200">
              <div className="flex gap-1.5 shrink-0">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="flex-1 max-w-sm mx-auto bg-white px-3 py-1.5 rounded-md text-xs text-slate-500 font-medium flex items-center gap-2 border border-slate-200">
                <Shield size={12} className="text-[#1B4F72]" /> 
                <AnimatePresence mode="wait">
                  {currentStep === 0 ? (
                    <motion.span
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1.5, ease: "linear" }}
                      className="overflow-hidden whitespace-nowrap inline-block align-bottom"
                    >
                      safeplace.id
                    </motion.span>
                  ) : (
                    <span>safeplace.id</span>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Browser Content */}
            <div className="flex-1 relative bg-white overflow-hidden">
              <AnimatePresence mode="wait">
                
                {/* STEP 1: Browser Search Loading */}
                {currentStep === 0 && (
                  <motion.div key="step1" {...fade} className="absolute inset-0 flex flex-col items-center justify-center bg-white">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "200px" }}
                      transition={{ delay: 1.8, duration: 1 }}
                      className="h-1 bg-[#1B4F72] absolute top-0 left-0"
                    />
                    <Search className="w-8 h-8 text-slate-300 animate-pulse" />
                  </motion.div>
                )}

                {/* STEP 2: Homepage */}
                {currentStep === 1 && (
                  <motion.div key="step2" {...fade} className="absolute inset-0 flex flex-col bg-white">
                    <div className="h-12 border-b border-slate-100 flex items-center px-6">
                      <span className="font-bold text-[#1B4F72] text-sm tracking-wider">SAFEPLACE</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                      <h3 className="text-2xl font-bold text-[#1B4F72] mb-3">A Safe Space to Speak Up</h3>
                      <div className="w-3/4 h-2 bg-slate-100 rounded mb-6 mx-auto"></div>
                      <div className="w-1/2 h-2 bg-slate-100 rounded mb-8 mx-auto"></div>
                      
                      <motion.button 
                        animate={{ scale: [1, 1, 1.05, 1] }}
                        transition={{ duration: 0.5, delay: 1.6 }}
                        className="bg-[#E8543A] text-white px-6 py-2.5 rounded-lg text-sm font-semibold relative overflow-hidden"
                      >
                        Start Reporting Now
                        <motion.div 
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 4, opacity: [0, 0.5, 0] }}
                          transition={{ duration: 0.6, delay: 1.6 }}
                          className="absolute inset-0 bg-white rounded-full opacity-0 pointer-events-none origin-center"
                        />
                      </motion.button>
                    </div>

                    <motion.div 
                      variants={cursorVariants.step2}
                      initial="initial"
                      animate="animate"
                      className="absolute top-1/2 left-1/2 ml-10 z-50 pointer-events-none"
                    >
                      <MousePointer2 className="w-6 h-6 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] fill-slate-800" />
                    </motion.div>
                  </motion.div>
                )}

                {/* STEP 3: Pilih Jalur */}
                {currentStep === 2 && (
                  <motion.div key="step3" {...fade} className="absolute inset-0 flex flex-col items-center justify-center bg-[#F0F7FC] p-6">
                    <h3 className="text-xl font-bold text-[#1B4F72] mb-6">Pilih Jalur Pelaporan</h3>
                    <div className="flex gap-4 w-full max-w-md">
                      <motion.div 
                        animate={{ backgroundColor: ["#ffffff", "#f8fafc", "#e0f2fe", "#ffffff"] }}
                        transition={{ duration: 0.5, delay: 1.6 }}
                        className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-slate-200 text-center relative overflow-hidden"
                      >
                        <div className="w-10 h-10 bg-slate-100 rounded-full mx-auto mb-3"></div>
                        <p className="font-semibold text-slate-800 text-sm">Lapor Anonim</p>
                        <motion.div 
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 4, opacity: [0, 0.2, 0] }}
                          transition={{ duration: 0.6, delay: 1.6 }}
                          className="absolute inset-0 bg-black rounded-full opacity-0 pointer-events-none origin-center"
                        />
                      </motion.div>
                      <div className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-slate-200 text-center">
                        <div className="w-10 h-10 bg-slate-100 rounded-full mx-auto mb-3"></div>
                        <p className="font-semibold text-slate-800 text-sm">Lapor dengan Akun</p>
                      </div>
                    </div>

                    <motion.div 
                      variants={cursorVariants.step3}
                      initial="initial"
                      animate="animate"
                      className="absolute top-1/2 left-1/2 z-50 pointer-events-none"
                    >
                      <MousePointer2 className="w-6 h-6 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] fill-slate-800" />
                    </motion.div>
                  </motion.div>
                )}

                {/* STEP 4: Form Pelaporan */}
                {currentStep === 3 && (
                  <motion.div key="step4" {...fade} className="absolute inset-0 flex flex-col items-center justify-center bg-[#F0F7FC] p-6">
                    <div className="w-full max-w-sm bg-white rounded-xl shadow-sm p-5 border border-slate-200">
                      <div className="h-4 w-32 bg-slate-200 rounded mb-4"></div>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="h-2 w-24 bg-slate-100 rounded mb-1"></div>
                          <motion.div 
                            animate={{ borderColor: ["#e2e8f0", "#1B4F72", "#e2e8f0"] }}
                            transition={{ duration: 0.5, delay: 1.6 }}
                            className="h-8 w-full border border-slate-200 rounded flex items-center px-2 relative"
                          >
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 1.7 }}
                              className="h-2 w-20 bg-slate-600 rounded"
                            />
                            <motion.div 
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 4, opacity: [0, 0.2, 0] }}
                              transition={{ duration: 0.6, delay: 1.6 }}
                              className="absolute right-4 w-2 h-2 bg-black rounded-full opacity-0 pointer-events-none"
                            />
                          </motion.div>
                        </div>
                        <div>
                          <div className="h-2 w-20 bg-slate-100 rounded mb-1"></div>
                          <div className="h-8 w-full border border-slate-200 rounded flex items-center px-2">
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 2.0 }}
                              className="h-2 w-24 bg-slate-400 rounded"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <motion.div 
                      variants={cursorVariants.step4}
                      initial="initial"
                      animate="animate"
                      className="absolute top-1/2 left-1/2 z-50 pointer-events-none"
                    >
                      <MousePointer2 className="w-6 h-6 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] fill-slate-800" />
                    </motion.div>
                  </motion.div>
                )}

                {/* STEP 5: Selesai */}
                {currentStep === 4 && (
                  <motion.div key="step5" {...fade} className="absolute inset-0 flex flex-col items-center justify-center bg-white p-6 text-center">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4"
                    >
                      <Check className="w-8 h-8 text-green-600" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Laporan berhasil dikirim</h3>
                    <p className="text-sm text-slate-500">Identitasmu terjaga sepenuhnya</p>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </div>

          {/* Step Indicators */}
          <div className="flex gap-4 sm:gap-8 justify-center mt-4">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <div 
                  className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                    currentStep === index ? "bg-[#1B4F72]" : "bg-slate-300"
                  }`}
                />
                <span className={`text-[10px] sm:text-xs font-semibold transition-colors duration-300 ${
                    currentStep === index ? "text-[#1B4F72]" : "text-slate-400"
                  }`}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
          
        </div>
      </div>
    </section>
  );
}
