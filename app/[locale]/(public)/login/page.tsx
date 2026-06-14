"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../../lib/supabase/client";
import { motion } from "framer-motion";
import { Shield, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (loginError) {
        throw loginError;
      }

      if (data.user) {
        // Fetch user profile/role
        const { data: profileData } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.user.id)
          .single();
          
        const role = profileData?.role || 'reporter';

        // Auto redirect based on role
        if (role === 'admin') router.push('/admin/dashboard');
        else if (role === 'consultant') router.push('/consultant/dashboard');
        else if (role === 'operator') router.push('/operator/dashboard');
        else if (role === 'satgas') router.push('/satgas/dashboard');
        else router.push('/report/track');
      }
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Email atau password salah.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F6FA] p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
      >
        <div className="bg-[#2C3E6B] p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#4ECDC4] opacity-20 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
              <Shield className="text-white" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Masuk ke SafePlace</h1>
            <p className="text-[#EBF5FB] text-sm">Sistem Pelaporan Tersentralisasi</p>
          </div>
        </div>

        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Akses</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="nama@institusi.ac.id"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2C3E6B]/20 focus:border-[#2C3E6B] transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-gray-700">Kata Sandi</label>
                <button type="button" className="text-xs font-semibold text-[#2C3E6B] hover:text-[#4ECDC4] transition-colors">Lupa sandi?</button>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2C3E6B]/20 focus:border-[#2C3E6B] transition-all"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 bg-[#2C3E6B] hover:bg-[#1f2b4a] disabled:bg-gray-400 text-white font-bold rounded-xl shadow-md transition-all hover:shadow-lg mt-2"
            >
              {loading ? "Memverifikasi..." : "Akses Sistem"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              Dengan masuk, Anda menyetujui Kebijakan Privasi dan Perlindungan Data SafePlace. Segala akses dicatat dalam Audit Log.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
