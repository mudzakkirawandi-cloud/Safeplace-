"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Clock, FileText, MapPin, Paperclip, ShieldAlert, Users, Calendar } from "lucide-react";
import SafePlaceLogo from "@/components/ui/SafePlaceLogo";
import Link from "next/link";

interface ReportDetail {
  id: string;
  tracking_code: string;
  incident_type: string;
  status: string;
  created_at: string;
  description: string;
  incident_date: string;
  location: string;
  location_detail: string;
  perpetrator_relationship: string;
  safety_status: string;
}

interface Attachment {
  id: string;
  file_url: string;
  file_type: string;
}

interface HistoryUpdate {
  id: string;
  status: string;
  notes: string;
  created_at: string;
}

export default function ReportDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const supabase = createClient();
  const reportId = params.id;

  const [report, setReport] = useState<ReportDetail | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [history, setHistory] = useState<HistoryUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReportDetail = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        // Fetch Report
        const { data: reportData, error: reportError } = await supabase
          .from("reports")
          .select("*")
          .eq("id", reportId)
          .eq("reporter_id", user.id)
          .single();

        if (reportError || !reportData) {
          setError("Laporan tidak ditemukan atau Anda tidak memiliki akses.");
          setLoading(false);
          return;
        }

        setReport(reportData);

        // Fetch Attachments
        const { data: attData } = await supabase
          .from("report_attachments")
          .select("*")
          .eq("report_id", reportId);
        
        if (attData) setAttachments(attData);

        // Fetch History
        const { data: histData } = await supabase
          .from("satgas_case_updates")
          .select("*")
          .eq("report_id", reportId)
          .order("created_at", { ascending: false });
        
        if (histData) setHistory(histData);

      } catch (err) {
        console.error(err);
        setError("Terjadi kesalahan sistem saat memuat laporan.");
      } finally {
        setLoading(false);
      }
    };

    fetchReportDetail();
  }, [reportId, router, supabase]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "diterima": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "diproses": return "bg-blue-100 text-blue-700 border-blue-200";
      case "selesai": return "bg-green-100 text-green-700 border-green-200";
      case "ditutup": return "bg-gray-100 text-gray-700 border-gray-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getTypeLabel = (val?: string) => {
    switch (val) {
      case 'verbal_harassment': return "Pelecehan Verbal";
      case 'physical_harassment': return "Pelecehan Fisik";
      case 'sexual_violence': return "Kekerasan Seksual";
      case 'digital_violence': return "Kekerasan Digital";
      case 'other': return "Lainnya";
      default: return val || "-";
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#F4FAF8] p-4">
        <div className="bg-white p-8 rounded-3xl border border-red-100 shadow-sm text-center max-w-md w-full">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#1B4F72] mb-2">Akses Ditolak</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link href="/report/dashboard" className="w-full block py-3 bg-[#1B4F72] hover:bg-[#123650] text-white font-bold rounded-xl transition">
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4FAF8]">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between max-w-4xl">
          <SafePlaceLogo iconSize={24} textSize="text-lg" textColor="text-[#1B4F72]" />
          <Link href="/report/dashboard" className="text-sm font-medium text-gray-500 hover:text-[#1B4F72] flex items-center gap-2">
            <ArrowLeft size={16} /> Kembali
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="bg-white rounded-3xl shadow-sm border border-[#E7E9EB] overflow-hidden">
          {/* Header Card */}
          <div className="p-8 border-b border-[#E7E9EB] bg-gray-50/50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Kode Tracking</p>
                <h1 className="text-3xl font-mono font-bold text-[#1B4F72] tracking-wider">{report.tracking_code}</h1>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-bold border ${getStatusColor(report.status)} uppercase tracking-wide`}>
                {report.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <Clock size={16} /> Dilaporkan pada {new Date(report.created_at).toLocaleString()}
            </p>
          </div>

          <div className="p-8">
            <h2 className="text-xl font-bold text-[#1B4F72] mb-6 border-b border-gray-100 pb-2">Informasi Kejadian</h2>
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <div className="flex gap-3 items-start mb-6">
                  <div className="w-10 h-10 rounded-full bg-[#F0F7FC] flex items-center justify-center flex-shrink-0">
                    <ShieldAlert className="w-5 h-5 text-[#4A90B8]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Jenis Kejadian</p>
                    <p className="font-semibold text-gray-800">{getTypeLabel(report.incident_type)}</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start mb-6">
                  <div className="w-10 h-10 rounded-full bg-[#F0FAF6] flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-[#5B8A6F]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Tanggal Kejadian</p>
                    <p className="font-semibold text-gray-800">{report.incident_date ? new Date(report.incident_date).toLocaleDateString() : "Tidak disebutkan"}</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start mb-6">
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Lokasi</p>
                    <p className="font-semibold text-gray-800 capitalize">{(report.location || "Tidak disebutkan").replace('_', ' ')}</p>
                    {report.location_detail && <p className="text-sm text-gray-600 mt-1">{report.location_detail}</p>}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex gap-3 items-start mb-6">
                  <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Hubungan dengan Pelaku</p>
                    <p className="font-semibold text-gray-800 capitalize">{(report.perpetrator_relationship || "Tidak disebutkan").replace('_', ' ')}</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start mb-6">
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                    <ShieldAlert className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Kondisi Keamanan</p>
                    <p className="font-semibold text-gray-800">
                      {report.safety_status === 'yes' ? "Aman" : report.safety_status === 'no' ? "Tidak Aman" : "Tidak Tahu"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-sm text-gray-500 mb-3 flex items-center gap-2"><FileText size={16} /> Deskripsi Kejadian</h3>
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{report.description || "Tidak ada deskripsi."}</p>
              </div>
            </div>

            {attachments.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm text-gray-500 mb-3 flex items-center gap-2"><Paperclip size={16} /> Lampiran ({attachments.length})</h3>
                <div className="flex flex-wrap gap-3">
                  {attachments.map((att) => (
                    <div key={att.id} className="bg-[#F0F7FC] text-[#1B4F72] px-4 py-3 rounded-xl border border-[#D6EAF8] flex items-center gap-3">
                      <Paperclip size={18} />
                      <span className="text-sm font-medium">Lampiran {att.file_type.split('/')[0]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Status History */}
          {history.length > 0 && (
            <div className="p-8 border-t border-[#E7E9EB] bg-gray-50/50">
              <h2 className="text-xl font-bold text-[#1B4F72] mb-6 border-b border-gray-100 pb-2">Riwayat Update Status</h2>
              <div className="space-y-6">
                {history.map((hist) => (
                  <div key={hist.id} className="relative pl-6 border-l-2 border-[#D1E0D9]">
                    <div className="absolute w-3 h-3 bg-[#5B8A6F] rounded-full -left-[7px] top-1.5"></div>
                    <div className="mb-1">
                      <span className="font-bold text-gray-800 capitalize mr-2">{hist.status}</span>
                      <span className="text-xs text-gray-400">{new Date(hist.created_at).toLocaleString()}</span>
                    </div>
                    {hist.notes && <p className="text-sm text-gray-600 bg-white p-3 rounded-xl border border-gray-200 mt-2">{hist.notes}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
