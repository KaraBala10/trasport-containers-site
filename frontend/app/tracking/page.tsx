"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/hooks/useLanguage";

export default function TrackingPage() {
  const { language } = useLanguage();

  const translations = {
    ar: {
      title: "تتبع الشحنة",
      description: "تتبع شحنتك في الوقت الفعلي",
      comingSoon: "قريباً",
      placeholder: "هذه الصفحة قيد التطوير. سيتم إضافة نظام التتبع قريباً.",
    },
    en: {
      title: "Track Shipment",
      description: "Track your shipment in real-time",
      comingSoon: "Coming Soon",
      placeholder:
        "This page is under development. The tracking system will be added soon.",
    },
  };

  const t = translations[language];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow" role="main">
        <div className="bg-primary-dark text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t.title}</h1>
            <p className="text-xl">{t.description}</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-primary-yellow p-8 rounded-lg shadow-lg">
              <h2 className="text-3xl font-bold text-primary-dark mb-4">
                {t.comingSoon}
              </h2>
              <p className="text-lg text-gray-700">{t.placeholder}</p>
            </div>
          </div>
        </div>
      </main>

      <Footer language={language} />
    </div>
  );
}
