"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function AboutCTASection() {
  return (
    <section className="py-20 bg-[#FAFBFF]">
      <div className="container mx-auto px-6 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-[#1B4F72] rounded-2xl px-8 py-14 md:px-16 text-center"
        >
          <p className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-4">
            Bergabunglah Bersama Kami
          </p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4 leading-tight">
            Kamu tidak harus sendirian.<br />
            <span className="text-white/70">Kami ada di sini untukmu.</span>
          </h2>
          <p className="text-white/60 text-base max-w-md mx-auto mb-10 leading-relaxed">
            Baik sebagai pelapor yang butuh dukungan, maupun sebagai individu yang ingin tahu lebih tentang SafePlace, kami terbuka untuk kamu.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/tentang#kolaborasi"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#1B4F72] font-semibold px-8 py-3.5 rounded-xl text-sm hover:bg-white/90 transition-colors"
            >
              Hubungi Kami
            </Link>
            <Link
              href="/report/start"
              className="inline-flex items-center justify-center gap-2 border border-white/30 text-white font-semibold px-8 py-3.5 rounded-xl text-sm hover:bg-white/10 transition-colors"
            >
              Mulai Lapor Sekarang
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
