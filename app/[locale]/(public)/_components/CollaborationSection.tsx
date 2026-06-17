"use client";

import { useTranslations } from "next-intl";

export default function CollaborationSection() {
  const t = useTranslations("homepage.collaboration");

  const logos = [
    { name: "Sahabat Tangguh", style: "text-blue-500 font-bold" },
    { name: "ULBI", style: "text-orange-500 font-bold" },
    { name: "Smart Insight", style: "text-purple-600 font-bold" },
    { name: "Call Center Polri 110", style: "text-yellow-600 font-bold" },
    { name: "SAPA 129", style: "text-green-600 font-bold" },
  ];

  const repeatedLogos = [...logos, ...logos, ...logos, ...logos, ...logos, ...logos];

  return (
    <section className="py-16 bg-gradient-to-b from-white to-[#FAFBFF] border-t border-gray-100 overflow-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slide {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-slide {
          animation: slide 30s linear infinite;
        }
        .animate-slide:hover {
          animation-play-state: paused;
        }
      `}} />
      <div className="container mx-auto px-6 max-w-6xl text-center mb-10">
        <h2 className="text-2xl font-bold text-[#1B4F72]">{t("title")}</h2>
      </div>

      <div className="relative w-full flex overflow-x-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#FAFBFF] to-transparent z-10 pointer-events-none"></div>

        <div className="flex whitespace-nowrap items-center py-4 animate-slide">
          {repeatedLogos.map((logo, index) => (
            <div
              key={index}
              className={`inline-block mx-12 text-2xl opacity-70 hover:opacity-100 transition-opacity cursor-default ${logo.style}`}
            >
              {logo.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
