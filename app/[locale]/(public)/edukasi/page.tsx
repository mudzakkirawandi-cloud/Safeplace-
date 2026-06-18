"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { createClient } from "../../../../lib/supabase/client";
import Navbar from "../_components/Navbar";
import Footer from "../_components/Footer";
import { PlayCircle, FileText, ExternalLink, Download } from "lucide-react";

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

export default function EducationPage() {
  const t = useTranslations("homepage.education");
  const supabase = createClient();
  
  const [materials, setMaterials] = useState<EducationContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  const fetchContent = useCallback(async () => {
    const { data } = await supabase
      .from("education_content")
      .select("*")
      .eq("status", "published")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (data) {
      setMaterials(data as EducationContent[]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const categories = [
    { id: "all", label: t("filter_all") },
    { id: "pencegahan", label: t("filter_prevention") },
    { id: "penanganan", label: t("filter_handling") },
    { id: "hukum", label: t("filter_law") },
    { id: "pemulihan", label: t("filter_recovery") },
  ];

  const filteredMaterials = activeCategory === "all" 
    ? materials 
    : materials.filter(m => m.category === activeCategory);

  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/)?.[1];
    return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : url;
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-display font-bold text-primary mb-4">
              {t("title")}
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("subtitle")}
            </p>
          </div>

          {/* Filter Categories */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat.id
                    ? "bg-primary text-white shadow-md"
                    : "bg-card text-muted-foreground hover:bg-muted border border-border"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Content Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-card rounded-2xl p-4 shadow-sm border border-border animate-pulse">
                  <div className="w-full h-48 bg-gray-200 rounded-xl mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
                </div>
              ))}
            </div>
          ) : filteredMaterials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredMaterials.map((item) => (
                <div key={item.id} className="bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-border flex flex-col">
                  {item.content_type === "video" && (
                    <div className="aspect-video w-full bg-gray-900">
                      <iframe 
                        className="w-full h-full"
                        src={item.url ? getEmbedUrl(item.url) : ''} 
                        title={item.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                      ></iframe>
                    </div>
                  )}
                  {(item.content_type === "pdf" || item.content_type === "article" || item.content_type === "link") && item.thumbnail_url && (
                    <div className="relative aspect-video w-full bg-gray-100 overflow-hidden">
                      <Image unoptimized src={item.thumbnail_url} alt={item.title} fill className="object-cover" />
                    </div>
                  )}
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="inline-block px-3 py-1 bg-gray-100 text-muted-foreground text-xs font-semibold rounded-full w-fit mb-3">
                      {categories.find(c => c.id === item.category)?.label || item.category}
                    </div>
                    <h3 className="text-xl font-bold text-primary mb-2 line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-6 flex-1 line-clamp-3">
                      {item.description}
                    </p>
                    
                    {item.content_type === "video" && item.url && (
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-4 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                      >
                        <PlayCircle size={18} /> {t("watch_video")}
                      </a>
                    )}
                    {item.content_type === "pdf" && item.file_path && (
                      <a 
                        href={item.file_path} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-4 bg-blue-50 text-primary hover:bg-blue-100 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                      >
                        <Download size={18} /> {t("download_pdf")}
                      </a>
                    )}
                    {(item.content_type === "article" || item.content_type === "link") && item.url && (
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-4 bg-muted text-card-foreground hover:bg-gray-100 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                      >
                        <ExternalLink size={18} /> {t("read_article")}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-card rounded-3xl border border-border shadow-sm">
              <FileText size={64} className="mx-auto text-gray-300 mb-6" />
              <h3 className="text-xl font-bold text-card-foreground mb-2">{t("empty_state")}</h3>
              <p className="text-muted-foreground">{t("empty_state")}</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
