"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import Navbar from "../../../../_components/Navbar";
import Footer from "../../../../_components/Footer";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { 
  ArrowLeft, AlertTriangle, EyeOff, User, 
  Send, Heart, MessageCircle
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

// Define Types
type Post = {
  id: string;
  category: string;
  title: string;
  content: string;
  is_anonymous: boolean;
  display_name: string | null;
  has_trigger_warning: boolean;
  trigger_warning_text: string | null;
  status: string;
  created_at: string;
  user_id: string;
};

type Reply = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  is_anonymous: boolean;
  display_name: string | null;
  created_at: string;
  status: string;
};

type Reaction = {
  id: string;
  post_id: string;
  user_id: string;
  reaction_type: "support" | "strong" | "hug" | "thanks";
  created_at: string;
};

export default function PostDetailPage({ params }: { params: { id: string } }) {
  const t = useTranslations("community_page");
  const locale = useLocale();
  const supabase = createClient();
  const postId = params.id;

  const [post, setPost] = useState<Post | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // States for interaction
  const [showContent, setShowContent] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isAnonReply, setIsAnonReply] = useState(false);
  const [anonNameReply, setAnonNameReply] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUserId(data.user?.id || null);
    };
    fetchUser();
  }, [supabase]);

  const fetchPostData = async () => {
    setIsLoading(true);
    
    // Fetch Post
    const { data: postData, error: postError } = await supabase
      .from("community_posts")
      .select("*")
      .eq("id", postId)
      .eq("status", "published")
      .single();

    if (postError || !postData) {
      setIsLoading(false);
      return;
    }
    setPost(postData);

    // Initial showContent logic
    setShowContent(!postData.has_trigger_warning);

    // Fetch Replies
    const { data: repliesData } = await supabase
      .from("community_replies")
      .select("*")
      .eq("post_id", postId)
      .eq("status", "published")
      .order("created_at", { ascending: true });
    
    if (repliesData) setReplies(repliesData);

    // Fetch Reactions
    const { data: reactionsData } = await supabase
      .from("community_reactions")
      .select("*")
      .eq("post_id", postId);
    
    if (reactionsData) setReactions(reactionsData);

    setIsLoading(false);
  };

  useEffect(() => {
    fetchPostData();

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`room_${postId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_replies', filter: `post_id=eq.${postId}` }, payload => {
        fetchPostData(); 
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_reactions', filter: `post_id=eq.${postId}` }, payload => {
        fetchPostData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, supabase]);

  const handleReaction = async (type: "support" | "strong" | "hug" | "thanks") => {
    if (!currentUserId) {
      alert("Anda harus login untuk memberikan reaksi");
      return;
    }

    const existingReaction = reactions.find(r => r.user_id === currentUserId && r.reaction_type === type);

    if (existingReaction) {
      await supabase.from("community_reactions").delete().eq("id", existingReaction.id);
    } else {
      await supabase.from("community_reactions").insert({
        post_id: postId,
        user_id: currentUserId,
        reaction_type: type
      });
    }
    // Realtime will trigger fetchPostData to update UI
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) {
      alert("Anda harus login untuk membalas");
      return;
    }
    if (!replyContent.trim()) return;

    setIsSubmittingReply(true);

    const { error } = await supabase.from("community_replies").insert({
      post_id: postId,
      user_id: currentUserId,
      content: replyContent,
      is_anonymous: isAnonReply,
      display_name: isAnonReply ? (anonNameReply || t("anonymous_user")) : null,
    });

    setIsSubmittingReply(false);

    if (!error) {
      setReplyContent("");
      setIsAnonReply(false);
      setAnonNameReply("");
    } else {
      alert("Gagal mengirim balasan: " + error.message);
    }
  };

  // Reactions mapping
  const reactionConfig = {
    support: { icon: "🤍", label: t("reaction_support") },
    strong: { icon: "💪", label: t("reaction_strong") },
    hug: { icon: "🫂", label: t("reaction_hug") },
    thanks: { icon: "🙏", label: t("reaction_thanks") },
  };

  const getReactionCount = (type: string) => reactions.filter(r => r.reaction_type === type).length;
  const hasUserReacted = (type: string) => currentUserId ? reactions.some(r => r.user_id === currentUserId && r.reaction_type === type) : false;

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#FAFBFF]">
        <Navbar />
        <main className="flex-1 pt-32 pb-16 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B4F72]"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FAFBFF]">
      <Navbar />
      <main className="flex-1 pt-28 pb-16">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          
          <Link href={`/${locale}/komunitas`} className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#1B4F72] mb-6">
            <ArrowLeft className="h-4 w-4" />
            {t("back_to_feed")}
          </Link>

          {/* Post Detail */}
          <div className="rounded-2xl bg-white p-6 md:p-8 shadow-sm border border-gray-100 mb-8">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                  post.is_anonymous ? "bg-gray-100 text-gray-500" : "bg-[#1B4F72] text-white"
                }`}>
                  {post.is_anonymous ? <EyeOff className="h-6 w-6" /> : <User className="h-6 w-6" />}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-lg">
                    {post.is_anonymous ? (post.display_name || t("anonymous_user")) : "User"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(post.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <h1 className="mb-4 text-2xl font-bold text-gray-900">{post.title}</h1>

            {/* Content Area with Trigger Warning Handling */}
            {post.has_trigger_warning && !showContent ? (
              <div className="rounded-xl bg-red-50 p-6 text-center border border-red-100">
                <AlertTriangle className="mx-auto h-8 w-8 text-red-500 mb-3" />
                <p className="font-semibold text-red-800 mb-1">Trigger Warning</p>
                <p className="text-sm text-red-600 mb-4">{t("trigger_warning_hidden")} <br/><span className="font-medium">"{post.trigger_warning_text}"</span></p>
                <button 
                  onClick={() => setShowContent(true)}
                  className="rounded-lg bg-white px-5 py-2 text-sm font-semibold text-red-700 shadow-sm border border-red-200 hover:bg-red-50 transition"
                >
                  {t("trigger_warning_show")}
                </button>
              </div>
            ) : (
              <div>
                {post.has_trigger_warning && (
                  <div className="mb-4 flex items-center justify-between rounded-lg bg-red-50 p-3 text-sm border border-red-100">
                    <div className="flex items-center gap-2 text-red-800">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span><span className="font-semibold">TW:</span> {post.trigger_warning_text}</span>
                    </div>
                    <button onClick={() => setShowContent(false)} className="text-red-600 hover:text-red-800 underline text-xs font-medium">
                      {t("trigger_warning_hide")}
                    </button>
                  </div>
                )}
                <div className="prose max-w-none text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {post.content}
                </div>
              </div>
            )}

            {/* Empathetic Reactions */}
            <div className="mt-8 border-t border-gray-100 pt-6">
              <div className="flex flex-wrap gap-3">
                {(Object.keys(reactionConfig) as Array<keyof typeof reactionConfig>).map((type) => {
                  const rType = type as "support" | "strong" | "hug" | "thanks";
                  const count = getReactionCount(rType);
                  const isReacted = hasUserReacted(rType);
                  return (
                    <button
                      key={type}
                      onClick={() => handleReaction(rType)}
                      className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                        isReacted 
                          ? "bg-[#1B4F72] text-white shadow-md shadow-[#1B4F72]/20" 
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      <span>{reactionConfig[rType].icon}</span>
                      <span>{reactionConfig[rType].label}</span>
                      {count > 0 && (
                        <span className={`ml-1 rounded-full px-2 py-0.5 text-xs ${isReacted ? "bg-white/20" : "bg-gray-200"}`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Replies Section */}
          <div className="rounded-2xl bg-white p-6 md:p-8 shadow-sm border border-gray-100">
            <h3 className="mb-6 text-xl font-bold text-gray-900 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-[#1B4F72]" /> 
              {t("replies_title")} <span className="text-gray-400 text-base font-normal">({replies.length})</span>
            </h3>

            {/* Reply Form */}
            <form onSubmit={handleReplySubmit} className="mb-8">
              <div className="flex gap-4">
                <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1B4F72] text-white">
                  <User className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-3">
                  <textarea
                    required
                    rows={3}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder={t("reply_placeholder")}
                    className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 focus:border-[#1B4F72] focus:outline-none focus:ring-1 focus:ring-[#1B4F72]"
                  />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAnonReply}
                        onChange={(e) => setIsAnonReply(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-[#1B4F72] focus:ring-[#1B4F72]"
                      />
                      <span className="text-sm text-gray-600">{t("reply_anon_toggle")}</span>
                    </label>
                    
                    {isAnonReply && (
                      <input
                        type="text"
                        value={anonNameReply}
                        onChange={(e) => setAnonNameReply(e.target.value)}
                        placeholder="Nama anonim (opsional)"
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-[#1B4F72] focus:outline-none"
                      />
                    )}
                    
                    <button
                      type="submit"
                      disabled={isSubmittingReply}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1B4F72] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#133A54] disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                      {isSubmittingReply ? "..." : t("reply_submit")}
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {/* Replies List */}
            <div className="space-y-6">
              {replies.length === 0 ? (
                <p className="text-center text-gray-500 py-4">Belum ada balasan. Jadilah yang pertama memberikan dukungan!</p>
              ) : (
                replies.map((reply) => (
                  <div key={reply.id} className="flex gap-4">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      reply.is_anonymous ? "bg-gray-100 text-gray-500" : "bg-[#1B4F72] text-white"
                    }`}>
                      {reply.is_anonymous ? <EyeOff className="h-5 w-5" /> : <User className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 rounded-2xl bg-gray-50 p-4 border border-gray-100">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="font-semibold text-gray-900 text-sm">
                          {reply.is_anonymous ? (reply.display_name || t("anonymous_user")) : "User"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(reply.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-gray-800 text-sm whitespace-pre-wrap">{reply.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
