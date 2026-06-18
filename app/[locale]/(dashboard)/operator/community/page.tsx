"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { 
  Search, 
  EyeOff, 
  Trash2, 
  CheckCircle,
  AlertCircle
} from "lucide-react";

type Post = {
  id: string;
  category: string;
  title: string;
  content: string;
  is_anonymous: boolean;
  display_name: string | null;
  status: string;
  created_at: string;
  user_id: string;
  removed_reason: string | null;
};

export default function OperatorCommunityPage() {
  const t = useTranslations("operator");
  const supabase = createClient();

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, reported, hidden
  const [searchTerm, setSearchTerm] = useState("");

  const fetchPosts = async () => {
    setIsLoading(true);
    
    // In a real app, we would join with users to filter by campus_id
    // For now we fetch posts based on the filter
    let query = supabase.from("community_posts").select("*").order("created_at", { ascending: false });

    if (filter === "hidden") {
      query = query.eq("status", "hidden");
    } else if (filter === "reported") {
      // If we had a reported status or a reports table for posts.
      // Assuming 'hidden' and 'removed' are the mod statuses.
      // If we don't have 'reported' status, we'll just show 'published' for 'all'.
      // For now let's just use status != 'removed'
    }

    const { data, error } = await query;
    if (data && !error) {
      setPosts(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleUpdateStatus = async (postId: string, newStatus: string) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { error } = await supabase
      .from("community_posts")
      .update({ 
        status: newStatus,
        removed_by: newStatus === 'hidden' || newStatus === 'removed' ? userData.user.id : null
      })
      .eq("id", postId);

    if (!error) {
      fetchPosts();
    } else {
      alert("Error updating post status");
    }
  };

  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">{t("community_title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("community_subtitle")}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-2xl border border-border shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari post..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7B5EA7]/20 focus:border-[#7B5EA7]"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={() => setFilter("all")}
            className={`px-4 py-2 text-sm font-medium rounded-xl flex-1 sm:flex-none ${filter === "all" ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-gray-100"}`}
          >
            {t("filter_all")}
          </button>
          <button 
            onClick={() => setFilter("hidden")}
            className={`px-4 py-2 text-sm font-medium rounded-xl flex-1 sm:flex-none ${filter === "hidden" ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-gray-100"}`}
          >
            {t("filter_hidden")}
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">{t("table_col_title")}</th>
                <th className="px-6 py-4 font-medium">{t("table_col_author")}</th>
                <th className="px-6 py-4 font-medium">{t("table_col_category")}</th>
                <th className="px-6 py-4 font-medium">{t("table_col_status")}</th>
                <th className="px-6 py-4 font-medium text-right">{t("table_col_action")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-[#7B5EA7]/30 border-t-[#7B5EA7] rounded-full animate-spin mb-4" />
                      <p className="text-muted-foreground">Memuat data...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
                      <p className="text-muted-foreground">{t("empty_state")}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-foreground max-w-xs truncate" title={post.title}>{post.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 max-w-xs truncate" title={post.content}>{post.content}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {post.is_anonymous ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-100 text-muted-foreground text-xs font-medium">
                            <EyeOff className="w-3 h-3" />
                            {post.display_name || "Anonim"}
                          </span>
                        ) : (
                          <span className="text-foreground font-medium">User</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg">
                        {post.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {post.status === "published" ? (
                        <span className="inline-flex items-center gap-1.5 text-green-600 text-xs font-medium bg-green-50 px-2.5 py-1 rounded-lg">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Published
                        </span>
                      ) : post.status === "hidden" ? (
                        <span className="inline-flex items-center gap-1.5 text-orange-600 text-xs font-medium bg-orange-50 px-2.5 py-1 rounded-lg">
                          <EyeOff className="w-3.5 h-3.5" />
                          Hidden
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-red-600 text-xs font-medium bg-red-50 px-2.5 py-1 rounded-lg">
                          <Trash2 className="w-3.5 h-3.5" />
                          Removed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {post.status !== "published" && (
                          <button
                            onClick={() => handleUpdateStatus(post.id, "published")}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title={t("btn_mark_safe")}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {post.status !== "hidden" && (
                          <button
                            onClick={() => handleUpdateStatus(post.id, "hidden")}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title={t("btn_hide")}
                          >
                            <EyeOff className="w-4 h-4" />
                          </button>
                        )}
                        {post.status !== "removed" && (
                          <button
                            onClick={() => handleUpdateStatus(post.id, "removed")}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title={t("btn_delete")}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
