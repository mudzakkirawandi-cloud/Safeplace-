"use client";

import { motion } from "framer-motion";
import Image from "next/image";
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

export default function ProgramSection() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % PHOTOS.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + PHOTOS.length) % PHOTOS.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section id="program" className="py-20 bg-gradient-to-b 
      from-[#FAFBFF] to-white">
      <div className="container mx-auto px-6 max-w-6xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-sm font-semibold text-primary/60 
            uppercase tracking-widest mb-2">
            Program yang sudah berjalan
          </p>
          <h2 className="text-3xl md:text-4xl font-display font-bold 
            text-primary mb-4">
            Sahabat Tangguh Batch 1
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Pelatihan konselor sebaya perdana SafePlace bersama 
            Smart Insight dan ULBI — melahirkan relawan yang siap 
            mendampingi sesama dengan empati dan keberanian.
          </p>
        </motion.div>

        {/* Carousel foto */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative rounded-2xl overflow-hidden 
            aspect-[16/7] bg-muted max-w-4xl mx-auto">
            {PHOTOS.map((src, i) => (
              <Image
                key={src}
                src={src}
                alt={`Kegiatan Sahabat Tangguh Batch 1 foto ${i + 1}`}
                fill
                className={`object-cover transition-opacity duration-700 
                  ${i === current ? "opacity-100" : "opacity-0"}`}
              />
            ))}
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 
                w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm 
                flex items-center justify-center hover:bg-white 
                transition text-lg font-medium"
              aria-label="Foto sebelumnya"
            >
              ‹
            </button>
            <button
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 
                w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm 
                flex items-center justify-center hover:bg-white 
                transition text-lg font-medium"
              aria-label="Foto berikutnya"
            >
              ›
            </button>
            <div className="absolute bottom-3 right-4 bg-black/40 
              text-white text-xs px-2 py-1 rounded-full">
              {current + 1} / {PHOTOS.length}
            </div>
          </div>
          {/* Dots */}
          <div className="flex justify-center gap-1.5 mt-3">
            {PHOTOS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all ${
                  i === current 
                    ? "w-6 h-2 bg-primary" 
                    : "w-2 h-2 bg-primary/20"
                }`}
                aria-label={`Foto ${i + 1}`}
              />
            ))}
          </div>
        </motion.div>

        {/* Info cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-10">
          
          {/* Visi */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <p className="text-xs font-semibold text-primary/60 
              uppercase tracking-widest mb-3">
              Visi
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Menjadi komunitas yang kuat dan saling mendukung, di mana 
              setiap individu dapat tumbuh, berbagi, dan mengatasi 
              tantangan hidup bersama dengan keberanian, empati, 
              dan solidaritas.
            </p>
          </motion.div>

          {/* Tentang program */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <p className="text-xs font-semibold text-primary/60 
              uppercase tracking-widest mb-3">
              Tentang program
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed 
              mb-3">
              Sahabat Tangguh adalah sahabat yang kuat yang selalu ada 
              dalam suka dan duka, menjadi tempat bersandar saat 
              menghadapi tantangan, tidak mudah menyerah dan setia 
              membersamai proses.
            </p>
            <p className="text-xs font-medium text-primary/70 italic">
              &quot;Bersama Kita Kuat&quot;
            </p>
          </motion.div>

          {/* Rekrutmen */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-card border border-border rounded-2xl p-6 
              flex flex-col gap-3"
          >
            <p className="text-xs font-semibold text-primary/60 
              uppercase tracking-widest">
              Rekrutmen Batch 1
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Pendaftaran dibuka 16–17 Juni via Google Form. 
              Batch ini sudah ditutup — pantau pengumuman batch 
              berikutnya.
            </p>
            <div className="relative rounded-xl overflow-hidden 
              aspect-[3/4] bg-muted mt-auto">
              <Image
                src="/images/flyer_perekutan.png"
                alt="Flyer rekrutmen Sahabat Tangguh Batch 1"
                fill
                className="object-contain"
              />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
