"use client";
import Image from "next/image";
import Link from "next/link";

const psikolog = [
  {
    id: "6fb2a618-5334-4a3a-9408-182cc32dd533",
    name: "RR. Sri Rusmawati",
    title: "S.Psi., Psikolog",
    photo: "/images/psikolog/sri-rusmawati.png",
  },
  {
    id: "b4093442-4c47-4e42-b94c-c9248a148541",
    name: "Chandra Dewi",
    title: "S.Psi., M.B.A., Psikolog",
    photo: "/images/psikolog/chandra-dewi.png",
  },
  {
    id: "33f66a27-90c2-4602-9816-85889012faa8",
    name: "Sangganiawaty",
    title: "S.Psi., Psikolog",
    photo: "/images/psikolog/sangganiawaty.png",
  },
];

export default function PsikologSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-[#FAFBFF] to-white">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-primary/60 uppercase tracking-widest mb-2">
            Tim Pendamping
          </p>
          <h2 className="text-3xl font-display font-bold text-primary mb-4">
            Psikolog & Konsultan Kami
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Didampingi oleh tenaga profesional berpengalaman yang siap membantu perjalananmu menuju pemulihan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {psikolog.map((p) => (
            <div
              key={p.id}
              className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group text-center p-8"
            >
              <div className="relative w-28 h-28 mx-auto mb-5 rounded-full overflow-hidden border-4 border-primary/10 group-hover:border-primary/30 transition-all">
                <Image
                  src={p.photo}
                  alt={p.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <h3 className="text-lg font-bold text-primary mb-1">{p.name}</h3>
              <p className="text-sm text-muted-foreground mb-5">{p.title}</p>
              <Link
                href="/pendampingan"
                className="inline-block px-5 py-2 rounded-xl border border-primary text-primary text-sm font-medium hover:bg-primary hover:text-white transition-colors"
              >
                Lihat Detail
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/pendampingan"
            className="inline-flex items-center gap-2 px-7 py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors shadow-md"
          >
            Temui Semua Pendamping →
          </Link>
        </div>
      </div>
    </section>
  );
}
