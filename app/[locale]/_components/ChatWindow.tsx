"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createClient } from "../../../lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Check, CheckCheck, Loader2, User as UserIcon } from "lucide-react";

export type Message = {
  id: string;
  report_id: string;
  sender_id: string | null;
  sender_tracking_code: string | null;
  content: string;
  is_read: boolean;
  created_at: string;
};

interface ChatWindowProps {
  reportId: string;
  currentUserId?: string | null;
  trackingCode?: string | null;
  userRole: 'reporter' | 'consultant' | 'admin' | 'operator' | 'satgas';
  consultantName?: string;
  onEndSession?: () => void;
}

export default function ChatWindow({ 
  reportId, 
  currentUserId = null, 
  trackingCode = null, 
  userRole,
  consultantName,
  onEndSession
}: ChatWindowProps) {
  const supabase = useMemo(() => createClient(), []);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [otherOnline, setOtherOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isMyMessage = useCallback((msg: Message) => {
    if (currentUserId && msg.sender_id === currentUserId) return true;
    if (trackingCode && msg.sender_tracking_code === trackingCode) return true;
    return false;
  }, [currentUserId, trackingCode]);

  const getOtherName = () => {
    if (userRole === 'reporter') {
      return consultantName || 'Konsultan SafePlace';
    }
    return 'Pelapor';
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const markMessagesAsRead = useCallback(async (msgs: Message[]) => {
    const unreadIds = msgs
      .filter(m => !m.is_read && !isMyMessage(m))
      .map(m => m.id);

    if (unreadIds.length > 0) {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .in('id', unreadIds);
    }
  }, [isMyMessage, supabase]);

  const markSingleMessageAsRead = useCallback(async (id: string) => {
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('id', id);
  }, [supabase]);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('report_id', reportId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data);
        markMessagesAsRead(data);
      }
      setLoading(false);
    };

    fetchMessages();

    // Setup Supabase Realtime
    const channel = supabase.channel(`chat:${reportId}`, {
      config: { presence: { key: currentUserId || trackingCode || 'unknown' } }
    });
    
    channelRef.current = channel;

    channel
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `report_id=eq.${reportId}` }, (payload) => {
        const newMsg = payload.new as Message;
        setMessages((prev) => {
          if (prev.find(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        
        // Mark as read if it's from the other person
        if (!isMyMessage(newMsg)) {
          markSingleMessageAsRead(newMsg.id);
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages', filter: `report_id=eq.${reportId}` }, (payload) => {
        const updatedMsg = payload.new as Message;
        setMessages((prev) => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m));
      })
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        let otherIsOnline = false;
        let otherIsTyping = false;
        
        const myKey = currentUserId || trackingCode || 'unknown';
        
        for (const [key, presenceInfo] of Object.entries(newState)) {
          if (key !== myKey) {
            otherIsOnline = true;
            // @ts-expect-error - typing property is not strictly defined in Presence type
            if (presenceInfo.some(p => p.typing)) {
              otherIsTyping = true;
            }
          }
        }
        
        setOtherOnline(otherIsOnline);
        setIsTyping(otherIsTyping);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ online: true, typing: false });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [reportId, currentUserId, trackingCode, isMyMessage, markMessagesAsRead, markSingleMessageAsRead, supabase]);

  const handleTyping = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    if (channelRef.current) {
      await channelRef.current.track({ online: true, typing: true });
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      
      typingTimeoutRef.current = setTimeout(async () => {
        if (channelRef.current) {
          await channelRef.current.track({ online: true, typing: false });
        }
      }, 2000);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const content = newMessage.trim();
    setNewMessage("");
    
    if (channelRef.current) {
      await channelRef.current.track({ online: true, typing: false });
    }

    const newMsgData = {
      report_id: reportId,
      sender_id: currentUserId,
      content,
      is_read: false,
      message_type: 'text'
    };

    const { error } = await supabase
      .from('messages')
      .insert([newMsgData]);

    if (error) {
      console.error('ChatWindow send error:', error);
      alert('Gagal kirim pesan: ' + error.message);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-[600px] bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-card border-b border-border flex items-center justify-between z-10 shadow-sm relative">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${userRole === 'reporter' ? 'bg-primary/10 text-primary' : 'bg-primary/10 text-primary'}`}>
              <UserIcon size={20} />
            </div>
            {otherOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-border rounded-full"></div>
            )}
          </div>
          <div>
            <h3 className="font-bold text-card-foreground">{getOtherName()}</h3>
            <p className="text-xs text-muted-foreground">{otherOnline ? 'Online' : 'Offline'}</p>
          </div>
        </div>
        
        {onEndSession && (
          <button 
            onClick={onEndSession}
            className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            Akhiri Sesi
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-background/50 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground space-y-2">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
              <Send size={24} className="text-gray-300 ml-1" />
            </div>
            <p>Belum ada pesan.</p>
            <p className="text-sm">Kirim pesan pertama untuk memulai obrolan.</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isMine = isMyMessage(msg);
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-end space-x-2 max-w-[80%]">
                    {!isMine && (
                      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mb-1 ${userRole === 'reporter' ? 'bg-primary/10 text-primary' : 'bg-primary/10 text-primary'}`}>
                        <UserIcon size={16} />
                      </div>
                    )}
                    
                    <div 
                      className={`relative px-4 py-3 rounded-2xl ${
                        isMine 
                          ? 'bg-primary text-white rounded-br-sm' 
                          : 'bg-card text-card-foreground border border-border shadow-sm rounded-bl-sm'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                    </div>
                  </div>
                  
                  <div className={`flex items-center mt-1 space-x-1 px-1 ${isMine ? 'mr-2' : 'ml-10'}`}>
                    <span className="text-[10px] text-muted-foreground">{formatTime(msg.created_at)}</span>
                    {isMine && (
                      <span className="text-muted-foreground">
                        {msg.is_read ? (
                          <CheckCheck size={14} className="text-primary" />
                        ) : (
                          <Check size={14} />
                        )}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        
        {isTyping && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center space-x-2 text-muted-foreground ml-10"
          >
            <span className="text-xs italic">{getOtherName()} sedang mengetik</span>
            <div className="flex space-x-1">
              <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1 h-1 bg-gray-400 rounded-full" />
              <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1 h-1 bg-gray-400 rounded-full" />
              <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1 h-1 bg-gray-400 rounded-full" />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-card border-t border-border z-10">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder="Ketik pesan..."
            className="flex-1 bg-muted border border-border text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#4A90B8]/20 focus:border-[#4A90B8] transition-all"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="w-12 h-12 bg-primary hover:bg-[#3A7A9E] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0 shadow-sm hover:shadow"
          >
            <Send size={18} className="ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
}
