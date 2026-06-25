"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "../../../../../lib/supabase/client";
import Navbar from "../../_components/Navbar";
import Footer from "../../_components/Footer";
import { ArrowLeft, Briefcase, Globe, MapPin, CheckCircle, Clock } from "lucide-react";

export interface UserMetadata {
  avatar_url?: string;
  show_public?: boolean;
  is_online?: boolean;
  specialization?: string;
  bio?: string;
  experience?: string;
  schedule?: string;
  languages?: string[];
}

export interface Consultant {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
  is_online: boolean;
  show_public?: boolean;
  metadata?: UserMetadata;
}

export default function DetailPsikologPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const id = params.id as string;
  
  const [consultant, setConsultant] = useState<Consultant | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchConsultant = useCallback(async () => {
    if (!id) return;
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .eq("role", "consultant")
      .single();

    if (data) {
      setConsultant(data as Consultant);
    }
    setLoading(false);
  }, [id, supabase]);

  useEffect(() => {
    fetchConsultant();
  }, [fetchConsultant]);

  const getInitials = (name: string) => {
    if (!name) return "CS";
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  };

  const handleRequest = async () => {
    if (!consultant) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/login?redirect=/report/start");
    } else {
      router.push("/report/start?consultant=" + consultant.id);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-4xl">
          <Link href="/pendampingan" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 font-medium">
            <ArrowLeft size={18} /> Kembali ke daftar pendamping
          </Link>

          {loading ? (
            <div className="bg-card border border-border rounded-3xl p-8 animate-pulse shadow-sm">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-32 h-32 rounded-full bg-gray-200"></div>
                <div className="flex-1 space-y-4 w-full">
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-20 bg-gray-200 rounded w-full mt-6"></div>
                </div>
              </div>
            </div>
          ) : consultant ? (
            <div className="bg-card border border-border rounded-3xl p-8 md:p-10 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
              
              <div className="flex flex-col md:flex-row gap-8 md:gap-12 relative z-10">
                {/* Photo Section */}
                <div className="flex-col items-center shrink-0">
                  {consultant.metadata?.avatar_url ? (
                    <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-primary/10 shadow-sm mx-auto md:mx-0">
                      <Image 
                        unoptimized 
                        src={consultant.metadata.avatar_url} 
                        alt={consultant.full_name} 
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-32 md:w-40 md:h-40 mx-auto md:mx-0 rounded-full bg-primary flex items-center justify-center text-white font-bold text-4xl border-4 border-primary/10 shadow-sm">
                      {getInitials(consultant.full_name)}
                    </div>
                  )}
                  
                  <div className="mt-6 flex justify-center md:justify-start">
                    {consultant.is_online ? (
                      <span className="inline-flex items-center gap-1.5 text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-full font-medium border border-green-100">
                        <Globe size={14} /> Tersedia Online
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-full font-medium border border-border">
                        <MapPin size={14} /> Offline Only
                      </span>
                    )}
                  </div>
                </div>

                {/* Info Section */}
                <div className="flex-1">
                  <h1 className="text-3xl font-display font-bold text-primary flex items-center gap-2 mb-2">
                    {consultant.full_name}
                    <CheckCircle size={20} className="text-primary" />
                  </h1>
                  <p className="text-lg font-medium text-muted-foreground mb-6">
                    {consultant.metadata?.specialization || "Konsultan Pendamping"}
                  </p>

                  <div className="prose prose-sm text-muted-foreground mb-8">
                    <p className="leading-relaxed">
                      {consultant.metadata?.bio || "Berpengalaman dalam memberikan pendampingan psikososial dan perlindungan hukum bagi korban kekerasan seksual."}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <div className="flex items-center gap-3 bg-muted/50 p-4 rounded-xl border border-border/50">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Briefcase size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium mb-0.5">Pengalaman</p>
                        <p className="text-sm font-semibold text-foreground">{consultant.metadata?.experience || "3+ Tahun"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-muted/50 p-4 rounded-xl border border-border/50">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Clock size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium mb-0.5">Jadwal Tersedia</p>
                        <p className="text-sm font-semibold text-foreground">{consultant.metadata?.schedule || "Senin - Jumat"}</p>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleRequest}
                    className="w-full sm:w-auto px-8 py-3.5 bg-primary text-white hover:bg-primary/90 rounded-xl font-semibold transition-all shadow-[0_4px_14px_0_rgba(27,79,114,0.39)] hover:shadow-[0_6px_20px_rgba(27,79,114,0.23)] hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Request Pendampingan
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 bg-card rounded-3xl border border-border shadow-sm">
              <h3 className="text-xl font-bold text-card-foreground mb-2">Psikolog tidak ditemukan.</h3>
              <p className="text-muted-foreground mb-6">Konsultan yang Anda cari mungkin sudah tidak aktif atau ID salah.</p>
              <Link href="/pendampingan" className="inline-block px-6 py-2.5 bg-primary text-white rounded-xl font-medium">
                Kembali
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
