"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { 
  ArrowLeft, Paperclip, Mic, Send, Square, 
  ShieldAlert, AlertTriangle, FileText,
  User, Check, CheckCheck, MessageCircle, X
} from "lucide-react";

interface ReportItem {
  id: string;
  tracking_code: string;
  incident_type: string;
  status: string;
  emergency: boolean;
  assigned_consultant_id: string;
}

interface Message {
  id: string;
  report_id: string;
  sender_id: string | null;
  content: string;
  message_type: 'text'|'audio'|'image'|'file'|'video';
  attachment_url?: string;
  attachment_type?: string;
  attachment_name?: string;
  is_read: boolean;
  created_at: string;
  sender?: {
    name: string;
    role: string;
    avatar_url: string;
  };
}

interface ReportDetail extends ReportItem {
  description: string;
  incident_date: string;
  location: string;
  location_detail: string;
  safety_status: string;
  perpetrator_relationship?: string;
  created_at: string;
  reporter?: {
    name: string;
    created_at: string;
  };
}

export default function PeerConsultantChatPage({ params }: { params: { reportId: string } }) {
  const router = useRouter();
  const supabase = createClient();
  const { reportId } = params;

  // States
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [reportsList, setReportsList] = useState<(ReportItem & { unreadCount: number, lastMessage?: string, lastUpdate?: string })[]>([]);
  const [activeReport, setActiveReport] = useState<ReportDetail | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [filter, setFilter] = useState<"Semua" | "Darurat" | "Menunggu" | "Selesai">("Semua");

  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingFileUrl, setPendingFileUrl] = useState<string | null>(null);
  const [pendingFileType, setPendingFileType] = useState<string | null>(null);
  const [pendingAudio, setPendingAudio] = useState<Blob | null>(null);
  const [pendingAudioUrl, setPendingAudioUrl] = useState<string | null>(null);
  
  // Audio Recording
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);
  const [escalateReason, setEscalateReason] = useState("");
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let messagesSub: ReturnType<typeof supabase.channel> | null = null;

    const fetchInitialData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return router.push("/login");

        const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single();
        if (isMounted) {
          setCurrentUser(user);
          setIsOnline(profile?.is_online ?? true);
        }

        // Fetch reports list for left sidebar
        const { data: reps } = await supabase
          .from("reports")
          .select("id, tracking_code, incident_type, status, emergency, assigned_consultant_id")
          .eq("assigned_consultant_id", user.id);

        if (reps && isMounted) {
          const enhanced = await Promise.all(
            reps.map(async (r: ReportItem) => {
              const { count } = await supabase.from("messages")
                .select("*", { count: "exact", head: true })
                .eq("report_id", r.id).eq("is_read", false).neq("sender_id", user.id);
              
              const { data: lastMsg } = await supabase.from("messages")
                .select("content, created_at").eq("report_id", r.id).order("created_at", { ascending: false }).limit(1);
                
              return { ...r, unreadCount: count || 0, lastMessage: lastMsg?.[0]?.content, lastUpdate: lastMsg?.[0]?.created_at };
            })
          );
          
          enhanced.sort((a, b) => new Date(b.lastUpdate || 0).getTime() - new Date(a.lastUpdate || 0).getTime());
          setReportsList(enhanced);
        }

        // Fetch active report details
        const { data: repDetail } = await supabase
          .from("reports")
          .select("*, reporter:users!reports_reporter_id_fkey(full_name, created_at)")
          .eq("id", reportId)
          .single();
        
        if (repDetail && isMounted) {
          setActiveReport(repDetail);
        }

        // Fetch messages for active report
        const { data: msgs } = await supabase
          .from("messages")
          .select("*, sender:users!messages_sender_id_fkey(full_name, role, avatar_url)")
          .eq("report_id", reportId)
          .order("created_at", { ascending: true });

        if (msgs && isMounted) {
          setMessages(msgs);
          // Mark unread as read
          msgs.forEach((m: Message) => {
            if (m.sender_id !== user.id && !m.is_read) {
              supabase.from("messages").update({ is_read: true }).eq("id", m.id).then();
            }
          });
        }

        if (!isMounted) return;

        // Subscribe to new messages
        messagesSub = supabase
          .channel(`chat-${reportId}-${Date.now()}`)
          .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `report_id=eq.${reportId}` }, (payload) => {
            if (!isMounted) return;
            setMessages(prev => [...prev, payload.new as Message]);
            if (payload.new.sender_id !== user.id) {
              supabase.from("messages").update({ is_read: true }).eq("id", payload.new.id).then();
            }
            scrollToBottom();
          })
          .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages", filter: `report_id=eq.${reportId}` }, (payload: Record<string, unknown>) => {
             if (!isMounted) return;
             const newMsg = payload.new as Message;
             setMessages(prev => prev.map(m => m.id === newMsg.id ? { ...m, ...newMsg } : m));
          })
          .subscribe();

      } catch (err) {
        console.error(err);
      }
    };

    fetchInitialData();
    return () => {
      isMounted = false;
      if (messagesSub) supabase.removeChannel(messagesSub);
    };
  }, [reportId, router, supabase]);

  useEffect(() => {
    return () => {
      if (pendingFileUrl) URL.revokeObjectURL(pendingFileUrl);
      if (pendingAudioUrl) URL.revokeObjectURL(pendingAudioUrl);
    };
  }, [pendingFileUrl, pendingAudioUrl]);


  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const toggleOnlineStatus = async () => {
    if (!currentUser) return;
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    await supabase.from("users").update({ is_online: newStatus }).eq("id", currentUser?.id);
  };

  const handleSendMessage = async () => {
    if (!currentUser) return;
    if ((!inputMessage.trim() && !pendingFile && !pendingAudio) || isSending) return;
    setIsSending(true);

    try {
      let attachmentUrl: string | null = null;
      let attachmentType: string | null = null;
      let attachmentName: string | null = null;
      let messageType = "text";
      
      if (pendingFile) {
        if (pendingFileType?.startsWith('image/')) messageType = 'image';
        else if (pendingFileType?.startsWith('audio/')) messageType = 'audio';
        else if (pendingFileType?.startsWith('video/')) messageType = 'video';
        else messageType = 'file';
      } else if (pendingAudio) {
        messageType = 'audio';
      }
      
      const messageContent = inputMessage || (pendingAudio ? "Voice Note" : pendingFile ? pendingFile.name : "");

      const msgId = crypto.randomUUID();
      const optimisticMsg: Message = {
        id: msgId,
        report_id: reportId,
        sender_id: currentUser.id,
        content: messageContent,
        message_type: messageType as "text" | "audio" | "image" | "file" | "video",
        attachment_url: pendingFileUrl || pendingAudioUrl || undefined,
        attachment_name: pendingFile?.name,
        is_read: false,
        created_at: new Date().toISOString(),
      };

      setMessages(prev => [...prev, optimisticMsg]);
      setInputMessage("");
      
      const fileToUpload = pendingFile;
      const audioToUpload = pendingAudio;
      
      setPendingFile(null);
      setPendingFileUrl(null);
      setPendingFileType(null);
      setPendingAudio(null);
      setPendingAudioUrl(null);

      if (audioToUpload) {
        const fileName = `chat/${reportId}/${Date.now()}_audio.webm`;
        const { error } = await supabase.storage.from("chat-media").upload(fileName, audioToUpload);
        if (!error) {
          const { data } = supabase.storage.from("chat-media").getPublicUrl(fileName);
          attachmentUrl = data.publicUrl;
          attachmentType = "audio/webm";
          attachmentName = "Voice Note";
        }
      } else if (fileToUpload) {
        const fileName = `chat/${reportId}/${Date.now()}_${fileToUpload.name}`;
        const { error } = await supabase.storage.from("chat-media").upload(fileName, fileToUpload);
        if (!error) {
          const { data } = supabase.storage.from("chat-media").getPublicUrl(fileName);
          attachmentUrl = data.publicUrl;
          attachmentType = fileToUpload.type;
          attachmentName = fileToUpload.name;
        }
      }

      if (attachmentUrl) {
        setMessages(prev => prev.map(m => m.id === msgId ? { ...m, attachment_url: attachmentUrl as string, attachment_type: attachmentType as string, attachment_name: attachmentName as string } : m));
      }

      await supabase.from("messages").insert({
        id: msgId,
        report_id: reportId,
        sender_id: currentUser.id,
        content: messageContent,
        message_type: messageType,
        attachment_url: attachmentUrl,
        attachment_type: attachmentType,
        attachment_name: attachmentName,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) return alert("File terlalu besar (Max 50MB)");
    
    if (pendingFileUrl) URL.revokeObjectURL(pendingFileUrl);
    setPendingFile(file);
    setPendingFileUrl(URL.createObjectURL(file));
    setPendingFileType(file.type);
    
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true,
        video: false 
      });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        if (pendingAudioUrl) URL.revokeObjectURL(pendingAudioUrl);
        setPendingAudio(blob);
        setPendingAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err: unknown) {
      const error = err as Error;
      if (error.name === 'NotAllowedError') {
        const confirmed = window.confirm(
          'Izin mikrofon ditolak.\n\nKlik OK untuk membuka pengaturan browser dan izinkan akses mikrofon.'
        );
        if (confirmed) {
          window.open('chrome://settings/content/microphone', '_blank');
        }
      } else if (error.name === 'NotFoundError') {
        alert('Mikrofon tidak ditemukan di perangkat ini.');
      } else {
        alert('Gagal mengakses mikrofon: ' + error.message);
      }
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const formatTimestamp = (iso: string) => {
    const d = new Date(iso);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const handleEscalate = async () => {
    await supabase.from("reports").update({ status: 'escalated' }).eq("id", reportId);
    // Log escalation reason in case_notes or similar
    setIsEscalateModalOpen(false);
    alert("Kasus berhasil diekskalasi ke Satgas");
    router.refresh();
  };

  const handleEmergency = async () => {
    await supabase.from("reports").update({ emergency: true }).eq("id", reportId);
    setIsEmergencyModalOpen(false);
  };

  // Render Left Sidebar (List)
  const filteredReports = reportsList.filter(r => {
    if (filter === "Darurat") return r.emergency;
    if (filter === "Menunggu") return r.status === "received" || r.status === "under_review";
    if (filter === "Selesai") return r.status === "resolved" || r.status === "closed";
    return true;
  });

  return (
    <div className="h-screen flex flex-col md:flex-row bg-[#F4FAF8] overflow-hidden">
      
      {/* LEFT COLUMN: LIST */}
      <div className={`w-full md:w-[320px] lg:w-[360px] bg-white border-r border-[#E7E9EB] flex flex-col h-full ${activeReport ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-[#E7E9EB]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-[#1B4F72] text-lg">Chat Aktif</h2>
            <button 
              onClick={toggleOnlineStatus}
              className={`text-xs px-3 py-1 rounded-full font-semibold border transition-colors ${isOnline ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}
            >
              {isOnline ? "● Tersedia" : "○ Sibuk"}
            </button>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {(["Semua", "Darurat", "Menunggu", "Selesai"] as const).map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter === f ? "bg-[#1B4F72] text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredReports.map(r => {
            const isActive = r.id === reportId;
            return (
              <div 
                key={r.id} 
                onClick={() => router.push(`/peer-consultant/chat/${r.id}`)}
                className={`p-4 border-b border-[#E7E9EB] cursor-pointer hover:bg-[#F0FAF6] transition-colors relative ${isActive ? 'bg-[#F0FAF6] border-l-4 border-l-[#1B4F72]' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${r.emergency ? 'bg-red-500 animate-pulse' : r.status === 'in_consultation' ? 'bg-yellow-400' : r.status === 'resolved' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    <span className="font-mono font-bold text-[#1B4F72] text-sm">#{r.tracking_code}</span>
                  </div>
                  {r.lastUpdate && <span className="text-[10px] text-gray-400">{formatTimestamp(r.lastUpdate)}</span>}
                </div>
                <div className="flex justify-between items-end">
                  <p className="text-xs text-gray-500 line-clamp-1 pr-4">{r.lastMessage || r.incident_type}</p>
                  {r.unreadCount > 0 && (
                    <span className="bg-[#1B4F72] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                      {r.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT COLUMN: CHAT AREA */}
      <div className={`flex-1 flex flex-col h-full ${!activeReport ? 'hidden md:flex items-center justify-center bg-gray-50' : 'flex'}`}>
        {!activeReport ? (
          <div className="text-center text-gray-400">
            <MessageCircle size={48} className="mx-auto mb-4 opacity-20" />
            <p>Pilih obrolan dari daftar untuk memulai</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="h-16 border-b border-[#E7E9EB] bg-white px-4 md:px-6 flex items-center justify-between shadow-sm z-10">
              <div className="flex items-center gap-3">
                <button onClick={() => router.push("/peer-consultant/dashboard")} className="md:hidden text-gray-500 hover:text-[#1B4F72]">
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h2 className="font-bold text-[#1B4F72] text-lg flex items-center gap-2">
                    #{activeReport.tracking_code}
                    {activeReport.emergency && <ShieldAlert size={16} className="text-red-500" />}
                  </h2>
                  <p className="text-xs text-gray-500 capitalize">{activeReport.incident_type.replace('_', ' ')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setIsEscalateModalOpen(true)} className="px-3 py-1.5 rounded-lg border border-[#1B4F72] text-[#1B4F72] text-xs font-bold hover:bg-[#F0F7FC] transition-colors">
                  ⬆️ Eskalasi
                </button>
                <button onClick={() => setIsEmergencyModalOpen(true)} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 text-xs font-bold hover:bg-red-100 transition-colors">
                  🚨 Darurat
                </button>
              </div>
            </div>

            {/* Info Panels */}
            <div className="px-4 md:px-6 py-2 bg-gray-50 border-b border-[#E7E9EB] flex gap-2 overflow-x-auto scrollbar-hide">
              <button 
                onClick={() => setShowInfoPanel(!showInfoPanel)}
                className={`text-xs px-3 py-1.5 rounded-full font-semibold flex items-center gap-1 transition-colors ${showInfoPanel ? 'bg-[#1B4F72] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'}`}
              >
                <User size={14} /> Info Pelapor
              </button>
              <button 
                onClick={() => setShowAIPanel(!showAIPanel)}
                className={`text-xs px-3 py-1.5 rounded-full font-semibold flex items-center gap-1 transition-colors ${showAIPanel ? 'bg-[#4A90B8] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'}`}
              >
                <FileText size={14} /> Ringkasan AI
              </button>
            </div>

            {/* Expanded Info Panels */}
            <AnimatePresence>
              {showInfoPanel && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-white border-b border-[#E7E9EB] p-4 text-sm text-gray-600 overflow-hidden">
                  <div className="grid grid-cols-2 gap-4 max-w-2xl">
                    <div><span className="font-semibold text-gray-800">Tanggal Kejadian:</span> {activeReport.incident_date ? new Date(activeReport.incident_date).toLocaleDateString() : "Tidak diketahui"}</div>
                    <div><span className="font-semibold text-gray-800">Lokasi:</span> {activeReport.location_detail || activeReport.location || "-"}</div>
                    <div><span className="font-semibold text-gray-800">Kondisi Keamanan:</span> {activeReport.safety_status === 'no' ? 'Tidak Aman' : activeReport.safety_status === 'yes' ? 'Aman' : '-'}</div>
                    <div><span className="font-semibold text-gray-800">Hubungan Pelaku:</span> {activeReport.perpetrator_relationship || "-"}</div>
                  </div>
                </motion.div>
              )}
              {showAIPanel && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-[#F0F7FC] border-b border-[#D6EAF8] p-4 text-sm overflow-hidden">
                  <p className="font-bold text-[#1B4F72] mb-2">Riwayat Percakapan AI (Pendahuluan):</p>
                  <ul className="list-disc pl-5 space-y-1 text-[#4A90B8]">
                    {messages.filter(m => m.sender_id === null || m.content.startsWith('[AI]')).slice(-3).map(m => (
                      <li key={m.id} className="text-xs line-clamp-2">{m.content.replace('[AI]:', '')}</li>
                    ))}
                    {messages.filter(m => m.sender_id === null || m.content.startsWith('[AI]')).length === 0 && (
                      <li className="text-xs italic">Tidak ada catatan AI.</li>
                    )}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
              {messages.map((msg) => {
                const isMe = msg.sender_id === currentUser?.id;
                const isAI = msg.sender_id === null || msg.content.startsWith('[AI]');
                
                let bubbleClass = "bg-gray-100 text-gray-800 rounded-tr-xl rounded-b-xl";
                let wrapperClass = "justify-start";
                
                if (isMe) {
                  bubbleClass = "bg-[#1B4F72] text-white rounded-tl-xl rounded-b-xl";
                  wrapperClass = "justify-end";
                } else if (isAI) {
                  bubbleClass = "bg-[#E1F0FA] border border-[#BDE0F5] text-[#1B4F72] rounded-tr-xl rounded-b-xl";
                  wrapperClass = "justify-start";
                }

                return (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex w-full ${wrapperClass}`}>
                    <div className={`max-w-[85%] md:max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      {isAI && <span className="text-[10px] font-bold text-[#4A90B8] mb-1 ml-1">🤖 AI Pendamping</span>}
                      
                      <div className={`px-4 py-3 shadow-sm ${bubbleClass} text-[15px] leading-relaxed relative group`}>
                                          {msg.message_type === 'image' && msg.attachment_url && (
                    <div className="relative w-48 h-36 rounded-xl overflow-hidden cursor-pointer mt-2" onClick={() => window.open(msg.attachment_url, '_blank')}>
                      <Image src={msg.attachment_url} alt="attachment" fill className="object-cover hover:opacity-90 transition" />
                    </div>
                  )}
                  {msg.message_type === 'audio' && msg.attachment_url && (
                    <div className="flex items-center gap-2 bg-white/20 rounded-xl p-2 mt-2 min-w-[200px]">
                      <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <Mic className="w-4 h-4" />
                      </div>
                      <audio controls src={msg.attachment_url} className="flex-1 h-8" style={{ minWidth: '150px' }} />
                    </div>
                  )}
                  {msg.message_type === 'file' && msg.attachment_url && (
                    <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white/20 rounded-xl p-3 mt-2 hover:bg-white/30 transition">
                      <FileText className="w-6 h-6 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium truncate max-w-[150px]">{msg.attachment_name || 'File'}</p>
                        <p className="text-xs opacity-70">Tap untuk buka</p>
                      </div>
                    </a>
                  )}
                  {msg.message_type === 'video' && msg.attachment_url && (
                    <video controls src={msg.attachment_url} className="w-48 rounded-xl mt-2 max-h-36 object-cover" />
                  )}
                  <p>{msg.content.replace('[AI]:', '')}</p>
                        
                        <div className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                          {formatTimestamp(msg.created_at)}
                          {isMe && (msg.is_read ? <CheckCheck size={12} /> : <Check size={12} />)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-[#E7E9EB] p-4">
              {(pendingFile || pendingAudio) && (
                <div className="px-4 py-3 border-t bg-gray-50 mb-2 rounded-xl">
                  {pendingFile && (
                    <div className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm">
                      {pendingFileType?.startsWith('image/') && pendingFileUrl && (
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <Image src={pendingFileUrl} alt="preview" fill className="object-cover" />
                        </div>
                      )}
                      {!pendingFileType?.startsWith('image/') && (
                        <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-6 h-6 text-teal-600" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{pendingFile.name}</p>
                        <p className="text-xs text-gray-500">{(pendingFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <button onClick={() => {
                        setPendingFile(null)
                        setPendingFileUrl(null)
                        setPendingFileType(null)
                      }} className="p-1 hover:bg-gray-100 rounded-full">
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  )}
                  {pendingAudio && pendingAudioUrl && (
                    <div className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm">
                      <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Mic className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <audio controls src={pendingAudioUrl} className="w-full h-8" />
                        <p className="text-xs text-gray-500 mt-1">Voice note</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => {
                          setPendingAudio(null)
                          setPendingAudioUrl(null)
                        }} className="text-xs text-gray-500 hover:text-red-500">
                          Rekam ulang
                        </button>
                        <button onClick={() => {
                          setPendingAudio(null)
                          setPendingAudioUrl(null)
                        }} className="p-1 hover:bg-gray-100 rounded-full">
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-end gap-2 relative">
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl flex items-center p-1 focus-within:border-[#1B4F72] transition-colors shadow-sm">
                  <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-[#1B4F72] hover:bg-gray-100 rounded-full transition-colors">
                    <Paperclip size={20} />
                  </button>
                  
                  <textarea 
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Ketik pesan..."
                    className="flex-1 bg-transparent border-none outline-none resize-none max-h-32 min-h-[40px] px-2 py-2.5 text-[15px]"
                    rows={1}
                  />
                  
                  {(!inputMessage.trim() && !pendingFile && !pendingAudio) ? (
                    <button 
                      onMouseDown={startRecording}
                      onMouseUp={stopRecording}
                      onMouseLeave={stopRecording}
                      onTouchStart={startRecording}
                      onTouchEnd={stopRecording}
                      className={`p-2 rounded-full transition-colors ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:text-[#1B4F72] hover:bg-gray-100'}`}
                    >
                      {isRecording ? <Square size={20} className="fill-current" /> : <Mic size={20} />}
                    </button>
                  ) : (
                    <button onClick={handleSendMessage} disabled={isSending} className="p-2 bg-[#1B4F72] text-white rounded-full hover:bg-[#123650] transition-colors disabled:opacity-50 mx-1">
                      <Send size={18} className="ml-0.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isEscalateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <h3 className="text-lg font-bold text-[#1B4F72] mb-4">Eskalasi Kasus ke Satgas</h3>
              <textarea 
                value={escalateReason} 
                onChange={(e) => setEscalateReason(e.target.value)}
                placeholder="Jelaskan alasan mengapa kasus ini perlu diteruskan ke Satgas..." 
                className="w-full p-3 border border-gray-200 rounded-xl mb-4 h-32 resize-none focus:border-[#1B4F72] outline-none" 
              />
              <div className="flex justify-end gap-3">
                <button onClick={() => setIsEscalateModalOpen(false)} className="px-4 py-2 text-gray-500 font-semibold hover:bg-gray-100 rounded-xl">Batal</button>
                <button onClick={handleEscalate} disabled={!escalateReason.trim()} className="px-4 py-2 bg-[#1B4F72] text-white font-bold rounded-xl hover:bg-[#123650] disabled:opacity-50">Ya, Eskalasi</button>
              </div>
            </motion.div>
          </div>
        )}

        {isEmergencyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600"><AlertTriangle size={32} /></div>
              <h3 className="text-xl font-bold text-red-600 mb-2">Aktifkan Protokol Darurat?</h3>
              <p className="text-gray-500 mb-6 text-sm">Semua channel notifikasi akan diaktifkan dan kasus diprioritaskan maksimal.</p>
              
              <div className="bg-gray-50 p-4 rounded-xl text-left mb-6 space-y-2">
                <p className="font-bold text-gray-700 text-sm">Nomor Darurat Penting:</p>
                <div className="flex items-center gap-2 text-[#1B4F72] font-mono text-sm"><span className="text-xl">📞</span> Polri 110</div>
                <div className="flex items-center gap-2 text-[#1B4F72] font-mono text-sm"><span className="text-xl">📞</span> 119 ext 8</div>
                <div className="flex items-center gap-2 text-[#1B4F72] font-mono text-sm"><span className="text-xl">📞</span> SAPA 129</div>
              </div>

              <div className="flex flex-col gap-2">
                <button onClick={handleEmergency} className="w-full py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700">🚨 Aktifkan Sekarang</button>
                <button onClick={() => setIsEmergencyModalOpen(false)} className="w-full py-3 text-gray-500 font-semibold hover:bg-gray-100 rounded-xl">Batal</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
