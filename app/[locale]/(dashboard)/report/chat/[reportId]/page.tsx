"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  ArrowLeft, Paperclip, Mic, Send, Square, ShieldAlert, User, Check, CheckCheck, X, FileText
} from "lucide-react";

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
  sender?: { name: string; role: string; avatar_url?: string };
}

interface ReportDetail {
  assigned_consultant_id?: string;
  assignment_status?: string;
  assigned_consultant?: { full_name: string; is_online: boolean };
}

export default function ReporterChatPage({ params }: { params: { reportId: string; locale: string } }) {
  const router = useRouter();
  const supabase = createClient();
  const { reportId } = params;

  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isAITyping, setIsAITyping] = useState(false);
  
  const [peerConsultant, setPeerConsultant] = useState<{ full_name: string; is_online: boolean } | null>(null);
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const [presenceChannel, setPresenceChannel] = useState<ReturnType<typeof supabase.channel> | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
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

  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [showMicModal, setShowMicModal] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let messagesSub: ReturnType<typeof supabase.channel> | null = null;
    let reportSub: ReturnType<typeof supabase.channel> | null = null;

    const fetchInitialData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return router.push("/login");
        if (isMounted) setCurrentUser(user);

        const { data: repDetail } = await supabase
          .from("reports")
          .select("*, assigned_consultant:users!reports_assigned_consultant_id_fkey(full_name, is_online)")
          .eq("id", reportId)
          .maybeSingle();
        
        if (repDetail && isMounted) {
          setReport(repDetail);
          if (repDetail.assigned_consultant) {
            setPeerConsultant(repDetail.assigned_consultant);
          }
        }

        const { data: msgs } = await supabase
          .from("messages")
          .select("*")
          .eq("report_id", reportId)
          .order("created_at", { ascending: true });

        if (msgs && isMounted) {
          setMessages(msgs);
          // Auto-greeting from AI if consultant is not assigned and no AI messages exist yet
          if (!repDetail?.assigned_consultant_id) {
            const hasAIMessage = msgs.some((m: Message) => m.sender_id === null || m.content.startsWith('[AI]'));
            if (!hasAIMessage) {
              const greeting = "[AI]: Halo, aku AI Pendamping SafePlace 💙\nPeer consultant kami sedang dalam perjalanan.\nAku di sini bersamamu dulu ya —\nceritakan apa yang kamu rasakan sekarang?";
              await supabase.from("messages").insert({
                report_id: reportId,
                sender_id: null,
                content: greeting,
                message_type: 'text'
              });
            }

            // Trigger assignment jika belum pending/unassigned
            if (!repDetail?.assigned_consultant_id && repDetail?.assignment_status !== 'pending') {
              console.log('Triggering assignment for:', reportId);
              console.log('Status:', repDetail?.assignment_status);
              console.log('Consultant:', repDetail?.assigned_consultant_id);
              fetch('/api/assign-consultant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ report_id: reportId })
              }).catch(err => console.error('Error triggering assignment:', err));
            }
          }
          
          // Mark unread as read
          msgs.forEach((m: Message) => {
            if (m.sender_id !== user.id && !m.is_read) {
              supabase.from("messages").update({ is_read: true }).eq("id", m.id).then();
            }
          });
        }

        if (!isMounted) return;

        messagesSub = supabase
          .channel(`messages-${reportId}-${Date.now()}`)
          .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `report_id=eq.${reportId}` }, (payload) => {
            if (!isMounted) return;
            const newMsg = payload.new as Message;
            setMessages(prev => {
              const exists = prev.some(m => m.id === newMsg.id);
              if (exists) return prev;
              return [...prev, newMsg];
            });
            if (newMsg.sender_id !== user.id) {
              supabase.from("messages").update({ is_read: true }).eq("id", newMsg.id).then();
            }
            scrollToBottom();
          })
          .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages", filter: `report_id=eq.${reportId}` }, (payload: Record<string, unknown>) => {
             if (!isMounted) return;
             const newMsg = payload.new as Message;
             setMessages(prev => prev.map(m => m.id === newMsg.id ? { ...m, ...newMsg } : m));
          })
          .subscribe((status) => {
            console.log('Chat realtime status:', status);
          });
        const pChannel = supabase.channel(`presence-chat-${reportId}`, {
          config: { presence: { key: user.id } },
        });

        pChannel.on('presence', { event: 'sync' }, () => {
          const state = pChannel.presenceState();
          const typing = Object.values(state).some((presences) =>
            (presences as unknown as Array<{typing: boolean, userId: string}>)
              .some(p => p.typing === true && p.userId !== user.id)
          );
          if (isMounted) setIsPeerTyping(typing);
        }).subscribe();
        
        if (isMounted) setPresenceChannel(pChannel);
        reportSub = supabase
          .channel(`reporter-rep-${reportId}-${Date.now()}`)
          .on("postgres_changes", { event: "UPDATE", schema: "public", table: "reports", filter: `id=eq.${reportId}` }, async () => {
             if (!isMounted) return;
             const { data: updatedRep } = await supabase.from("reports").select("*, assigned_consultant:users!reports_assigned_consultant_id_fkey(full_name, is_online)").eq("id", reportId).single();
             setReport(updatedRep);
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
      if (reportSub) supabase.removeChannel(reportSub);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId, router, supabase]);

  useEffect(() => {
    let userSub: ReturnType<typeof supabase.channel> | null = null;
    if (report?.assigned_consultant_id) {
      userSub = supabase
        .channel(`user-status-${report.assigned_consultant_id}-${Date.now()}`)
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "users", filter: `id=eq.${report.assigned_consultant_id}` }, (payload) => {
           const updatedUser = payload.new as { full_name: string; is_online: boolean };
           setPeerConsultant(prev => prev ? { ...prev, is_online: updatedUser.is_online } : null);
        })
        .subscribe();
    }
    return () => {
      if (userSub) supabase.removeChannel(userSub);
    };
  }, [report?.assigned_consultant_id, supabase]);

  useEffect(() => {
    return () => {
      if (presenceChannel) supabase.removeChannel(presenceChannel);
      clearTimeout(typingTimeoutRef.current);
    };
  }, [presenceChannel, supabase]);

  useEffect(() => {
    return () => {
      if (pendingFileUrl) URL.revokeObjectURL(pendingFileUrl);
      if (pendingAudioUrl) URL.revokeObjectURL(pendingAudioUrl);
    };
  }, [pendingFileUrl, pendingAudioUrl]);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAITyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const callAIAgent = async (userMessage: string, attachmentUrl?: string | null, messageType?: string | null, attachmentName?: string | null) => {
    setIsAITyping(true);
    try {
      const res = await fetch("/api/ai-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ 
            role: "user", 
            content: userMessage,
            attachment_url: attachmentUrl,
            message_type: messageType,
            attachment_name: attachmentName
          }],
          locale: params.locale || 'id'
        })
      });
      if (res.ok) {
        const data = await res.json();
        const msgId = crypto.randomUUID();
        const aiMessage: Message = {
          id: msgId,
          report_id: reportId,
          sender_id: null,
          content: `[AI]: ${data.response}`,
          message_type: 'text',
          is_read: false,
          created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, aiMessage]);

        await supabase.from("messages").insert({
          id: msgId,
          report_id: reportId,
          sender_id: null,
          content: `[AI]: ${data.response}`,
          message_type: 'text',
          is_read: true
        });
      }
    } catch (err) {
      console.error("AI Agent error:", err);
    } finally {
      setIsAITyping(false);
    }
  };

  const handleTyping = () => {
    if (!presenceChannel || !currentUser) return;
    presenceChannel.track({ 
      typing: true, 
      userId: currentUser.id 
    });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      presenceChannel.track({ 
        typing: false, 
        userId: currentUser.id 
      });
    }, 2000);
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
      if (!report?.assigned_consultant_id) {
        callAIAgent(messageContent, attachmentUrl, messageType, attachmentName);
      }
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
        setShowMicModal(true);
      } else if (error.name === 'NotFoundError') {
        alert('Mikrofon tidak ditemukan.');
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

  const handleEmergency = async () => {
    await supabase.from("reports").update({ emergency: true }).eq("id", reportId);
    setIsEmergencyModalOpen(false);
  };

  return (
    <div className="h-screen flex flex-col bg-[#F4FAF8] max-w-4xl mx-auto md:border-x border-[#E7E9EB] shadow-sm">
      {/* Header */}
      <header className="bg-white border-b border-[#E7E9EB] px-4 md:px-6 h-16 flex items-center justify-between sticky top-0 z-30 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/report/dashboard")} className="text-gray-500 hover:text-[#1B4F72] transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E1F0FA] rounded-full flex items-center justify-center text-[#1B4F72] relative">
              <User size={20} />
              {peerConsultant && (
                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${peerConsultant.is_online ? 'bg-green-500' : 'bg-gray-400'}`}></span>
              )}
            </div>
            <div>
              <h2 className="font-bold text-[#1B4F72] leading-tight">
                {peerConsultant?.full_name || "Mencari Peer Consultant..."}
              </h2>
              {isPeerTyping ? (
                <p className="text-xs text-teal-500 font-medium animate-pulse">
                  sedang mengetik...
                </p>
              ) : (
                <p className={`text-xs font-medium flex items-center gap-1 ${
                  peerConsultant?.is_online ? 'text-green-500' : 'text-gray-400'
                }`}>
                  {peerConsultant ? (peerConsultant.is_online ? 'Online' : 'Offline') : 'Harap tunggu...'}
                </p>
              )}
            </div>
          </div>
        </div>
        <button onClick={() => setIsEmergencyModalOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 text-xs font-bold hover:bg-red-100 transition-colors shadow-sm">
          <ShieldAlert size={16} /> <span className="hidden sm:inline">Darurat</span>
        </button>
      </header>

      {/* Banner Wait for Consultant */}
      {!report?.assigned_consultant_id && (
        <div className="bg-[#E1F0FA] p-3 text-center border-b border-[#BDE0F5] shrink-0">
          <p className="text-sm font-semibold text-[#1B4F72]">⏳ Peer consultant sedang menuju...</p>
          <p className="text-xs text-[#4A90B8]">AI Pendamping akan menemanimu sementara waktu.</p>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUser?.id;
          const isAI = msg.sender_id === null || msg.content.startsWith('[AI]');
          
          let bubbleClass = "bg-gray-100 text-gray-800 rounded-tr-xl rounded-b-xl";
          let wrapperClass = "justify-start";
          
          if (isMe) {
            bubbleClass = "bg-[#1B4F72] text-white rounded-tl-xl rounded-b-xl shadow-sm";
            wrapperClass = "justify-end";
          } else if (isAI) {
            bubbleClass = "bg-[#E1F0FA] border border-[#BDE0F5] text-[#1B4F72] rounded-tr-xl rounded-b-xl shadow-sm";
            wrapperClass = "justify-start";
          } else {
            bubbleClass = "bg-white border border-[#E7E9EB] text-gray-800 rounded-tr-xl rounded-b-xl shadow-sm";
          }

          return (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex w-full ${wrapperClass}`}>
              <div className={`max-w-[85%] md:max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {isAI && <span className="text-[10px] font-bold text-[#4A90B8] mb-1 ml-1">🤖 AI Pendamping</span>}
                {!isMe && !isAI && <span className="text-[10px] font-bold text-gray-500 mb-1 ml-1">{report?.assigned_consultant?.full_name || 'Consultant'}</span>}
                
                <div className={`px-4 py-3 ${bubbleClass} text-[15px] leading-relaxed relative group`}>
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
                  <p className="whitespace-pre-wrap">{msg.content.replace('[AI]:', '').trim()}</p>
                  
                  <div className={`text-[10px] mt-1.5 flex items-center justify-end gap-1 ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                    {formatTimestamp(msg.created_at)}
                    {isMe && (msg.is_read ? <CheckCheck size={12} /> : <Check size={12} />)}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
        {isAITyping && (
           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex w-full justify-start">
             <div className="bg-[#E1F0FA] px-4 py-3 border border-[#BDE0F5] text-[#1B4F72] rounded-tr-xl rounded-b-xl shadow-sm">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[#4A90B8] rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-[#4A90B8] rounded-full animate-bounce delay-75"></span>
                  <span className="w-1.5 h-1.5 bg-[#4A90B8] rounded-full animate-bounce delay-150"></span>
                </span>
             </div>
           </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

            {/* Input Area */}
      <div className="bg-white border-t border-[#E7E9EB] p-4 shrink-0">
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
              onChange={(e) => {
                setInputMessage(e.target.value);
                handleTyping();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ketik pesan..."
              className="flex-1 bg-transparent border-none outline-none resize-none max-h-32 min-h-[40px] px-2 py-2.5 text-[16px]"
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
      {/* Emergency Modal */}
      <AnimatePresence>
        {isEmergencyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600"><ShieldAlert size={32} /></div>
              <h3 className="text-xl font-bold text-red-600 mb-2">Aktifkan Bantuan Darurat?</h3>
              <p className="text-gray-500 mb-6 text-sm">Tim keamanan kampus terdekat akan diberitahu lokasi dan status Anda saat ini.</p>
              
              <div className="bg-gray-50 p-4 rounded-xl text-left mb-6 space-y-2">
                <p className="font-bold text-gray-700 text-sm">Hubungi Langsung:</p>
                <div className="flex items-center gap-2 text-[#1B4F72] font-mono text-sm"><span className="text-xl">📞</span> Polri 110</div>
                <div className="flex items-center gap-2 text-[#1B4F72] font-mono text-sm"><span className="text-xl">📞</span> 119 ext 8</div>
                <div className="flex items-center gap-2 text-[#1B4F72] font-mono text-sm"><span className="text-xl">📞</span> SAPA 129</div>
              </div>

              <div className="flex flex-col gap-2">
                <button onClick={handleEmergency} className="w-full py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700">🚨 Panggil Bantuan Sekarang</button>
                <button onClick={() => setIsEmergencyModalOpen(false)} className="w-full py-3 text-gray-500 font-semibold hover:bg-gray-100 rounded-xl">Batal</button>
              </div>
            </motion.div>
          </div>
        )}

        {showMicModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                <Mic size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Izin Mikrofon Ditolak</h3>
              <p className="text-gray-500 mb-6 text-sm">Browser Anda memblokir akses mikrofon. Silakan izinkan melalui pengaturan browser.</p>
              
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => {
                    window.open('chrome://settings/content/microphone', '_blank');
                    setShowMicModal(false);
                  }} 
                  className="w-full py-3 bg-[#1B4F72] text-white font-bold rounded-xl hover:bg-[#123650]"
                >
                  Buka Pengaturan
                </button>
                <button 
                  onClick={() => setShowMicModal(false)} 
                  className="w-full py-3 bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 rounded-xl"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
