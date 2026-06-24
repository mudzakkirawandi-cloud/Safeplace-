"use client";

import Image from "next/image";

const partners = [
  {
    name: "SafePlace",
    src: "/images/logo-safeplace.svg",
  },
  {
    name: "Sahabat Tangguh",
    src: "/images/sahabat_tangguh.png",
  },
  {
    name: "Smart Insight",
    src: "/images/smart_insight.png",
  },
];

const repeated = [
  ...partners,
  ...partners,
  ...partners,
  ...partners,
  ...partners,
  ...partners,
];

export default function CollaborationCarousel() {
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes slideCollab {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-collab {
            animation: slideCollab 22s linear infinite;
          }
          .animate-collab:hover {
            animation-play-state: paused;
          }
        `
      }} />

      <div className="relative w-full flex overflow-x-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        <div className="flex whitespace-nowrap items-center py-6 animate-collab">
          {repeated.map((partner, index) => (
            <div
              key={index}
              className="inline-flex items-center mx-16 opacity-60 hover:opacity-100 transition-opacity cursor-default"
            >
              <Image
                src={partner.src}
                alt={partner.name}
                width={140}
                height={56}
                className="object-contain h-14 w-auto border-2 border-red-500 bg-yellow-200"
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
