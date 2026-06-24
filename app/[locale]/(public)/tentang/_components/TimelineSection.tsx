"use client";
import { motion } from "framer-motion";

const events = [
  {
    period: "Mei 2026",
    title: "SafePlace Lahir",
    desc: "Berawal dari keprihatinan atas maraknya kasus pelecehan seksual di berbagai kampus Indonesia, SafePlace dibentuk sebagai tools pelaporan, pendampingan, dan edukasi yang aman.",
    status: "done",
  },
  {
    period: "18 Juni 2026",
    title: "Batch 1 Sahabat Tangguh",
    desc: "Program pelatihan relawan pertama berhasil digelar bersama Smart Insight dan ULBI — melahirkan peer consultant pertama SafePlace yang siap mendampingi.",
    status: "done",
  },
  {
    period: "Segera",
    title: "Batch 2 Sahabat Tangguh",
    desc: "Membuka gelombang kedua relawan untuk memperluas jangkauan pendampingan SafePlace ke lebih banyak individu yang membutuhkan.",
    status: "upcoming",
  },
  {
    period: "Akan Datang",
    title: "Webinar Edukasi Publik",
    desc: "Seri webinar terbuka tentang hak korban, pencegahan kekerasan seksual, dan cara membangun lingkungan kampus yang lebih aman.",
    status: "upcoming",
  },
];

export default function TimelineSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <p className="text-sm font-semibold text-primary/60 uppercase tracking-widest mb-2">
            Perjalanan Kami
          </p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-primary">
            Dari nol menuju dampak nyata
          </h2>
        </motion.div>

        <div className="relative">
          <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border md:left-1/2 md:-translate-x-px" />
          <div className="flex flex-col gap-10">
            {events.map((event, i) => {
              const isDone = event.status === "done";
              const isRight = i % 2 !== 0;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.5 }}
                  className={`relative flex gap-6 md:gap-0 ${isRight ? "md:flex-row-reverse" : "md:flex-row"}`}
                >
                  <div className="hidden md:flex md:w-1/2" />
                  <div className="flex items-start gap-4 md:absolute md:left-1/2 md:-translate-x-1/2 md:mt-1">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${isDone ? "bg-[#1B4F72] border-[#1B4F72]" : "bg-white border-border"}`}>
                      {isDone && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className={`flex-1 md:w-1/2 pl-2 md:pl-0 ${isRight ? "md:pr-12" : "md:pl-12"}`}>
                    <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-2 ${isDone ? "bg-[#EAF3EE] text-[#5B8A6F]" : "bg-[#F5F6FA] text-[#6B7280]"}`}>
                      {event.period}
                    </span>
                    <h3 className="font-display font-bold text-primary text-base mb-1">{event.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{event.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
