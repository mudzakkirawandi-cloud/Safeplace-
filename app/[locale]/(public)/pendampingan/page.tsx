"use client";
// Cek apakah ada NextIntlClientProvider yang membungkus halaman ini.

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { createClient } from "../../../../lib/supabase/client";
import Navbar from "../_components/Navbar";
import Footer from "../_components/Footer";
import { Users, Globe, MapPin, CheckCircle, MoreVertical } from "lucide-react";
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
  const router = useRouter();
  const supabase = createClient();
  
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const fetchConsultants = useCallback(async () => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("role", "consultant");

    console.log("DATA:", JSON.stringify(data));
    console.log("ERROR:", JSON.stringify(error));

    if (data) {
      const typedData = data as Consultant[];
      console.log("ALL DATA:", JSON.stringify(typedData));
      const publicConsultants = typedData.filter(c => c.metadata?.show_public);
      setConsultants(publicConsultants);

      const channel = supabase
        .channel('consultant-presence')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: 'role=eq.consultant'
        }, (payload) => {
          setConsultants(prev => prev.map(c => 
            c.id === payload.new.id ? { ...c, ...payload.new } : c
          ));
        })
        .subscribe();
      
      setLoading(false);
      return () => { supabase.removeChannel(channel); };
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    let cleanup: (() => void) | void;
    fetchConsultants().then(fn => {
      cleanup = fn;
    });
    return () => {
      if (cleanup) cleanup();
    };
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
      router.push("/login?redirect=/report/start");
    } else {
      router.push("/report/start?consultant=" + consultantId);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-display font-bold text-primary mb-4">
              Konsultan & Pendamping
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Temukan pendamping profesional untuk mendampingi proses Anda.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeFilter === "all"
                  ? "bg-primary text-white shadow-md"
                  : "bg-card text-muted-foreground hover:bg-muted border border-border"
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setActiveFilter("online")}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeFilter === "online"
                  ? "bg-primary text-white shadow-md"
                  : "bg-card text-muted-foreground hover:bg-muted border border-border"
              }`}
            >
              Hanya Online
            </button>
          </div>

          {/* Content Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-card rounded-2xl p-6 shadow-sm border border-border animate-pulse">
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
                <div key={consultant.id} className="bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-border flex flex-col p-6 group relative">
                  
                  {/* Dropdown 3 dots */}
                  <div className="absolute top-4 right-4 z-20" onClick={e => e.stopPropagation()}>
                    <button 
                      onClick={() => setOpenDropdown(openDropdown === consultant.id ? null : consultant.id)} 
                      className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                    >
                      <MoreVertical size={20} />
                    </button>
                    {openDropdown === consultant.id && (
                      <div className="absolute right-0 mt-1 w-48 bg-white border border-border rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] py-1.5 z-30">
                        <button 
                          onClick={() => {
                            setOpenDropdown(null);
                            const locale = window.location.pathname.split('/')[1];
                            router.push(`/${locale}/pendampingan/${consultant.id}`);
                          }} 
                          className="w-full text-left px-4 py-2 hover:bg-muted text-sm font-medium transition-colors"
                        >
                          Lihat Profil
                        </button>
                        <button 
                          onClick={() => {
                            setOpenDropdown(null);
                            handleRequest(consultant.id);
                          }} 
                          className="w-full text-left px-4 py-2 hover:bg-muted text-sm font-medium text-primary transition-colors"
                        >
                          Request Pendampingan
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-start gap-4 mb-4">
                    {consultant.metadata?.avatar_url ? (
                      <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-border flex-shrink-0">
                        <Image 
                          unoptimized 
                          src={consultant.metadata.avatar_url} 
                          alt={consultant.full_name} 
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl border-2 border-border flex-shrink-0">
                        {getInitials(consultant.full_name)}
                      </div>
                    )}
                    
                    <div className="flex-1 pr-6">
                      <h3 className="text-lg font-bold text-primary flex items-center gap-1">
                        {consultant.full_name}
                        <CheckCircle size={14} className="text-primary flex-shrink-0" />
                      </h3>
                      <p className="text-muted-foreground text-sm font-medium mb-1">
                        {consultant.metadata?.specialization || "Konsultan Pendamping"}
                      </p>
                      {consultant.metadata?.is_online ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-md font-medium">
                          <Globe size={12} /> Tersedia Online
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md font-medium">
                          <MapPin size={12} /> Offline Only
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 mb-6">
                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                      {consultant.metadata?.bio || "Berpengalaman dalam memberikan pendampingan psikososial dan perlindungan hukum bagi korban kekerasan seksual."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-card rounded-3xl border border-border shadow-sm">
              <Users size={64} className="mx-auto text-gray-300 mb-6" />
              <h3 className="text-xl font-bold text-card-foreground mb-2">Belum ada konsultan yang tersedia.</h3>
              <p className="text-muted-foreground">Belum ada konsultan yang tersedia.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
