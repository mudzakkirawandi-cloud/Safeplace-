"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Navbar from "../_components/Navbar";
import Footer from "../_components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, Heart, Shield, GraduationCap, 
  Users, TrendingUp, AlertCircle, Plus,
  MessageCircle, X, EyeOff, User
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";


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

export default function CommunityPage() {
  const t = useTranslations("community_page");
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState("latest");
  const [activeCategory, setActiveCategory] = useState("all");
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("share_story");
  const [newContent, setNewContent] = useState("");
  const [isAnon, setIsAnon] = useState(false);
  const [anonName, setAnonName] = useState("");
  const [hasTW, setHasTW] = useState(false);
  const [twText, setTwText] = useState("");

  const categories = [
    { id: "all", icon: Users, label: "Semua Kategori", color: "text-gray-600 bg-gray-100" },
    { id: "share_story", icon: Heart, label: t("cat_share_story"), color: "text-red-500 bg-red-50" },
    { id: "recovery", icon: Shield, label: t("cat_recovery"), color: "text-blue-500 bg-blue-50" },
    { id: "legal", icon: GraduationCap, label: t("cat_legal"), color: "text-purple-500 bg-purple-50" },
    { id: "qna", icon: MessageCircle, label: t("cat_qna"), color: "text-orange-500 bg-orange-50" },
    { id: "support", icon: Users, label: t("cat_support"), color: "text-green-500 bg-green-50" },
  ];

  const fetchPosts = async () => {
    setIsLoading(true);
    let query = supabase.from("community_posts").select("*").eq("status", "published");

    if (activeCategory !== "all") {
      query = query.eq("category", activeCategory);
    }

    if (activeTab === "latest") {
      query = query.order("created_at", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data, error } = await query.limit(20);

    if (!error && data) {
      setPosts(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, activeCategory]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      alert("Anda harus login untuk membuat post");
      return;
    }

    const { error } = await supabase.from("community_posts").insert({
      user_id: userData.user.id,
      title: newTitle,
      content: newContent,
      category: newCategory,
      is_anonymous: isAnon,
      display_name: isAnon ? (anonName || t("anonymous_user")) : null,
      has_trigger_warning: hasTW,
      trigger_warning_text: hasTW ? twText : null,
    });

    if (!error) {
      setIsModalOpen(false);
      setNewTitle("");
      setNewContent("");
      setNewCategory("share_story");
      setIsAnon(false);
      setAnonName("");
      setHasTW(false);
      setTwText("");
      fetchPosts();
    } else {
      alert("Gagal membuat post: " + error.message);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FAFBFF]">
      <Navbar />
      <main className="flex-1 pt-28 pb-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#1B4F72]">{t("title")}</h1>
              <p className="mt-2 text-gray-600">{t("subtitle")}</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#1B4F72] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#133A54]"
            >
              <Plus className="h-5 w-5" />
              {t("create_post")}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            
            {/* Left Sidebar */}
            <div className="lg:col-span-3 space-y-6">
              <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
                <h2 className="mb-4 font-semibold text-gray-900">{t("tab_categories")}</h2>
                <nav className="space-y-1">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={cat.id === "all" ? `/${locale}/komunitas` : `/${locale}/komunitas/${cat.id}`}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        activeCategory === cat.id
                          ? "bg-[#1B4F72]/10 text-[#1B4F72]"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <div className={`flex h-8 w-8 items-center justify-center rounded-md ${cat.color}`}>
                        <cat.icon className="h-4 w-4" />
                      </div>
                      {cat.label}
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100 hidden md:block">
                <h2 className="mb-4 font-semibold text-gray-900">{t("stats_title")}</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{t("stats_members")}</span>
                    <span className="font-semibold text-gray-900">1,245</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{t("stats_posts")}</span>
                    <span className="font-semibold text-gray-900">856</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{t("stats_online")}</span>
                    <span className="flex items-center gap-1.5 font-semibold text-green-600">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                      </span>
                      42
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content (Feed) */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Tabs */}
              <div className="flex gap-4 border-b border-gray-200">
                <button
                  onClick={() => setActiveTab("latest")}
                  className={`pb-4 text-sm font-medium transition-colors ${
                    activeTab === "latest"
                      ? "border-b-2 border-[#1B4F72] text-[#1B4F72]"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {t("tab_latest")}
                </button>
                <button
                  onClick={() => setActiveTab("popular")}
                  className={`pb-4 text-sm font-medium transition-colors ${
                    activeTab === "popular"
                      ? "border-b-2 border-[#1B4F72] text-[#1B4F72]"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {t("tab_popular")}
                </button>
              </div>

              {/* Posts Feed */}
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                      <div className="mb-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                        <div className="space-y-2">
                          <div className="h-4 w-24 rounded bg-gray-200"></div>
                          <div className="h-3 w-16 rounded bg-gray-200"></div>
                        </div>
                      </div>
                      <div className="mb-2 h-5 w-3/4 rounded bg-gray-200"></div>
                      <div className="h-4 w-full rounded bg-gray-200"></div>
                    </div>
                  ))}
                </div>
              ) : posts.length === 0 ? (
                <div className="rounded-2xl bg-white p-12 text-center shadow-sm border border-gray-100">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-gray-400">
                    <MessageSquare className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">{t("empty_state")}</h3>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div key={post.id} className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 transition-shadow hover:shadow-md">
                      
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                            post.is_anonymous ? "bg-gray-100 text-gray-500" : "bg-[#1B4F72] text-white"
                          }`}>
                            {post.is_anonymous ? <EyeOff className="h-5 w-5" /> : <User className="h-5 w-5" />}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {post.is_anonymous ? (post.display_name || t("anonymous_user")) : "User"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(post.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                          {categories.find(c => c.id === post.category)?.label || post.category}
                        </span>
                      </div>

                      {post.has_trigger_warning && (
                        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800 flex items-start gap-2">
                          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold">Trigger Warning:</span> {post.trigger_warning_text}
                          </div>
                        </div>
                      )}

                      <h3 className="mb-2 text-lg font-bold text-gray-900">{post.title}</h3>
                      <p className="mb-4 text-gray-600 line-clamp-3">{post.content}</p>

                      <div className="flex items-center gap-4 border-t border-gray-100 pt-4">
                        <button className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-[#1B4F72]">
                          <Heart className="h-4 w-4" /> 0
                        </button>
                        <button className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-[#1B4F72]">
                          <MessageCircle className="h-4 w-4" /> {t("comments")}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="hidden lg:block lg:col-span-3 space-y-6">
              <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
                <div className="mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                  <h2 className="font-semibold text-gray-900">{t("trending_title")}</h2>
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="group cursor-pointer">
                      <h4 className="text-sm font-medium text-gray-900 group-hover:text-[#1B4F72] line-clamp-2">
                        Pentingnya menjaga kesehatan mental selama proses hukum
                      </h4>
                      <p className="mt-1 text-xs text-gray-500">24 {t("comments")}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-blue-50 p-5 border border-blue-100">
                <h2 className="mb-3 font-semibold text-[#1B4F72]">{t("guidelines_title")}</h2>
                <ul className="space-y-2 text-sm text-[#1B4F72]/80">
                  <li className="flex gap-2">
                    <span className="font-bold">•</span> {t("guidelines_1")}
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold">•</span> {t("guidelines_2")}
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold">•</span> {t("guidelines_3")}
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold">•</span> {t("guidelines_4")}
                  </li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />

      {/* Create Post Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <h3 className="text-xl font-bold text-gray-900">{t("create_post")}</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleCreatePost} className="p-6">
                <div className="space-y-5">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Judul Post</label>
                    <input
                      required
                      type="text"
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-[#1B4F72] focus:outline-none focus:ring-1 focus:ring-[#1B4F72]"
                      placeholder="Judul singkat yang menggambarkan isi post..."
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Kategori</label>
                    <select
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 bg-white focus:border-[#1B4F72] focus:outline-none focus:ring-1 focus:ring-[#1B4F72]"
                    >
                      {categories.filter(c => c.id !== "all").map(c => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Isi Post</label>
                    <textarea
                      required
                      rows={5}
                      value={newContent}
                      onChange={e => setNewContent(e.target.value)}
                      className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 focus:border-[#1B4F72] focus:outline-none focus:ring-1 focus:ring-[#1B4F72]"
                      placeholder="Ceritakan dengan detail..."
                    />
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAnon}
                        onChange={e => setIsAnon(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-[#1B4F72] focus:ring-[#1B4F72]"
                      />
                      <span className="text-sm font-medium text-gray-700">Post sebagai Anonim</span>
                    </label>
                    
                    {isAnon && (
                      <div className="pl-7">
                        <input
                          type="text"
                          value={anonName}
                          onChange={e => setAnonName(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1B4F72] focus:outline-none"
                          placeholder="Nama Tampil (contoh: Pejuang123) - opsional"
                        />
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border border-red-100 bg-red-50/50 p-4 space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasTW}
                        onChange={e => setHasTW(e.target.checked)}
                        className="h-4 w-4 rounded border-red-300 text-red-600 focus:ring-red-600"
                      />
                      <span className="text-sm font-medium text-red-800">Tambahkan Trigger Warning</span>
                    </label>
                    
                    {hasTW && (
                      <div className="pl-7">
                        <input
                          type="text"
                          required
                          value={twText}
                          onChange={e => setTwText(e.target.value)}
                          className="w-full rounded-lg border border-red-200 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
                          placeholder="Contoh: Menyebutkan kekerasan fisik, manipulasi"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#1B4F72] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#133A54]"
                  >
                    Kirim Post
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
