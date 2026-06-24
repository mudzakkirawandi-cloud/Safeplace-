"use client";
import { motion } from "framer-motion";

const stats = [
  { value: "2", label: "Batch Pelatihan", sub: "Sahabat Tangguh" },
  { value: "3", label: "Mitra Institusi", sub: "Smart Insight, ULBI & lainnya" },
  { value: "18 Juni", label: "Batch 1 Digelar", sub: "Sahabat Tangguh 2026" },
  { value: "2026", label: "Tahun Berdiri", sub: "Dimulai dari ULBI" },
];

export default function StatsSection() {
  return (
    <section className="py-16 bg-[#1B4F72]">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-display font-bold text-white mb-1 tracking-tight">
                {stat.value}
              </div>
              <div className="text-sm font-medium text-white/80 mb-0.5">{stat.label}</div>
              <div className="text-xs text-white/50">{stat.sub}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
