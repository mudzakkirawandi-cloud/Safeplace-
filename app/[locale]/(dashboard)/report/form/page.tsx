"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useReportContext } from "../../../_contexts/ReportContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Save, ShieldAlert, UploadCloud } from "lucide-react";

const formSchema = z.object({
  incidentType: z.string().optional(),
  incidentDate: z.string().optional(),
  isOngoing: z.boolean().default(false),
  locationDetail: z.string().optional(),
  campus: z.string().optional(),
  relationship: z.string().optional(),
  safety: z.string().optional(),
  description: z.string().optional(),
  attachments: z.any().optional(),
  consent: z.boolean().default(false)
});

type FormValues = z.infer<typeof formSchema>;

export default function ReportFormPage() {
  const t = useTranslations("report.form");
  const router = useRouter();
  const { state, setFormData } = useReportContext();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  const { register, handleSubmit, watch } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: state.formData as FormValues
  });

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(s => s + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(s => s - 1);
    else router.push("/report/intent");
  };

  const onSubmit = (data: FormValues) => {
    setFormData(data);
    router.push("/report/confirmation");
  };

  const handleSaveDraft = () => {
    setFormData(watch());
    alert("Draft disimpan lokal.");
  };

  const safetyValue = watch("safety");

  const slideVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <main className="flex-1 flex flex-col items-center p-6 container mx-auto max-w-3xl py-10">
      <div className="w-full mb-8">
        <div className="flex justify-between text-sm font-medium text-[#1B4F72] mb-2">
          <span>Langkah {currentStep} dari {totalSteps}</span>
          <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <motion.div 
            className="bg-[#4A90B8] h-2.5 rounded-full"
            initial={{ width: `${((currentStep - 1) / totalSteps) * 100}%` }}
            animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 relative overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div key="step1" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="min-h-[300px]">
                <h2 className="text-2xl font-bold text-[#1B4F72] mb-6">{t("step1.title")}</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t("step1.incident_type")}</label>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {(['verbal', 'physical', 'sexual', 'digital', 'other'] as const).map(type => (
                        <label key={type} className="flex items-center p-4 border rounded-xl cursor-pointer hover:bg-blue-50 hover:border-[#4A90B8] transition-colors has-[:checked]:border-[#4A90B8] has-[:checked]:bg-blue-50">
                          <input type="radio" value={type} {...register("incidentType")} className="w-4 h-4 text-[#4A90B8] focus:ring-[#4A90B8]" />
                          <span className="ml-3 text-gray-700">{t(`step1.types.${type}`)}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t("step1.date")}</label>
                    <input type="date" {...register("incidentDate")} className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-[#4A90B8] focus:border-transparent outline-none" />
                  </div>

                  <label className="flex items-center p-4 border rounded-xl cursor-pointer hover:bg-blue-50 transition-colors has-[:checked]:border-[#4A90B8] has-[:checked]:bg-blue-50">
                    <input type="checkbox" {...register("isOngoing")} className="w-5 h-5 text-[#4A90B8] rounded focus:ring-[#4A90B8]" />
                    <span className="ml-3 font-medium text-gray-700">{t("step1.is_ongoing")}</span>
                  </label>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div key="step2" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="min-h-[300px]">
                <h2 className="text-2xl font-bold text-[#1B4F72] mb-6">{t("step2.title")}</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t("step2.campus")}</label>
                    <select {...register("campus")} className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-[#4A90B8] focus:border-transparent bg-white outline-none">
                      <option value="">-- Pilih Kampus --</option>
                      <option value="kampus_a">Universitas A</option>
                      <option value="kampus_b">Universitas B</option>
                      <option value="outside">{t("step2.out_of_campus")}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t("step2.location_detail")}</label>
                    <input type="text" {...register("locationDetail")} placeholder="Contoh: Gedung Rektorat Lantai 2" className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-[#4A90B8] focus:border-transparent outline-none" />
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div key="step3" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="min-h-[300px]">
                <h2 className="text-2xl font-bold text-[#1B4F72] mb-6">{t("step3.title")}</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t("step3.relationship")}</label>
                    <select {...register("relationship")} className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-[#4A90B8] focus:border-transparent bg-white outline-none">
                      <option value="">-- Pilih Hubungan --</option>
                      <option value="dosen">Dosen/Staf Kampus</option>
                      <option value="mahasiswa">Sesama Mahasiswa</option>
                      <option value="teman">Teman</option>
                      <option value="keluarga">Keluarga</option>
                      <option value="tidak_kenal">Orang Tidak Dikenal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t("step3.safety")}</label>
                    <div className="grid sm:grid-cols-3 gap-3">
                      {(['yes', 'no', 'unknown'] as const).map(opt => (
                        <label key={opt} className="flex items-center justify-center p-4 border rounded-xl cursor-pointer hover:bg-blue-50 transition-colors has-[:checked]:border-[#4A90B8] has-[:checked]:bg-blue-50">
                          <input type="radio" value={opt} {...register("safety")} className="w-4 h-4 text-[#4A90B8] focus:ring-[#4A90B8] mr-2" />
                          <span className="font-medium text-gray-700">{t(`step3.safety_${opt}`)}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {safetyValue === 'no' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-[#FDEDEC] text-[#C0392B] p-4 rounded-xl border border-[#FADBD8] flex gap-3 items-start overflow-hidden">
                      <ShieldAlert className="w-6 h-6 flex-shrink-0" />
                      <p className="font-medium">{t("step3.emergency_warning")}</p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div key="step4" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="min-h-[300px]">
                <h2 className="text-2xl font-bold text-[#1B4F72] mb-6">{t("step4.title")}</h2>
                
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <label className="block text-sm font-medium text-gray-700">{t("step4.description")}</label>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{t("step4.optional_label")}</span>
                  </div>
                  <textarea 
                    {...register("description")} 
                    rows={8}
                    placeholder={t("step4.desc_placeholder")}
                    className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-[#4A90B8] focus:border-transparent outline-none resize-none" 
                  />
                  <div className="text-right text-sm text-gray-500 mt-1">
                    {watch("description")?.length || 0} karakter
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 5 && (
              <motion.div key="step5" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="min-h-[300px]">
                <h2 className="text-2xl font-bold text-[#1B4F72] mb-6">{t("step5.title")}</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-end mb-2">
                    <label className="block text-sm font-medium text-gray-700">{t("step5.upload_label")}</label>
                  </div>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors">
                    <UploadCloud className="w-12 h-12 text-gray-400 mb-4" />
                    <p className="text-gray-600 font-medium mb-1">Pilih file atau tarik ke sini</p>
                    <p className="text-sm text-gray-500 mb-4">{t("step5.upload_desc")}</p>
                    <input type="file" multiple {...register("attachments")} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-[#4A90B8] hover:file:bg-blue-100" />
                  </div>

                  <p className="text-sm text-gray-500 flex items-center gap-2 mt-4">
                    <ShieldAlert className="w-4 h-4 text-green-600" />
                    {t("step5.encryption_note")}
                  </p>
                </div>
              </motion.div>
            )}

            {currentStep === 6 && (
              <motion.div key="step6" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="min-h-[300px]">
                <h2 className="text-2xl font-bold text-[#1B4F72] mb-2">{t("step6.title")}</h2>
                <p className="text-gray-600 mb-6">{t("step6.review_desc")}</p>
                
                <div className="bg-gray-50 p-6 rounded-xl border mb-6 space-y-4 text-sm">
                  <div className="grid grid-cols-3">
                    <span className="text-gray-500 font-medium">Jenis Kejadian</span>
                    <span className="col-span-2 text-gray-900">{watch("incidentType") || "-"}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-gray-500 font-medium">Tanggal</span>
                    <span className="col-span-2 text-gray-900">{watch("incidentDate") || "-"}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-gray-500 font-medium">Kampus</span>
                    <span className="col-span-2 text-gray-900">{watch("campus") || "-"}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-gray-500 font-medium">Kondisi Keamanan</span>
                    <span className="col-span-2 text-gray-900">{watch("safety") === 'no' ? 'Tidak Aman' : (watch("safety") === 'yes' ? 'Aman' : 'Tidak Tahu')}</span>
                  </div>
                </div>

                <label className="flex items-start p-4 bg-[#EBF5FB] border border-[#4A90B8] rounded-xl cursor-pointer">
                  <input type="checkbox" {...register("consent")} className="w-5 h-5 text-[#4A90B8] rounded mt-0.5 focus:ring-[#4A90B8]" />
                  <span className="ml-3 text-[#1B4F72] text-sm font-medium">{t("step6.consent")}</span>
                </label>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col sm:flex-row justify-between items-center mt-10 pt-6 border-t border-gray-100 gap-4">
            <button
              type="button"
              onClick={prevStep}
              className="flex items-center justify-center gap-2 px-6 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors w-full sm:w-auto"
            >
              <ArrowLeft className="w-5 h-5" />
              {t("prev_btn")}
            </button>

            <div className="flex gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="flex items-center justify-center gap-2 px-6 py-3 text-[#4A90B8] font-medium bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors w-full sm:w-auto"
              >
                <Save className="w-5 h-5" />
                <span className="hidden sm:inline">{t("save_draft_btn")}</span>
              </button>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center justify-center gap-2 px-8 py-3 bg-[#1B4F72] hover:bg-[#123650] text-white font-medium rounded-xl transition-colors shadow-md w-full sm:w-auto"
                >
                  {t("next_btn")}
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!watch("consent")}
                  className="flex items-center justify-center gap-2 px-8 py-3 bg-[#E74C3C] hover:bg-[#c0392b] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors shadow-md w-full sm:w-auto"
                >
                  {t("submit_btn")}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
