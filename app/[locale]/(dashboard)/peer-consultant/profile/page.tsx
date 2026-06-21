"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User, Mail, ShieldCheck, Clock, MonitorSmartphone, CalendarDays } from "lucide-react";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_online: boolean;
  last_login_at: string | null;
  last_login_device: string | null;
  created_at: string;
  status: string;
}

export default function PeerConsultantProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (error) throw error;

        if (data && isMounted) {
          setProfile(data as Profile);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [router, supabase]);

  const toggleStatus = async (isOnline: boolean) => {
    if (!profile) return;
    try {
      await supabase.from("users").update({ is_online: isOnline }).eq("id", profile.id);
      setProfile(prev => prev ? { ...prev, is_online: isOnline } : null);
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse h-12 w-12 bg-gray-200 rounded-full"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 text-center text-gray-500">
        Gagal memuat profil.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-primary">
          Profil Peer Consultant
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Kelola informasi pribadi dan pengaturan keamanan Anda.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Kolom Kiri: Profil Singkat */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-1 space-y-6"
        >
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6 text-center">
            <div className="w-24 h-24 bg-teal-100 text-teal-600 rounded-full mx-auto flex items-center justify-center mb-4 border-4 border-white shadow-md">
              <User size={40} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{profile.full_name}</h2>
            <p className="text-sm text-teal-600 font-medium capitalize mt-1">
              {profile.role.replace('_', ' ')}
            </p>
            
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-500 font-semibold mb-3 uppercase tracking-wide">Status Ketersediaan</p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => toggleStatus(true)}
                  className={`py-2 px-4 rounded-xl text-sm font-medium transition-colors ${
                    profile.is_online 
                      ? "bg-teal-600 text-white" 
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  ● Tersedia (Online)
                </button>
                <button
                  onClick={() => toggleStatus(false)}
                  className={`py-2 px-4 rounded-xl text-sm font-medium transition-colors ${
                    !profile.is_online 
                      ? "bg-amber-500 text-white" 
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  ○ Istirahat / Sibuk
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Kolom Kanan: Detail & Keamanan */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="md:col-span-2 space-y-6"
        >
          {/* Info Personal */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-gray-50/50">
              <h3 className="font-semibold text-primary">Informasi Personal</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Nama Lengkap</p>
                  <p className="font-medium text-gray-900">{profile.full_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email Utama</p>
                  <p className="font-medium text-gray-900">{profile.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Keamanan & Aktivitas */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-gray-50/50">
              <h3 className="font-semibold text-primary">Keamanan & Aktivitas</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-teal-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Login Terakhir</p>
                    <p className="text-xs text-gray-500">
                      {profile.last_login_at 
                        ? new Date(profile.last_login_at).toLocaleString() 
                        : "Belum pernah login"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <MonitorSmartphone className="w-5 h-5 text-teal-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Perangkat Terakhir</p>
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {profile.last_login_device || "Tidak diketahui"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-teal-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Status Akun</p>
                    <p className="text-xs text-gray-500 capitalize">{profile.status}</p>
                  </div>
                </div>
                {profile.status === 'active' && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">
                    Aman
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <CalendarDays className="w-5 h-5 text-teal-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Bergabung Sejak</p>
                    <p className="text-xs text-gray-500">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
