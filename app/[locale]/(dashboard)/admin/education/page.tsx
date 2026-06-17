"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "../../../../../lib/supabase/client";
import { Plus, Edit2, Trash2, X, PlayCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface EducationContent {
  id: string;
  title: string;
  description?: string;
  category: string;
  content_type: string;
  url?: string;
  thumbnail_url?: string;
  display_order: number;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export default function AdminEducationPage() {
  const t = useTranslations("admin");
  const supabase = createClient();
  
  const [contents, setContents] = useState<EducationContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<EducationContent | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "pencegahan",
    content_type: "video",
    url: "",
    thumbnail_url: "",
    display_order: 0,
    status: "draft"
  });

  const fetchContents = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("education_content")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (data) {
      setContents(data as EducationContent[]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchContents();
  }, [fetchContents]);

  const openModal = (content: EducationContent | null = null) => {
    if (content) {
      setEditingContent(content);
      setFormData({
        title: content.title,
        description: content.description || "",
        category: content.category,
        content_type: content.content_type,
        url: content.url || "",
        thumbnail_url: content.thumbnail_url || "",
        display_order: content.display_order,
        status: content.status
      });
    } else {
      setEditingContent(null);
      setFormData({
        title: "",
        description: "",
        category: "pencegahan",
        content_type: "video",
        url: "",
        thumbnail_url: "",
        display_order: 0,
        status: "draft"
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingContent) {
      await supabase
        .from("education_content")
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq("id", editingContent.id);
    } else {
      await supabase
        .from("education_content")
        .insert([{
          ...formData
        }]);
    }
    
    setIsModalOpen(false);
    fetchContents();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this content?")) {
      await supabase.from("education_content").delete().eq("id", id);
      fetchContents();
    }
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/)?.[1];
    return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : "";
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("education_title")}</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola materi edukasi untuk pengguna</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-[#1B4F72] hover:bg-[#1B4F72]/90 text-white px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          {t("btn_add_content")}
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-gray-50/50 text-gray-700 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">{t("table_col_title")}</th>
                <th className="px-6 py-4">{t("table_col_category")}</th>
                <th className="px-6 py-4">{t("table_col_type")}</th>
                <th className="px-6 py-4">{t("table_col_status")}</th>
                <th className="px-6 py-4 text-right">{t("table_col_action")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">Loading...</td>
                </tr>
              ) : contents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">Belum ada konten.</td>
                </tr>
              ) : (
                contents.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {item.title}
                      {item.content_type === 'video' && <PlayCircle size={14} className="inline ml-2 text-red-500" />}
                    </td>
                    <td className="px-6 py-4 capitalize">{item.category}</td>
                    <td className="px-6 py-4 capitalize">{item.content_type}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        item.status === 'published' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => openModal(item)}
                          className="p-1.5 text-gray-400 hover:text-[#4A90B8] hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingContent ? "Edit Konten Edukasi" : "Tambah Konten Edukasi"}
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
                    <input 
                      type="text" 
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A90B8]/20 focus:border-[#4A90B8]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                    <textarea 
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A90B8]/20 focus:border-[#4A90B8]"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                      <select 
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A90B8]/20 focus:border-[#4A90B8]"
                      >
                        <option value="pencegahan">Pencegahan</option>
                        <option value="penanganan">Penanganan</option>
                        <option value="hukum">Hukum & Regulasi</option>
                        <option value="pemulihan">Pemulihan</option>
                        <option value="regulasi">Regulasi</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Konten</label>
                      <select 
                        value={formData.content_type}
                        onChange={(e) => setFormData({...formData, content_type: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A90B8]/20 focus:border-[#4A90B8]"
                      >
                        <option value="video">Video (YouTube)</option>
                        <option value="pdf">PDF</option>
                        <option value="article">Artikel</option>
                        <option value="link">Tautan Eksternal</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL / Link</label>
                    <input 
                      type="url" 
                      value={formData.url}
                      onChange={(e) => setFormData({...formData, url: e.target.value})}
                      placeholder="https://"
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A90B8]/20 focus:border-[#4A90B8]"
                    />
                  </div>

                  {formData.content_type === 'video' && formData.url && (
                    <div className="mt-2 rounded-xl overflow-hidden bg-gray-100 aspect-video">
                      {getEmbedUrl(formData.url) ? (
                        <iframe 
                          className="w-full h-full"
                          src={getEmbedUrl(formData.url)} 
                          title="YouTube preview"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                          allowFullScreen
                        ></iframe>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                          URL YouTube tidak valid
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL (Opsional)</label>
                    <input 
                      type="url" 
                      value={formData.thumbnail_url}
                      onChange={(e) => setFormData({...formData, thumbnail_url: e.target.value})}
                      placeholder="https://"
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A90B8]/20 focus:border-[#4A90B8]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select 
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A90B8]/20 focus:border-[#4A90B8]"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Urutan Tampil</label>
                      <input 
                        type="number" 
                        value={formData.display_order}
                        onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value) || 0})}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A90B8]/20 focus:border-[#4A90B8]"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-50 font-medium rounded-xl transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-2 bg-[#1B4F72] hover:bg-[#1B4F72]/90 text-white font-medium rounded-xl transition-colors"
                  >
                    Simpan
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
