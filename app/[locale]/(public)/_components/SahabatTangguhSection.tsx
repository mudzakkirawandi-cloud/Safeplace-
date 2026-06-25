"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

const PHOTOS = [
  "/images/foto_batch1_1.png",
  "/images/foto_batch1_2.png",
  "/images/foto_batch1_3.png",
  "/images/foto_batch1_4.png",
  "/images/foto_batch1_5.png",
  "/images/foto_batch1_6.png",
  "/images/foto_batch1_7.png",
];

export default function SahabatTangguhSection() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % PHOTOS.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="py-20 bg-gradient-to-b from-[#FAFBFF] to-white">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm font-semibold text-primary/60 uppercase tracking-widest mb-3">
              Program unggulan
            </p>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-primary mb-4">
              Program Sahabat Tangguh
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed mb-3">
              Sahabat Tangguh adalah sahabat yang kuat yang selalu ada
              dalam suka dan duka, menjadi tempat bersandar saat
              menghadapi tantangan, tidak mudah menyerah dan setia
              membersamai proses.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6 italic">
              &quot;Bersama Kita Kuat&quot;
            </p>
            <div className="flex flex-wrap gap-2 mb-8">
              {["Konselor sebaya", "Empatik & terlatih", "Berbasis kampus", "Rahasia terjaga"].map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-medium px-3 py-1.5 rounded-full bg-primary/10 text-primary/70 border border-primary/10"
                >
                  {tag}
                </span>
              ))}
            </div>
            <button
              onClick={() => router.push("/tentang#program")}
              className="inline-flex items-center gap-2 text-sm font-medium text-primary border border-primary/20 px-5 py-2.5 rounded-xl hover:bg-primary/5 transition-all"
            >
              Pelajari lebih lanjut <span>→</span>
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-muted">
              {PHOTOS.map((src, i) => (
                <Image
                  key={src}
                  src={src}
                  alt={`Foto Sahabat Tangguh ${i + 1}`}
                  fill
                  className={`object-cover transition-opacity duration-700 ${
                    i === current ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}
              <button
                onClick={() => setCurrent((prev) => (prev - 1 + PHOTOS.length) % PHOTOS.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition text-lg"
                aria-label="Sebelumnya"
              >
                ‹
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition text-lg"
                aria-label="Berikutnya"
              >
                ›
              </button>
            </div>
            <div className="flex justify-center gap-1.5 mt-3">
              {PHOTOS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`rounded-full transition-all ${
                    i === current ? "w-5 h-2 bg-primary" : "w-2 h-2 bg-primary/20"
                  }`}
                  aria-label={`Foto ${i + 1}`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
