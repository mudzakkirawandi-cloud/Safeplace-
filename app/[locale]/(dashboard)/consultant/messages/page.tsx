"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, MessageCircle } from "lucide-react";

interface ChatItem {
  id: string;
  code: string;
  lastMessage: string;
  time: string;
  unread: number;
  type: string;
}

const CHATS: ChatItem[] = [
  { id: "1", code: "RPT-0047", lastMessage: "Baik, saya akan coba ikuti saran konsultan.", time: "10 mnt", unread: 2, type: "Pelecehan Verbal" },
  { id: "4", code: "RPT-0038", lastMessage: "Terima kasih sudah mendengarkan saya.", time: "1 jam", unread: 0, type: "Kekerasan Seksual" },
  { id: "2", code: "RPT-0045", lastMessage: "Oke, saya tunggu kabarnya.", time: "2 jam", unread: 0, type: "Kekerasan Digital" },
];

export default function MessagesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = CHATS.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-primary">Pesan</h1>
        <p className="text-muted-foreground text-sm mt-1">Chat dengan pelapor yang sedang kamu dampingi</p>
      </motion.div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari percakapan..."
          className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-[#5B8A6F] focus:ring-2 focus:ring-[#5B8A6F]/20 transition-all"
        />
      </div>

      {/* Chat list */}
      <div className="space-y-2">
        {filtered.map((chat, i) => (
          <motion.button
            key={chat.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            onClick={() => router.push(`/consultant/cases/${chat.id}?tab=chat`)}
            className="w-full bg-card border border-border rounded-2xl p-4 text-left hover:shadow-sm hover:border-[#5B8A6F]/30 transition-all flex items-center gap-4"
          >
            {/* Avatar */}
            <div className="w-11 h-11 rounded-full bg-[#EAF3EE] flex items-center justify-center flex-shrink-0">
              <MessageCircle size={18} className="text-primary" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-semibold text-sm text-primary font-mono">#{chat.code}</span>
                <span className="text-xs text-muted-foreground">{chat.time}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-1">{chat.type}</p>
              <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
            </div>

            {/* Unread badge */}
            {chat.unread > 0 && (
              <span className="w-5 h-5 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                {chat.unread}
              </span>
            )}
          </motion.button>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-300 text-sm">Tidak ada percakapan ditemukan.</div>
        )}
      </div>
    </div>
  );
}
