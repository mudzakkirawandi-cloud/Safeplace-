import { getTranslations } from "next-intl/server";
import Navbar from "../_components/Navbar";
import Footer from "../_components/Footer";
import AboutHeroSection from "./_components/AboutHeroSection";
import VisiMisiSection from "./_components/VisiMisiSection";
import FilosofiSection from "./_components/FilosofiSection";
import ProgramSection from "./_components/ProgramSection";
import StatsSection from "./_components/StatsSection";
import TimelineSection from "./_components/TimelineSection";
import AboutCollaborationSection from "./_components/AboutCollaborationSection";
import PsikologSection from "../_components/PsikologSection";
import AboutCTASection from "./_components/AboutCTASection";

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: "tentang.meta" });
  return {
    title: `SafePlace — ${t("title")}`,
    description: t("description"),
  };
}

export default function TentangPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <AboutHeroSection />
        <StatsSection />
        <VisiMisiSection />
        <FilosofiSection />
        <TimelineSection />
        <ProgramSection />
        <PsikologSection />
        <AboutCollaborationSection />
        <AboutCTASection />
      </main>
      <Footer />
    </div>
  );
}
