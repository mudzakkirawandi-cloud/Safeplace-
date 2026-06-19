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
  file_path?: string;
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

  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadedFileSize, setUploadedFileSize] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "pencegahan",
    content_type: "video",
    url: "",
    thumbnail_url: "",
    file_path: "",
    display_order: 0,
    status: "draft"
  });

  const fetchContents = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("education_content")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching contents:", error);
    } else {
      console.log("Fetched education contents:", data);
    }

    if (data) {
      setContents(data as EducationContent[]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchContents();
  }, [fetchContents]);

  const openModal = (content: EducationContent | null = null) => {
    setUploadedFileName("");
    setUploadedFileSize("");
    if (content) {
      setEditingContent(content);
      setFormData({
        title: content.title,
        description: content.description || "",
        category: content.category,
        content_type: content.content_type,
        url: content.url || "",
        thumbnail_url: content.thumbnail_url || "",
        file_path: content.file_path || "",
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
        file_path: "",
        display_order: 0,
        status: "draft"
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let result;
      if (editingContent) {
        result = await supabase
          .from("education_content")
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq("id", editingContent.id)
          .select();
      } else {
        result = await supabase
          .from("education_content")
          .insert([{
            ...formData
          }])
          .select();
      }
      
      console.log("Supabase save result:", result);

      if (result.error) {
        console.error("Supabase Save Error:", result.error);
        alert(`Gagal menyimpan konten: ${result.error.message || result.error.details || result.error.hint}`);
        return;
      }
      
      alert("Konten edukasi berhasil disimpan!");
      setIsModalOpen(false);
      fetchContents();
    } catch (err: any) {
      console.error("Unexpected Save Error:", err);
      alert(`Terjadi kesalahan tidak terduga: ${err.message || 'Unknown error'}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this content?")) {
      await supabase.from("education_content").delete().eq("id", id);
      fetchContents();
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newUrl = e.target.value;
    setFormData((prev) => {
      const updated = { ...prev, url: newUrl };
      if (prev.content_type === 'video') {
        const videoId = newUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/)?.[1];
        if (videoId) {
          updated.thumbnail_url = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        }
      }
      return updated;
    });
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingPdf(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('education-content')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      setFormData(prev => ({ ...prev, file_path: data.path }));
      setUploadedFileName(file.name);
      setUploadedFileSize((file.size / 1024 / 1024).toFixed(2) + " MB");
    } catch (error) {
      console.error('Error uploading PDF:', error);
      alert('Gagal mengupload PDF. Pastikan bucket "education-content" tersedia dan public.');
    } finally {
      setUploadingPdf(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("education_title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola materi edukasi untuk pengguna</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          {t("btn_add_content")}
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-muted-foreground">
            <thead className="bg-muted/50 text-card-foreground text-xs uppercase font-semibold">
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
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Loading...</td>
                </tr>
              ) : contents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Belum ada konten.</td>
                </tr>
              ) : (
                contents.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">
                      {item.title}
                      {item.content_type === 'video' && <PlayCircle size={14} className="inline ml-2 text-red-500" />}
                    </td>
                    <td className="px-6 py-4 capitalize">{item.category}</td>
                    <td className="px-6 py-4 capitalize">{item.content_type}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        item.status === 'published' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-muted-foreground'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => openModal(item)}
                          className="p-1.5 text-muted-foreground hover:text-primary hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
              className="relative bg-card rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
                <h2 className="text-xl font-bold text-foreground">
                  {editingContent ? "Edit Konten Edukasi" : "Tambah Konten Edukasi"}
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-muted-foreground hover:text-muted-foreground hover:bg-muted rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-1">Judul</label>
                    <input 
                      type="text" 
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A90B8]/20 focus:border-[#4A90B8]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-1">Deskripsi</label>
                    <textarea 
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A90B8]/20 focus:border-[#4A90B8]"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-card-foreground mb-1">Kategori</label>
                      <select 
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A90B8]/20 focus:border-[#4A90B8]"
                      >
                        <option value="pencegahan">Pencegahan</option>
                        <option value="penanganan">Penanganan</option>
                        <option value="hukum">Hukum & Regulasi</option>
                        <option value="pemulihan">Pemulihan</option>
                        <option value="regulasi">Regulasi</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-card-foreground mb-1">Tipe Konten</label>
                      <select 
                        value={formData.content_type}
                        onChange={(e) => setFormData({...formData, content_type: e.target.value})}
                        className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A90B8]/20 focus:border-[#4A90B8]"
                      >
                        <option value="video">Video (YouTube)</option>
                        <option value="pdf">PDF</option>
                        <option value="article">Artikel</option>
                        <option value="link">Tautan Eksternal</option>
                      </select>
                    </div>
                  </div>

                  {formData.content_type === 'pdf' ? (
                    <div>
                      <label className="block text-sm font-medium text-card-foreground mb-1">Upload PDF</label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-border border-dashed rounded-xl">
                        <div className="space-y-1 text-center">
                          <svg className="mx-auto h-12 w-12 text-muted-foreground" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <div className="flex text-sm text-muted-foreground justify-center mt-4">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-card rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none">
                              <span>Pilih File PDF</span>
                              <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".pdf" onChange={handlePdfUpload} disabled={uploadingPdf} />
                            </label>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">Maksimal 10MB</p>
                        </div>
                      </div>
                      {uploadingPdf && <p className="text-sm text-blue-500 mt-2">Mengupload...</p>}
                      {uploadedFileName && (
                        <p className="text-sm text-green-600 mt-2">
                          Berhasil diupload: {uploadedFileName} ({uploadedFileSize})
                        </p>
                      )}
                      {formData.file_path && !uploadedFileName && (
                        <p className="text-sm text-muted-foreground mt-2">File saat ini: {formData.file_path}</p>
                      )}
                    </div>
                  ) : formData.content_type === 'article' ? (
                    <div>
                      <label className="block text-sm font-medium text-card-foreground mb-1">Konten Artikel</label>
                      <textarea 
                        rows={6}
                        value={formData.url}
                        onChange={handleUrlChange}
                        placeholder="Tulis konten artikel di sini..."
                        className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A90B8]/20 focus:border-[#4A90B8]"
                      ></textarea>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-card-foreground mb-1">URL / Link</label>
                      <input 
                        type="url" 
                        value={formData.url}
                        onChange={handleUrlChange}
                        placeholder="https://"
                        className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A90B8]/20 focus:border-[#4A90B8]"
                      />
                    </div>
                  )}

                  {formData.content_type === 'video' && formData.thumbnail_url && (
                    <div className="mt-2 rounded-xl overflow-hidden bg-gray-100 aspect-video flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={formData.thumbnail_url} 
                        alt="YouTube Thumbnail Preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-1">Thumbnail URL (Opsional)</label>
                    <input 
                      type="url" 
                      value={formData.thumbnail_url}
                      onChange={(e) => setFormData({...formData, thumbnail_url: e.target.value})}
                      placeholder="https://"
                      className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A90B8]/20 focus:border-[#4A90B8]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-card-foreground mb-1">Status</label>
                      <select 
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A90B8]/20 focus:border-[#4A90B8]"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-card-foreground mb-1">Urutan Tampil</label>
                      <input 
                        type="number" 
                        value={formData.display_order}
                        onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value) || 0})}
                        className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A90B8]/20 focus:border-[#4A90B8]"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-muted-foreground hover:bg-muted font-medium rounded-xl transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-2 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl transition-colors"
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
