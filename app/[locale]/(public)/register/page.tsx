"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../../lib/supabase/client";
import { motion } from "framer-motion";
import { Shield, Eye, EyeOff, User, Mail, Lock } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok.");
      setLoading(false);
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/report/start`,
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      // If user is created, redirect to verify
      if (data.user) {
        // Insert into users table as 'reporter' by default
        const { error: dbError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              full_name: fullName,
              email: email,
              role: 'reporter',
            }
          ]);
          
        if (dbError && dbError.code !== '23505') {
            console.error("DB Error:", dbError);
        }
        
        router.push('/id/register/verify');
      }
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Gagal mendaftar. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-card rounded-3xl shadow-xl border border-border overflow-hidden"
      >
        <div className="bg-primary p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#4ECDC4] opacity-20 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-card/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border/20">
              <Shield className="text-white" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Daftar Akun Baru</h1>
            <p className="text-[#EBF5FB] text-sm">Bergabung dengan SafePlace</p>
          </div>
        </div>

        <div className="p-8">
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0, x: [-10, 10, -10, 10, 0] }}
                transition={{ duration: 0.4 }}
                className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-medium"
              >
                {error}
              </motion.div>
            )}
            
            <div>
              <label className="block text-sm font-semibold text-card-foreground mb-1.5">Nama Lengkap</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Nama Lengkap Anda"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2C3E6B]/20 focus:border-[#2C3E6B] transition"
                />
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-card-foreground mb-1.5">Email Akses</label>
              <div className="relative">
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2C3E6B]/20 focus:border-[#2C3E6B] transition"
                />
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-card-foreground mb-1.5">Kata Sandi</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-12 py-3 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2C3E6B]/20 focus:border-[#2C3E6B] transition"
                />
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-muted-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-card-foreground mb-1.5">Konfirmasi Kata Sandi</label>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-12 py-3 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2C3E6B]/20 focus:border-[#2C3E6B] transition"
                />
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-muted-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <motion.button 
              whileTap={{ scale: 0.95 }}
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 bg-primary hover:bg-[#1f2b4a] disabled:bg-gray-400 text-white font-bold rounded-xl shadow-md transition hover:shadow-lg mt-4"
            >
              {loading ? "Mendaftar..." : "Daftar Akun"}
            </motion.button>
          </form>

          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Sudah punya akun? <Link href="/login" className="font-bold text-primary hover:text-[#4ECDC4] transition-colors">Masuk</Link>
            </p>
            <p className="text-xs text-muted-foreground">
              Dengan mendaftar, Anda menyetujui Kebijakan Privasi dan Perlindungan Data SafePlace.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
