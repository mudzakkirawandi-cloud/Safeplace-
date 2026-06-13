import { getTranslations } from "next-intl/server";
import Navbar from "./_components/Navbar";
import HeroSection from "./_components/HeroSection";
import HowItWorksSection from "./_components/HowItWorksSection";
import SecuritySection from "./_components/SecuritySection";
import ImpactSection from "./_components/ImpactSection";
import CampusSection from "./_components/CampusSection";
import Footer from "./_components/Footer";

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: "homepage.hero" });
  return {
    title: `SafePlace — ${t("title")}`,
    description: t("subtitle"),
  };
}

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <HowItWorksSection />
        <SecuritySection />
        <ImpactSection />
        <CampusSection />
      </main>
      <Footer />
    </div>
  );
}
