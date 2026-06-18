"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function AIAgentWidget() {
  const t = useTranslations("ai_agent");
  const locale = useLocale();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Hide widget in dashboards and full page ai assistant
  const pathname = usePathname();
  const isDashboard = pathname?.match(/\/(admin|consultant|operator|satgas)/);
  const isAIPage = pathname?.includes('/ai-assistant');
  

  // Load from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem("safeplace_ai_messages");
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch {
        console.error("Failed to parse AI messages");
      }
    } else {
      // Add initial greeting
      setMessages([
        {
          id: uuidv4(),
          role: "assistant",
          content: t("greeting"),
        },
      ]);
    }
  }, [t]);

  // Save to sessionStorage when messages change
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem("safeplace_ai_messages", JSON.stringify(messages));
    }
    // Auto scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleWidget = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Rate limit: 20 user messages per session (40 total including assistant)
    const userMessageCount = messages.filter((m) => m.role === "user").length;
    if (userMessageCount >= 20) {
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: "assistant",
          content: t("limit_exceeded"),
        },
      ]);
      return;
    }

    const userMsg: Message = {
      id: uuidv4(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          locale,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: uuidv4(),
            role: "assistant",
            content: data.response || data.reply,
          },
        ]);
      } else {
        throw new Error(data.error || "Failed to fetch");
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: "assistant",
          content: t("error_unavailable"),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isDashboard || isAIPage) {
    return null;
  }

  return (
    <div className="fixed bottom-[88px] right-6 z-[60] sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute bottom-16 right-0 mb-4 w-[350px] max-w-[calc(100vw-48px)] overflow-hidden rounded-2xl bg-[#E7E9EB] shadow-2xl ring-1 ring-black/5 flex flex-col sm:mb-0 sm:bottom-[72px]"
            style={{ height: "500px" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-[#1B4F72] px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                <h3 className="font-medium">{t("title")}</h3>
              </div>
              <button
                onClick={toggleWidget}
                className="rounded-full p-1 hover:bg-white/20 transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 ${
                    msg.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      msg.role === "user"
                        ? "bg-[#5B8A6F] text-white"
                        : "bg-[#1B4F72] text-white"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                      msg.role === "user"
                        ? "bg-[#5B8A6F] text-white rounded-tr-none"
                        : "bg-[#E7E9EB] text-[#242424] rounded-tl-none"
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-start gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1B4F72] text-white">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-[#E7E9EB] text-[#242424] rounded-2xl rounded-tl-none px-4 py-3">
                    <div className="flex gap-1">
                      <motion.div
                        className="h-2 w-2 rounded-full bg-[#1B4F72]"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                      />
                      <motion.div
                        className="h-2 w-2 rounded-full bg-[#1B4F72]"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                      />
                      <motion.div
                        className="h-2 w-2 rounded-full bg-[#1B4F72]"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                      />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white p-3 border-t border-gray-200">
              <div className="relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t("input_placeholder")}
                  className="w-full resize-none rounded-xl border border-gray-300 bg-white py-3 pl-4 pr-12 text-sm text-[#242424] focus:border-[#1B4F72] focus:outline-none focus:ring-1 focus:ring-[#1B4F72]"
                  rows={1}
                  style={{ minHeight: "44px", maxHeight: "120px" }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute bottom-1.5 right-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-[#1B4F72] text-white transition-colors hover:bg-[#133A54] disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-[#E7E9EB] py-2 text-center border-t border-gray-300">
              <Link
                href={`/${locale}/pendampingan`}
                className="text-xs font-medium text-[#1B4F72] hover:underline"
              >
                {t("contact_human")}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleWidget}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#1B4F72] text-white shadow-lg focus:outline-none"
        aria-label="Open AI Assistant"
      >
        {/* Subtle pulse ring when closed */}
        {!isOpen && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#1B4F72] opacity-20"></span>
        )}
        {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </motion.button>
    </div>
  );
}
