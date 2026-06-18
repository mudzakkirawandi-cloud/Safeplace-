"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Bot, Send, User, FileText, Search, UserCheck, BookOpen, Phone, ChevronRight } from "lucide-react";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";
import { motion } from "framer-motion";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function AIAssistantPage() {
  const t = useTranslations("ai_agent");
  const locale = useLocale();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Rate limit: 20 user messages per session
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

  const quickActions = [
    { icon: FileText, label: t("qa_report_start"), href: `/${locale}/report/start`, color: "bg-blue-100 text-blue-700" },
    { icon: Search, label: t("qa_report_track"), href: `/${locale}/report/track`, color: "bg-purple-100 text-purple-700" },
    { icon: UserCheck, label: t("qa_consultant"), href: `/${locale}/pendampingan`, color: "bg-green-100 text-green-700" },
    { icon: BookOpen, label: t("qa_education"), href: `/${locale}/edukasi`, color: "bg-amber-100 text-amber-700" },
    { icon: Phone, label: t("qa_emergency"), href: `/${locale}/report/resources`, color: "bg-red-100 text-red-700" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-[#1B4F72] text-white rounded-xl flex items-center justify-center shadow-md">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{t("title")}</h1>
              <p className="text-sm text-gray-500">{t("page_subtitle")}</p>
            </div>
          </div>
          <Link
            href={`/${locale}/pendampingan`}
            className="hidden sm:flex items-center gap-2 text-sm font-medium text-[#1B4F72] hover:bg-blue-50 px-4 py-2 rounded-full transition-colors border border-blue-100"
          >
            {t("contact_human")} <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
          
          {/* Quick Actions (Mobile: Top, Desktop: Right Sidebar) */}
          <div className="lg:col-span-1 lg:order-2 flex flex-col gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
              <h2 className="font-semibold text-gray-900 mb-4">{t("quick_actions_title")}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-3">
                {quickActions.map((action, idx) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={idx}
                      href={action.href}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100 shadow-sm group"
                    >
                      <div className={`h-10 w-10 shrink-0 rounded-lg flex items-center justify-center ${action.color} group-hover:scale-105 transition-transform`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{action.label}</span>
                    </Link>
                  );
                })}
              </div>
              
              {/* Mobile Only Call to Action */}
              <div className="mt-4 sm:hidden">
                <Link
                  href={`/${locale}/pendampingan`}
                  className="flex items-center justify-center gap-2 text-sm font-medium text-[#1B4F72] hover:bg-blue-50 px-4 py-3 rounded-xl transition-colors border border-blue-100 w-full"
                >
                  {t("contact_human")}
                </Link>
              </div>
            </div>
          </div>

          {/* Chat Interface (Mobile: Bottom, Desktop: Left) */}
          <div className="lg:col-span-3 lg:order-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-full">
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 sm:gap-4 ${
                    msg.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-sm ${
                      msg.role === "user"
                        ? "bg-[#5B8A6F] text-white"
                        : "bg-[#1B4F72] text-white"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <User className="h-5 w-5" />
                    ) : (
                      <Bot className="h-5 w-5" />
                    )}
                  </div>
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3.5 text-[15px] shadow-sm ${
                      msg.role === "user"
                        ? "bg-[#5B8A6F] text-white rounded-tr-none"
                        : "bg-[#F3F4F6] text-[#1F2937] rounded-tl-none border border-gray-100"
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1B4F72] text-white shadow-sm">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div className="bg-[#F3F4F6] border border-gray-100 text-[#1F2937] rounded-2xl rounded-tl-none px-5 py-4 shadow-sm">
                    <div className="flex gap-1.5">
                      <motion.div
                        className="h-2 w-2 rounded-full bg-[#1B4F72]/80"
                        animate={{ y: [0, -6, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                      />
                      <motion.div
                        className="h-2 w-2 rounded-full bg-[#1B4F72]/80"
                        animate={{ y: [0, -6, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                      />
                      <motion.div
                        className="h-2 w-2 rounded-full bg-[#1B4F72]/80"
                        animate={{ y: [0, -6, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                      />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white p-4 border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
              <div className="relative flex max-w-4xl mx-auto items-end gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t("input_placeholder")}
                  className="w-full resize-none rounded-2xl border-2 border-gray-200 bg-gray-50 py-3.5 pl-5 pr-14 text-[15px] text-gray-900 focus:border-[#1B4F72] focus:bg-white focus:outline-none focus:ring-0 transition-all"
                  rows={1}
                  style={{ minHeight: "54px", maxHeight: "150px" }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute bottom-2 right-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1B4F72] text-white transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 shadow-md"
                >
                  <Send className="h-5 w-5 ml-0.5" />
                </button>
              </div>
              <div className="text-center mt-3 text-xs text-gray-400">
                {t("disclaimer")}
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
