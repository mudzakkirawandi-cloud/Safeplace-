"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useReportContext } from "../../../_contexts/ReportContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, ArrowRight, ShieldAlert, UploadCloud, 
  Phone, Mic, Square, RotateCcw, Check, HeartHandshake, ShieldCheck
} from "lucide-react";

const formSchema = z.object({
  incidentType: z.string().optional(),
  incidentDate: z.string().optional(),
  isOngoing: z.boolean().optional(),
  locationDetail: z.string().optional(),
  campus: z.string().optional(),
  relationship: z.string().optional(),
  safety: z.string().optional(),
  description: z.string().optional(),
  attachments: z.any().optional(),
  consent: z.boolean().optional()
});

type FormValues = z.infer<typeof formSchema>;

export default function ReportFormPage() {
  const router = useRouter();
  const { state } = useReportContext();
  const supabase = createClient();

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [trackingCode, setTrackingCode] = useState("");
  const [hasDraft, setHasDraft] = useState(false);

  const { register, handleSubmit, watch, reset, getValues } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: state.formData as FormValues
  });

  const formData = watch();
  
  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Load Draft
  useEffect(() => {
    const draft = localStorage.getItem("safeplace_report_draft");
    if (draft) {
      setHasDraft(true);
    }
  }, []);

  const loadDraft = () => {
    const draft = localStorage.getItem("safeplace_report_draft");
    if (draft) {
      reset(JSON.parse(draft));
    }
    setHasDraft(false);
  };

  const clearDraft = () => {
    localStorage.removeItem("safeplace_report_draft");
    setHasDraft(false);
  };

  // Auto-save every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isSubmitted) {
        localStorage.setItem("safeplace_report_draft", JSON.stringify(getValues()));
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [getValues, isSubmitted]);

  // Handle Audio Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioUrl(audioUrl);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Gagal akses mikrofon", err);
      alert("Tidak dapat mengakses mikrofon. Pastikan Anda telah memberikan izin.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const resetRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(s => s + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(s => s - 1);
    else router.push("/report/start");
  };

  const skipStep = () => {
    if (currentStep < totalSteps) setCurrentStep(s => s + 1);
  };

  const handleSaveDraft = () => {
    localStorage.setItem("safeplace_report_draft", JSON.stringify(getValues()));
    alert("Draft berhasil disimpan!");
  };

  const onSubmit = async (data: FormValues) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      // For anonymous reports without user, we might need a different handling or it creates an anonymous session.
      // Assuming middleware or context ensures a valid user session (anonymous or identified)
      if (userError || !user) throw new Error("Not authenticated");

      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let tCode = '';
      for (let i = 0; i < 8; i++) {
        tCode += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      let incidentTypeEnum = 'other';
      if (['verbal_harassment', 'physical_harassment', 'sexual_violence', 'digital_violence', 'other'].includes(data.incidentType as string)) {
         incidentTypeEnum = data.incidentType as string;
      } else if (data.incidentType === 'verbal') incidentTypeEnum = 'verbal_harassment';
      else if (data.incidentType === 'physical') incidentTypeEnum = 'physical_harassment';
      else if (data.incidentType === 'sexual') incidentTypeEnum = 'sexual_violence';
      else if (data.incidentType === 'digital') incidentTypeEnum = 'digital_violence';

      // Audio Upload if exists
      let audioPath = null;
      if (audioBlob) {
        const fileName = `${user.id}/${tCode}-audio.webm`;
        const { error: uploadError } = await supabase.storage
          .from('report-attachments')
          .upload(fileName, audioBlob);
        if (!uploadError) {
          audioPath = fileName;
        }
      }

      const { data: newReport, error: insertError } = await supabase.from('reports').insert({
        tracking_code: tCode,
        reporter_id: user.id,
        incident_type: incidentTypeEnum,
        description: data.description || '',
      }).select().single();

      if (insertError) {
        console.error("Error inserting report:", insertError);
        alert("Gagal mengirim laporan. " + insertError.message);
        setIsSubmitting(false);
        return;
      }

      if (audioPath && newReport) {
        const { error: attachmentError } = await supabase.from('report_attachments').insert({
          report_id: newReport.id,
          file_url: audioPath,
          file_type: 'audio/webm'
        });
        if (attachmentError) {
          console.error("Gagal melampirkan file audio:", attachmentError);
        }
      }

      setTrackingCode(tCode);
      setIsSubmitted(true);
      localStorage.removeItem("safeplace_report_draft");

    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan sistem.");
      setIsSubmitting(false);
    }
  };

  const slideVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  // Type labels for display
  const getTypeLabel = (val?: string) => {
    switch (val) {
      case 'verbal': return "Pelecehan Verbal";
      case 'physical': return "Pelecehan Fisik";
      case 'sexual': return "Kekerasan Seksual";
      case 'digital': return "Kekerasan Digital";
      case 'other': return "Lainnya";
      default: return "Sesuatu";
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#F4FAF8] flex items-center justify-center p-6">
        <div className="absolute top-4 right-4 z-50">
          <button onClick={() => router.push("/report/resources")} className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-full font-medium shadow-sm border border-red-100 flex items-center gap-2 transition-colors">
            <Phone className="w-4 h-4" /> Darurat
          </button>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-[680px] bg-white rounded-3xl shadow-sm border border-[#E7E9EB] p-10 text-center"
        >
          <div className="w-24 h-24 bg-[#EAF3EE] rounded-full flex items-center justify-center mx-auto mb-6">
            <HeartHandshake className="w-12 h-12 text-[#1B4F72]" />
          </div>
          <h1 className="text-4xl font-bold text-[#1B4F72] mb-3">Kamu sudah berani.</h1>
          <p className="text-gray-500 text-lg mb-8">Laporanmu telah kami terima dengan aman.</p>
          
          <div className="bg-[#F4FAF8] border border-[#D1E0D9] p-6 rounded-2xl inline-block mb-8 min-w-[200px]">
            <p className="text-sm text-gray-500 mb-2">Kode Tracking Laporan</p>
            <p className="text-3xl font-mono font-bold text-[#1B4F72] tracking-wider">{trackingCode}</p>
          </div>

          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Peer consultant akan menghubungimu segera. Biasanya dalam 2-5 menit jika ada yang online.
          </p>

          <div className="flex flex-col items-center gap-4">
            <button onClick={() => router.push("/report/dashboard")} className="w-full sm:w-auto bg-[#1B4F72] text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-[#123650] transition-colors shadow-md">
              Lihat status laporan saya
            </button>
            <button onClick={() => router.push("/")} className="text-sm text-gray-400 hover:text-gray-700 transition-colors">
              Kembali ke beranda
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4FAF8] flex flex-col relative overflow-hidden -m-6 rounded-xl">
      <div className="absolute top-4 right-4 z-50">
        <button onClick={() => router.push("/report/resources")} className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-full font-medium shadow-sm border border-red-100 flex items-center gap-2 transition-colors">
          <Phone className="w-4 h-4" />
          Darurat
        </button>
      </div>

      <main className="flex-1 flex flex-col items-center p-6 container mx-auto max-w-[680px] py-16 relative z-10">
        
        {hasDraft && (
          <div className="w-full bg-blue-50 border border-blue-200 text-blue-800 px-6 py-4 rounded-2xl mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="font-medium text-sm">Kamu punya laporan yang belum selesai. Lanjutkan?</p>
            <div className="flex gap-3">
              <button onClick={clearDraft} className="text-sm font-semibold hover:text-blue-900">Mulai dari awal</button>
              <button onClick={loadDraft} className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700">Lanjutkan</button>
            </div>
          </div>
        )}

        {/* Progress Indicator */}
        <div className="w-full flex items-center justify-between mb-8 px-4">
          <div className="flex gap-2">
            {[...Array(totalSteps)].map((_, idx) => (
              <div key={idx} className={`h-2 rounded-full transition-all duration-300 ${idx + 1 === currentStep ? "w-8 bg-[#1B4F72]" : idx + 1 < currentStep ? "w-2 bg-[#5B8A6F]" : "w-2 bg-[#D1E0D9]"}`} />
            ))}
          </div>
          <span className="text-sm font-semibold text-[#1B4F72]">Langkah {currentStep} dari {totalSteps}</span>
        </div>

        {/* Form Card */}
        <div className="w-full bg-white rounded-3xl shadow-sm border border-[#E7E9EB] p-8 md:p-10 relative overflow-hidden min-h-[500px] flex flex-col">
          <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col">
            <AnimatePresence mode="wait">
              
              {/* STEP 1: Jenis Kejadian */}
              {currentStep === 1 && (
                <motion.div key="step1" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="flex-1">
                  <h2 className="text-[24px] font-bold text-[#1B4F72] mb-1">Apa yang kamu alami?</h2>
                  <p className="text-sm text-gray-400 mb-8">Pilih yang paling mendekati — tidak harus sempurna</p>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-3">
                      <label className="relative cursor-pointer group">
                        <input type="radio" value="verbal" {...register("incidentType")} className="peer sr-only" />
                        <div className="h-full p-4 border border-[#E7E9EB] rounded-2xl peer-checked:border-[#1B4F72] peer-checked:bg-[#F0FAF6] hover:bg-gray-50 transition-all text-center">
                          <div className="text-2xl mb-2">🗣️</div>
                          <div className="text-sm font-medium text-gray-700 peer-checked:text-[#1B4F72]">Pelecehan Verbal</div>
                        </div>
                      </label>
                      <label className="relative cursor-pointer group">
                        <input type="radio" value="physical" {...register("incidentType")} className="peer sr-only" />
                        <div className="h-full p-4 border border-[#E7E9EB] rounded-2xl peer-checked:border-[#1B4F72] peer-checked:bg-[#F0FAF6] hover:bg-gray-50 transition-all text-center">
                          <div className="text-2xl mb-2">👋</div>
                          <div className="text-sm font-medium text-gray-700 peer-checked:text-[#1B4F72]">Pelecehan Fisik</div>
                        </div>
                      </label>
                      <label className="relative cursor-pointer group">
                        <input type="radio" value="digital" {...register("incidentType")} className="peer sr-only" />
                        <div className="h-full p-4 border border-[#E7E9EB] rounded-2xl peer-checked:border-[#1B4F72] peer-checked:bg-[#F0FAF6] hover:bg-gray-50 transition-all text-center">
                          <div className="text-2xl mb-2">💻</div>
                          <div className="text-sm font-medium text-gray-700 peer-checked:text-[#1B4F72]">Kekerasan Digital</div>
                        </div>
                      </label>
                      <label className="relative cursor-pointer group">
                        <input type="radio" value="sexual" {...register("incidentType")} className="peer sr-only" />
                        <div className="h-full p-4 border border-[#E7E9EB] rounded-2xl peer-checked:border-[#1B4F72] peer-checked:bg-[#F0FAF6] hover:bg-gray-50 transition-all text-center">
                          <div className="text-2xl mb-2">❤️</div>
                          <div className="text-sm font-medium text-gray-700 peer-checked:text-[#1B4F72]">Kekerasan Seksual</div>
                        </div>
                      </label>
                      <label className="relative cursor-pointer group col-span-2">
                        <input type="radio" value="other" {...register("incidentType")} className="peer sr-only" />
                        <div className="w-full p-4 border border-[#E7E9EB] rounded-2xl peer-checked:border-[#1B4F72] peer-checked:bg-[#F0FAF6] hover:bg-gray-50 transition-all text-center flex items-center justify-center gap-2">
                          <div className="text-xl">📝</div>
                          <div className="text-sm font-medium text-gray-700 peer-checked:text-[#1B4F72]">Lainnya</div>
                        </div>
                      </label>
                    </div>

                    <div className="pt-4 border-t border-[#E7E9EB]">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Kapan ini terjadi?</label>
                      <input type="date" {...register("incidentDate")} className="w-full p-4 border border-[#E7E9EB] rounded-2xl focus:ring-2 focus:ring-[#1B4F72]/20 focus:border-[#1B4F72] outline-none transition-all text-gray-700" />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                      <span className="font-medium text-gray-700 text-sm">Apakah kejadian ini masih berlangsung?</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" {...register("isOngoing")} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1B4F72]"></div>
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Lokasi */}
              {currentStep === 2 && (
                <motion.div key="step2" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="flex-1">
                  <h2 className="text-[24px] font-bold text-[#1B4F72] mb-1">Di kampus mana ini terjadi?</h2>
                  <p className="text-sm text-gray-400 mb-8">Kamu tidak harus menyebut nama tempat secara spesifik</p>
                  
                  <div className="space-y-6">
                    <div className="flex flex-col gap-3">
                      <label className="relative cursor-pointer group w-full">
                        <input type="radio" value="dalam_kampus" {...register("campus")} className="peer sr-only" />
                        <div className="p-4 border border-[#E7E9EB] rounded-2xl peer-checked:border-[#1B4F72] peer-checked:bg-[#F0FAF6] hover:bg-gray-50 transition-all text-left flex gap-4 items-center">
                          <div className="text-2xl">🏫</div>
                          <div>
                            <div className="text-sm font-bold text-gray-800 peer-checked:text-[#1B4F72] mb-1">Di dalam kampus</div>
                            <div className="text-xs text-gray-500">Gedung kuliah, parkiran, kantin, dll</div>
                          </div>
                        </div>
                      </label>
                      <label className="relative cursor-pointer group w-full">
                        <input type="radio" value="luar_kampus" {...register("campus")} className="peer sr-only" />
                        <div className="p-4 border border-[#E7E9EB] rounded-2xl peer-checked:border-[#1B4F72] peer-checked:bg-[#F0FAF6] hover:bg-gray-50 transition-all text-left flex gap-4 items-center">
                          <div className="text-2xl">🌆</div>
                          <div>
                            <div className="text-sm font-bold text-gray-800 peer-checked:text-[#1B4F72] mb-1">Di luar kampus</div>
                            <div className="text-xs text-gray-500">Kos, mall, transportasi, dll</div>
                          </div>
                        </div>
                      </label>
                      <label className="relative cursor-pointer group w-full">
                        <input type="radio" value="lainnya" {...register("campus")} className="peer sr-only" />
                        <div className="p-4 border border-[#E7E9EB] rounded-2xl peer-checked:border-[#1B4F72] peer-checked:bg-[#F0FAF6] hover:bg-gray-50 transition-all text-left flex gap-4 items-center">
                          <div className="text-2xl">📝</div>
                          <div>
                            <div className="text-sm font-bold text-gray-800 peer-checked:text-[#1B4F72] mb-1">Lainnya</div>
                            <div className="text-xs text-gray-500">Situasi lain yang tidak tercantum</div>
                          </div>
                        </div>
                      </label>
                    </div>

                    <div className="pt-4 border-t border-[#E7E9EB]">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Ada detail lokasi yang ingin ditambahkan? (tidak wajib)</label>
                      <input type="text" {...register("locationDetail")} placeholder="Contoh: Parkiran belakang fakultas..." className="w-full p-4 border border-[#E7E9EB] rounded-2xl focus:ring-2 focus:ring-[#1B4F72]/20 focus:border-[#1B4F72] outline-none text-gray-700" />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Pelaku & Keamanan */}
              {currentStep === 3 && (
                <motion.div key="step3" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="flex-1">
                  <h2 className="text-[24px] font-bold text-[#1B4F72] mb-1">Siapa yang melakukan ini?</h2>
                  <p className="text-sm text-gray-400 mb-8">Informasi ini membantu kami memberikan pendampingan yang tepat</p>
                  
                  <div className="space-y-8">
                    <select {...register("relationship")} className="w-full p-4 border border-[#E7E9EB] rounded-2xl focus:ring-2 focus:ring-[#1B4F72]/20 focus:border-[#1B4F72] outline-none text-gray-700 font-medium">
                      <option value="">-- Hubungan dengan pelaku --</option>
                      <option value="dosen">Dosen / Staf Kampus</option>
                      <option value="mahasiswa">Sesama Mahasiswa</option>
                      <option value="teman">Teman / Kenalan</option>
                      <option value="keluarga">Keluarga</option>
                      <option value="tidak_kenal">Orang Tidak Dikenal</option>
                    </select>

                    <div className="pt-4 border-t border-[#E7E9EB]">
                      <label className="block text-sm font-semibold text-gray-700 mb-4">Apakah kamu merasa aman saat ini?</label>
                      <div className="grid grid-cols-3 gap-3">
                        <label className="cursor-pointer">
                          <input type="radio" value="yes" {...register("safety")} className="peer sr-only" />
                          <div className="p-4 border border-[#E7E9EB] rounded-2xl text-center peer-checked:border-green-500 peer-checked:bg-green-50 peer-checked:text-green-700 font-medium text-gray-600 transition-all text-sm">
                            Ya, aman
                          </div>
                        </label>
                        <label className="cursor-pointer">
                          <input type="radio" value="unknown" {...register("safety")} className="peer sr-only" />
                          <div className="p-4 border border-[#E7E9EB] rounded-2xl text-center peer-checked:border-yellow-500 peer-checked:bg-yellow-50 peer-checked:text-yellow-700 font-medium text-gray-600 transition-all text-sm">
                            Tidak Tahu
                          </div>
                        </label>
                        <label className="cursor-pointer">
                          <input type="radio" value="no" {...register("safety")} className="peer sr-only" />
                          <div className="p-4 border border-[#E7E9EB] rounded-2xl text-center peer-checked:border-red-500 peer-checked:bg-red-50 peer-checked:text-red-700 font-medium text-gray-600 transition-all text-sm">
                            Tidak
                          </div>
                        </label>
                      </div>
                    </div>

                    {watch("safety") === 'no' && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#FDEDEC] text-[#C0392B] p-5 rounded-2xl border border-[#FADBD8] flex gap-3 items-start">
                        <ShieldAlert className="w-6 h-6 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-sm mb-1">Keselamatanmu adalah prioritas utama.</p>
                          <p className="text-sm">Jika kamu dalam bahaya, segera hubungi <strong>Polri 110</strong> atau Layanan Darurat lainnya di tombol pojok kanan atas.</p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* STEP 4: Cerita */}
              {currentStep === 4 && (
                <motion.div key="step4" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="flex-1 flex flex-col">
                  <h2 className="text-[24px] font-bold text-[#1B4F72] mb-1">Ceritakan apa yang terjadi</h2>
                  <p className="text-sm text-gray-400 mb-6">Tulis sebanyak yang kamu mau — atau lewati jika belum siap</p>
                  
                  <textarea 
                    {...register("description")} 
                    placeholder="Saya sedang berada di..."
                    className="flex-1 min-h-[240px] w-full p-5 border border-[#E7E9EB] rounded-2xl focus:ring-2 focus:ring-[#1B4F72]/20 focus:border-[#1B4F72] outline-none resize-none text-gray-700" 
                  />
                </motion.div>
              )}

              {/* STEP 5: Lampiran */}
              {currentStep === 5 && (
                <motion.div key="step5" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h2 className="text-[24px] font-bold text-[#1B4F72]">Ada bukti yang ingin kamu bagikan? (tidak wajib)</h2>
                    <div className="bg-[#F0F7FC] text-[#4A90B8] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Hanya bisa diakses peer consultant kamu
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mb-8">Bukti tidak wajib — laporanmu tetap valid tanpa ini</p>
                  
                  <div className="space-y-4">
                    {/* Rekam Suara Langsung */}
                    <div className="border border-[#E7E9EB] rounded-2xl p-6 hover:border-[#1B4F72]/30 transition-colors bg-gray-50/50">
                      <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4"><Mic className="w-5 h-5 text-primary" /> Rekam suara langsung</h3>
                      
                      {!audioUrl ? (
                        <div className="flex flex-col items-center gap-3">
                          {!isRecording ? (
                            <button type="button" onClick={startRecording} className="bg-[#1B4F72] text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 hover:bg-[#123650] transition-colors shadow-sm">
                              <Mic className="w-5 h-5" /> Mulai Rekaman
                            </button>
                          ) : (
                            <div className="flex flex-col items-center gap-4 w-full">
                              <div className="text-3xl font-mono text-red-600 flex items-center gap-2">
                                <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                                {formatTime(recordingTime)}
                              </div>
                              <button type="button" onClick={stopRecording} className="bg-red-100 text-red-600 px-6 py-3 rounded-full font-semibold flex items-center gap-2 hover:bg-red-200 transition-colors">
                                <Square className="w-5 h-5 fill-current" /> Berhenti Rekam
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col gap-4">
                          <audio src={audioUrl} controls className="w-full" />
                          <div className="flex gap-3 justify-center">
                            <button type="button" onClick={resetRecording} className="text-sm text-gray-500 font-medium flex items-center gap-1 hover:text-gray-800">
                              <RotateCcw className="w-4 h-4" /> Rekam ulang
                            </button>
                            <span className="text-sm text-green-600 font-bold flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full">
                              <Check className="w-4 h-4" /> Siap dilampirkan
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="border border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 cursor-pointer relative">
                        <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm font-medium text-[#1B4F72]">Upload File/Foto/Video</span>
                        <input type="file" multiple {...register("attachments")} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </div>
                      
                      <div className="border border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 cursor-pointer relative">
                        <Mic className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm font-medium text-[#1B4F72]">Upload File Rekaman (mp3)</span>
                        <input type="file" accept="audio/*" {...register("attachments")} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 6: Ringkasan */}
              {currentStep === 6 && (
                <motion.div key="step6" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="flex-1">
                  <h2 className="text-[24px] font-bold text-[#1B4F72] mb-1">Ringkasan Laporan</h2>
                  <p className="text-sm text-gray-400 mb-8">Periksa kembali sebelum mengirim — kamu masih bisa mengubahnya</p>
                  
                  <div className="bg-[#F4FAF8] border border-[#D1E0D9] p-6 rounded-2xl mb-8">
                    <p className="text-lg text-[#1B4F72] leading-relaxed">
                      Kamu melaporkan <strong>{getTypeLabel(formData.incidentType)}</strong> yang terjadi 
                      di <strong>{formData.campus === 'outside' ? 'luar kampus' : (formData.campus || 'lokasi tidak disebutkan')}</strong> 
                      {formData.incidentDate ? ` pada tanggal ${formData.incidentDate}` : ''}. 
                      Laporan ini akan didampingi secara <strong>{state.path === 'anonymous' ? 'anonim' : 'dengan akun'}</strong>.
                    </p>
                  </div>

                  <label className="flex items-start p-5 bg-white border border-[#E7E9EB] hover:border-[#1B4F72] rounded-2xl cursor-pointer transition-all shadow-sm">
                    <input type="checkbox" {...register("consent")} className="w-6 h-6 text-[#1B4F72] rounded-md border-gray-300 focus:ring-[#1B4F72] mt-0.5" />
                    <span className="ml-4 text-gray-700 text-sm leading-relaxed">
                      Informasi ini sesuai dengan yang saya alami, dan saya setuju data ini digunakan untuk keperluan pendampingan oleh SafePlace.
                    </span>
                  </label>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-auto pt-10">
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center gap-2 px-5 py-3 text-gray-500 font-semibold hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Sebelumnya</span>
              </button>

              <div className="flex gap-3 items-center">
                {currentStep < 6 && (
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="hidden sm:flex items-center gap-2 px-5 py-3 text-[#1B4F72] font-semibold hover:bg-gray-50 rounded-xl transition-all"
                  >
                    Simpan dulu
                  </button>
                )}

                {(currentStep === 4 || currentStep === 5) && (
                  <button
                    type="button"
                    onClick={skipStep}
                    className="text-gray-400 font-medium px-4 hover:text-gray-600 transition-colors"
                  >
                    Lewati
                  </button>
                )}

                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center gap-2 px-8 py-3 bg-[#1B4F72] text-white font-bold rounded-xl hover:bg-[#123650] transition-colors shadow-md"
                  >
                    Lanjut <ArrowRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!watch("consent") || isSubmitting}
                    className="flex items-center gap-2 px-8 py-3 bg-[#5B8A6F] text-white font-bold rounded-xl hover:bg-[#4A735C] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-md"
                  >
                    {isSubmitting ? "Mengirim..." : "Ya, kirim laporan saya"}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
