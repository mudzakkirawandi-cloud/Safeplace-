"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import { Bot, Send, User, FileText, Search, Users, BookOpen, Phone, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";

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
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

  const quickActions = [
    { href: `/${locale}/report/start`, icon: FileText, label: t("qa_report_start") },
    { href: `/${locale}/report/dashboard`, icon: Search, label: t("qa_report_track") },
    { href: `/${locale}/pendampingan`, icon: Users, label: t("qa_consultant") },
    { href: `/${locale}/edukasi`, icon: BookOpen, label: t("qa_education") },
    { href: `/${locale}/report/resources`, icon: Phone, label: t("qa_emergency") },
  ];

  return (
    <div className="min-h-screen bg-[#E7E9EB] py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary sm:text-4xl">{t("title")}</h1>
          <p className="mt-2 text-[#242424]">{t("page_subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Quick Actions */}
          <div className="order-1 lg:order-2 space-y-6">
            <div className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-black/5">
              <h2 className="mb-4 text-lg font-semibold text-primary">{t("quick_actions_title")}</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    href={action.href}
                    className="flex items-center gap-3 rounded-xl border border-border p-3 text-[#242424] transition-colors hover:border-[#1B4F72] hover:bg-primary/5"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E7E9EB] text-primary">
                      <action.icon className="h-5 w-5" />
                    </div>
                    <span className="font-medium">{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Disclaimer */}
            <div className="rounded-2xl bg-amber-50 p-6 shadow-sm ring-1 ring-amber-200">
              <div className="flex items-start gap-3 text-amber-800">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                <p className="text-sm leading-relaxed">{t("disclaimer")}</p>
              </div>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="order-2 lg:order-1 lg:col-span-2">
            <div className="flex h-[600px] flex-col overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-black/5">
              <div className="flex items-center gap-3 bg-primary px-6 py-4 text-white">
                <Bot className="h-6 w-6" />
                <h2 className="font-semibold">{t("title")}</h2>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-card">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${
                      msg.role === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                        msg.role === "user"
                          ? "bg-primary text-white"
                          : "bg-primary text-white"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <User className="h-5 w-5" />
                      ) : (
                        <Bot className="h-5 w-5" />
                      )}
                    </div>
                    <div
                      className={`max-w-[80%] rounded-2xl px-5 py-3 shadow-sm ${
                        msg.role === "user"
                          ? "bg-primary text-white rounded-tr-none"
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
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div className="bg-[#E7E9EB] text-[#242424] rounded-2xl rounded-tl-none px-5 py-4 shadow-sm">
                      <div className="flex gap-1.5">
                        <motion.div
                          className="h-2.5 w-2.5 rounded-full bg-primary"
                          animate={{ y: [0, -6, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                        />
                        <motion.div
                          className="h-2.5 w-2.5 rounded-full bg-primary"
                          animate={{ y: [0, -6, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                        />
                        <motion.div
                          className="h-2.5 w-2.5 rounded-full bg-primary"
                          animate={{ y: [0, -6, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                        />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-border bg-muted p-4">
                <div className="relative">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t("input_placeholder")}
                    className="w-full resize-none rounded-xl border border-gray-300 bg-card py-3.5 pl-4 pr-14 text-base text-[#242424] focus:border-[#1B4F72] focus:outline-none focus:ring-1 focus:ring-[#1B4F72] shadow-sm"
                    rows={1}
                    style={{ minHeight: "52px", maxHeight: "150px" }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white transition-colors hover:bg-[#133A54] disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
