"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { createClient } from "../../../../lib/supabase/client";
import Navbar from "../_components/Navbar";
import Footer from "../_components/Footer";
import { Users, Globe, MapPin, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export interface UserMetadata {
  avatar_url?: string;
  show_public?: boolean;
  is_online?: boolean;
  specialization?: string;
  bio?: string;
}

export interface Consultant {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
  show_public?: boolean;
  metadata?: UserMetadata;
}

export default function ConsultationPage() {
  const t = useTranslations("consultation");
  const router = useRouter();
  const supabase = createClient();
  
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  const fetchConsultants = useCallback(async () => {
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("role", "consultant")
      .eq("is_active", true);

    if (data) {
      const typedData = data as Consultant[];
      const publicConsultants = typedData.filter(c => c.show_public === true || c.metadata?.show_public === true);
      setConsultants(publicConsultants);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchConsultants();
  }, [fetchConsultants]);

  const filteredConsultants = activeFilter === "all" 
    ? consultants 
    : consultants.filter(c => c.metadata?.is_online === true);

  const getInitials = (name: string) => {
    if (!name) return "CS";
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  };

  const handleRequest = async (consultantId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/login?redirect=/report/intent");
    } else {
      router.push("/report/intent?consultant=" + consultantId);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFBFF]">
      <Navbar />
      <main className="flex-1 pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-display font-bold text-[#1B4F72] mb-4">
              {t("title")}
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t("subtitle")}
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeFilter === "all"
                  ? "bg-[#1B4F72] text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {t("filter_all")}
            </button>
            <button
              onClick={() => setActiveFilter("online")}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeFilter === "online"
                  ? "bg-[#1B4F72] text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {t("filter_online")}
            </button>
          </div>

          {/* Content Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                    <div>
                      <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6 mb-6"></div>
                  <div className="h-10 bg-gray-200 rounded-xl w-full"></div>
                </div>
              ))}
            </div>
          ) : filteredConsultants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredConsultants.map((consultant) => (
                <div key={consultant.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col p-6 group">
                  <div className="flex items-start gap-4 mb-4">
                    {consultant.metadata?.avatar_url ? (
                      <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-gray-100 flex-shrink-0">
                        <Image 
                          unoptimized 
                          src={consultant.metadata.avatar_url} 
                          alt={consultant.full_name} 
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-[#5B8A6F] flex items-center justify-center text-white font-bold text-xl border-2 border-gray-100">
                        {getInitials(consultant.full_name)}
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-[#1B4F72] flex items-center gap-1">
                        {consultant.full_name}
                        <CheckCircle size={14} className="text-[#4A90B8]" />
                      </h3>
                      <p className="text-gray-500 text-sm font-medium mb-1">
                        {consultant.metadata?.specialization || "Konsultan Pendamping"}
                      </p>
                      {consultant.metadata?.is_online ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-md font-medium">
                          <Globe size={12} /> Tersedia Online
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md font-medium">
                          <MapPin size={12} /> Offline Only
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 mb-6">
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                      {consultant.metadata?.bio || "Berpengalaman dalam memberikan pendampingan psikososial dan perlindungan hukum bagi korban kekerasan seksual."}
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => handleRequest(consultant.id)}
                    className="w-full py-3 px-4 bg-[#1B4F72] text-white hover:bg-[#1B4F72]/90 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 group-hover:shadow-[0_0_15px_rgba(27,79,114,0.3)]"
                  >
                    {t("request_btn")}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <Users size={64} className="mx-auto text-gray-300 mb-6" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">{t("empty_state")}</h3>
              <p className="text-gray-500">{t("empty_state")}</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
