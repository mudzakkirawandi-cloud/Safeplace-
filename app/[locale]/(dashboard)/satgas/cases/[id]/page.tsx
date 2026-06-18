"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MessageCircle, FileText, Search, Upload, File, Download, Trash2, Send, Clock, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "../../../../../../lib/supabase/client";

interface Report {
  id: string;
  tracking_code?: string;
  status: string;
  incident_type: string;
  description: string;
  reporter?: { full_name: string };
  consultant?: { full_name: string };
  [key: string]: unknown;
}

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  [key: string]: unknown;
}

interface Investigation {
  id: string;
  status: string;
  findings: string;
  created_at: string;
  investigator?: { full_name: string };
  [key: string]: unknown;
}

interface Document {
  id: string;
  file_name: string;
  file_url: string;
  uploaded_by: string;
  created_at: string;
  [key: string]: unknown;
}

export default function SatgasCaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState("detail");
  const [report, setReport] = useState<Report | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId]);

  useEffect(() => {
    if (activeTab === "chat") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) setUserId(session.user.id);

    try {
      // 1. Fetch Report
      const { data: reportData } = await supabase
        .from("reports")
        .select(`*, reporter:reporter_id(full_name), consultant:assigned_consultant_id(full_name)`)
        .eq("id", reportId)
        .single();
      
      setReport(reportData);

      // 2. Fetch Messages
      const { data: msgData } = await supabase
        .from("messages")
        .select("*")
        .eq("report_id", reportId)
        .order("created_at", { ascending: true });
      if (msgData) setMessages(msgData);

      // 3. Fetch Investigations
      const { data: invData } = await supabase
        .from("satgas_investigations")
        .select(`*, investigator:investigator_id(full_name)`)
        .eq("report_id", reportId)
        .order("created_at", { ascending: false });
      if (invData) setInvestigations(invData);

      // 4. Fetch Documents
      const { data: docData } = await supabase
        .from("satgas_documents")
        .select(`*, uploader:uploaded_by(full_name)`)
        .eq("report_id", reportId)
        .order("created_at", { ascending: false });
      if (docData) setDocuments(docData);

    } catch (err) {
      console.error("Error fetching data", err);
    } finally {
      setLoading(false);
    }

    // Realtime subscriptions
    const msgSub = supabase.channel('satgas_chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `report_id=eq.${reportId}` }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
      })
      .subscribe();
      
    const invSub = supabase.channel('satgas_inv')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'satgas_investigations', filter: `report_id=eq.${reportId}` }, () => {
        fetchInvestigations();
      })
      .subscribe();

    const docSub = supabase.channel('satgas_doc')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'satgas_documents', filter: `report_id=eq.${reportId}` }, () => {
        fetchDocuments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(msgSub);
      supabase.removeChannel(invSub);
      supabase.removeChannel(docSub);
    };
  };

  const fetchInvestigations = async () => {
    const { data } = await supabase.from("satgas_investigations").select(`*, investigator:investigator_id(full_name)`).eq("report_id", reportId).order("created_at", { ascending: false });
    if (data) setInvestigations(data);
  };

  const fetchDocuments = async () => {
    const { data } = await supabase.from("satgas_documents").select(`*, uploader:uploaded_by(full_name)`).eq("report_id", reportId).order("created_at", { ascending: false });
    if (data) setDocuments(data);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userId) return;

    try {
      await supabase.from("messages").insert({
        report_id: reportId,
        sender_id: userId,
        content: newMessage,
      });
      setNewMessage("");
    } catch (err) {
      console.error(err);
    }
  };

  const [invStatus, setInvStatus] = useState("ongoing");
  const [invFindings, setInvFindings] = useState("");
  const [isSubmittingInv, setIsSubmittingInv] = useState(false);

  const handleAddInvestigation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invFindings.trim() || !userId) return;
    setIsSubmittingInv(true);
    try {
      await supabase.from("satgas_investigations").insert({
        report_id: reportId,
        investigator_id: userId,
        status: invStatus,
        findings: invFindings,
      });
      setInvFindings("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingInv(false);
    }
  };

  // Upload handler for documents
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    setUploadingDoc(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${reportId}_${Math.random()}.${fileExt}`;
      const filePath = `satgas_docs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("attachments") // Ensure you have an attachments bucket
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("attachments").getPublicUrl(filePath);

      await supabase.from("satgas_documents").insert({
        report_id: reportId,
        uploaded_by: userId,
        file_name: file.name,
        file_url: publicUrl,
        document_type: "evidence",
      });
    } catch (err) {
      console.error(err);
      alert("Gagal upload file.");
    } finally {
      setUploadingDoc(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!confirm("Hapus dokumen ini?")) return;
    try {
      await supabase.from("satgas_documents").delete().eq("id", id);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Memuat detail kasus...</div>;
  }

  if (!report) {
    return <div className="p-8 text-center text-muted-foreground">Kasus tidak ditemukan.</div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto h-[calc(100vh-80px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push(`/${params.locale}/satgas/cases`)}
            className="p-2 hover:bg-gray-100 rounded-lg text-muted-foreground transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#154360] flex items-center gap-3">
              Kasus {report.tracking_code || report.id.substring(0,8)}
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                report.status === 'received' ? 'bg-[#D4AC0D]/20 text-[#9c7d04]' : 
                report.status === 'resolved' ? 'bg-green-100 text-green-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {report.status.replace("_", " ").toUpperCase()}
              </span>
            </h1>
            <p className="text-sm text-primary/80 mt-1">Jenis Laporan: {report.incident_type.replace("_", " ")}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border shrink-0">
        {[
          { id: "detail", label: "Detail Kasus", icon: FileText },
          { id: "chat", label: "Chat Pelapor", icon: MessageCircle },
          { id: "investigasi", label: "Investigasi", icon: Search },
          { id: "dokumen", label: "Dokumen", icon: File },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id 
                ? "border-[#1A5276] text-primary" 
                : "border-transparent text-muted-foreground hover:text-card-foreground hover:border-gray-300"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-2">
        <AnimatePresence mode="wait">
          {activeTab === "detail" && (
            <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
                <h3 className="font-semibold text-lg text-[#154360]">Deskripsi Laporan</h3>
                <p className="text-card-foreground whitespace-pre-wrap leading-relaxed">{report.description || "Tidak ada deskripsi."}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-card rounded-2xl border border-border p-6 space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Informasi Pelapor</h3>
                  <p className="font-medium text-primary">{report.reporter?.full_name || "Anonim"}</p>
                </div>
                <div className="bg-card rounded-2xl border border-border p-6 space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Konsultan Pendamping</h3>
                  <p className="font-medium text-primary">{report.consultant?.full_name || "Belum Ditugaskan"}</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "chat" && (
            <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full bg-card rounded-2xl border border-border overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-10">Belum ada percakapan.</div>
                ) : (
                  messages.map(msg => {
                    const isMe = msg.sender_id === userId;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                          isMe ? "bg-primary text-white rounded-tr-none" : "bg-gray-100 text-card-foreground rounded-tl-none"
                        }`}>
                          <p>{msg.content}</p>
                          <span className={`text-[10px] mt-1 block ${isMe ? "text-blue-200" : "text-muted-foreground"}`}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-3 border-t border-border bg-muted shrink-0">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Ketik pesan..."
                    className="flex-1 border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 bg-card"
                  />
                  <button type="submit" disabled={!newMessage.trim()} className="bg-primary text-white p-2.5 rounded-xl hover:bg-[#154360] disabled:opacity-50 transition-colors">
                    <Send size={18} />
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {activeTab === "investigasi" && (
            <motion.div key="investigasi" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
                <h3 className="font-semibold text-lg text-[#154360]">Catatan Investigasi Baru</h3>
                <form onSubmit={handleAddInvestigation} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-card-foreground mb-1">Status Investigasi</label>
                      <select value={invStatus} onChange={(e) => setInvStatus(e.target.value)} className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30">
                        <option value="ongoing">Sedang Berjalan (Ongoing)</option>
                        <option value="concluded">Selesai (Concluded)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-card-foreground mb-1">Temuan / Catatan</label>
                    <textarea rows={3} value={invFindings} onChange={(e) => setInvFindings(e.target.value)} placeholder="Tuliskan temuan investigasi..." className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30" />
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" disabled={isSubmittingInv} className="px-4 py-2 bg-primary text-white font-medium text-sm rounded-xl hover:bg-[#154360] disabled:opacity-50">
                      {isSubmittingInv ? "Menyimpan..." : "Simpan Investigasi"}
                    </button>
                  </div>
                </form>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-[#154360]">Riwayat Investigasi</h3>
                {investigations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground bg-muted rounded-xl border border-border">Belum ada catatan investigasi.</div>
                ) : (
                  investigations.map(inv => (
                    <div key={inv.id} className="bg-card rounded-2xl border border-border p-5 flex gap-4">
                      <div className="mt-1 text-primary">
                        {inv.status === 'concluded' ? <CheckCircle size={20} className="text-green-600" /> : <Clock size={20} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="font-semibold text-primary text-sm">{inv.investigator?.full_name || "Investigator"}</p>
                          <span className="text-xs text-muted-foreground">{new Date(inv.created_at).toLocaleString()}</span>
                        </div>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${inv.status === 'concluded' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                          {inv.status}
                        </span>
                        <p className="text-sm text-card-foreground mt-2 whitespace-pre-wrap">{inv.findings}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "dokumen" && (
            <motion.div key="dokumen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="bg-card rounded-2xl border border-border p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-lg text-[#154360]">Dokumen Resmi & Bukti</h3>
                  <p className="text-sm text-muted-foreground">Upload BAP, surat pernyataan, atau bukti tambahan.</p>
                </div>
                <div>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                  <button onClick={() => fileInputRef.current?.click()} disabled={uploadingDoc} className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium text-sm rounded-xl hover:bg-[#154360] disabled:opacity-50">
                    <Upload size={16} />
                    {uploadingDoc ? "Mengunggah..." : "Unggah Dokumen"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {documents.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-muted-foreground bg-muted rounded-xl border border-border">Belum ada dokumen yang diunggah.</div>
                ) : (
                  documents.map(doc => (
                    <div key={doc.id} className="bg-card rounded-2xl border border-border p-4 flex flex-col gap-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                          <FileText size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-card-foreground truncate" title={doc.file_name}>{doc.file_name}</p>
                          <p className="text-xs text-muted-foreground">{new Date(doc.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-auto pt-2 border-t border-border">
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-muted hover:bg-gray-100 text-muted-foreground rounded-lg text-xs font-medium transition-colors">
                          <Download size={14} /> Unduh
                        </a>
                        {doc.uploaded_by === userId && (
                          <button onClick={() => handleDeleteDocument(doc.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
