"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Shield, AlertCircle, Loader2 } from "lucide-react";

// Mock data for token validation
const MOCK_TOKEN_DATA = {
  isValid: true,
  email: "konsultan@example.com",
  fullName: "Dr. Consultant Baru",
  role: "consultant" // bisa juga 'peer_consultant'
};

export default function JoinConsultantPage({ params }: { params: { token: string } }) {
  const router = useRouter();
  const [validating, setValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [data, setData] = useState<{ email: string; fullName: string; role: string } | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Simulate token validation
    const validateToken = async () => {
      setValidating(true);
      await new Promise(r => setTimeout(r, 1000));
      
      // In production: fetch from consultant_invites where token = params.token
      // Check if is_used == false and expires_at > now()
      setIsValid(MOCK_TOKEN_DATA.isValid);
      setData(MOCK_TOKEN_DATA);
      setValidating(false);
    };

    validateToken();
  }, [params.token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Password tidak cocok.");
      return;
    }
    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    setSubmitting(true);

    // Simulate Auth creation and token update
    await new Promise(r => setTimeout(r, 1500));
    
    // In production:
    // 1. supabase.auth.updateUser({ password }) or signUp if not created
    // 2. Update consultant_invites set is_used = true
    // 3. Update users table status to 'Aktif'
    
    alert("Akun berhasil diaktifkan! Selamat datang di SafePlace.");
    if (data?.role === "peer_consultant") {
      router.push("/id/peer-consultant/dashboard");
    } else {
      router.push("/id/consultant/dashboard");
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-primary font-medium text-sm">Memvalidasi tautan undangan...</p>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="min-h-screen bg-muted flex flex-col justify-center items-center p-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6 text-red-600">
          <AlertCircle size={32} />
        </div>
        <h1 className="text-2xl font-bold text-card-foreground mb-2">Tautan Kedaluwarsa</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          Tautan undangan ini sudah tidak berlaku atau sudah pernah digunakan. 
          Silakan hubungi administrator SafePlace untuk meminta undangan baru.
        </p>
        <button 
          onClick={() => router.push("/")}
          className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-[#153e5b] transition-colors"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center p-6">
      <div className="max-w-md w-full mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl shadow-xl overflow-hidden border border-border"
        >
          <div className="bg-primary p-8 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-card/10 blur-xl"></div>
            <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 rounded-full bg-black/10 blur-xl"></div>
            
            <div className="w-16 h-16 bg-card/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border/30">
              <Shield size={32} />
            </div>
            <h1 className="text-2xl font-bold mb-1">Aktivasi Akun</h1>
            <p className="text-sm text-green-50 opacity-90">Selesaikan pengaturan akun konsultan Anda.</p>
          </div>

          <div className="p-8">
            <div className="bg-muted rounded-xl p-4 border border-border mb-6 space-y-3">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Nama Lengkap</p>
                <p className="text-sm font-semibold text-card-foreground">{data?.fullName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Email Terdaftar</p>
                <p className="text-sm font-semibold text-card-foreground">{data?.email}</p>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-start gap-2">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-card-foreground">Buat Password Baru</label>
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:border-[#5B8A6F] focus:ring-1 focus:ring-[#5B8A6F] outline-none transition-all"
                  placeholder="Minimal 8 karakter"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-card-foreground">Konfirmasi Password</label>
                <input 
                  type="password" 
                  required 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:border-[#5B8A6F] focus:ring-1 focus:ring-[#5B8A6F] outline-none transition-all"
                  placeholder="Ketik ulang password"
                />
              </div>

              <label className="flex items-start gap-3 mt-6 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input 
                    type="checkbox" 
                    required 
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="w-5 h-5 appearance-none border-2 border-gray-300 rounded text-primary focus:ring-[#5B8A6F] checked:bg-primary checked:border-[#5B8A6F] transition-colors cursor-pointer"
                  />
                  <Check size={14} strokeWidth={3} className={`absolute text-white pointer-events-none transition-opacity ${agreed ? 'opacity-100' : 'opacity-0'}`} />
                </div>
                <span className="text-sm text-muted-foreground leading-relaxed group-hover:text-card-foreground transition-colors">
                  Saya menyetujui <span className="text-primary font-semibold">Syarat & Ketentuan Konsultan</span> serta Kebijakan Privasi SafePlace.
                </span>
              </label>

              <button 
                type="submit" 
                disabled={submitting || !agreed}
                className="w-full mt-4 py-3.5 bg-primary hover:bg-[#4a725b] text-white rounded-xl font-bold transition-all shadow-lg shadow-[#5B8A6F]/20 disabled:opacity-70 disabled:shadow-none flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Memproses...
                  </>
                ) : "Aktifkan Akun Saya"}
              </button>
            </form>
          </div>
        </motion.div>
        
        <p className="text-center text-xs text-muted-foreground mt-8">
          Akses tautan ini hanya berlaku untuk Anda. Jangan bagikan kepada siapa pun.
        </p>
      </div>
    </div>
  );
}
