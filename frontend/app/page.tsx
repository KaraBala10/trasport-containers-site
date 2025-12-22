"use client";

import { useMemo } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PartnerLogos from "@/components/PartnerLogos";
import InteractiveMap from "@/components/InteractiveMap";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";

export default function Home() {
  const { language, isRTL, mounted } = useLanguage();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const translations = useMemo(
    () => ({
      ar: {
        heroTitle: "MEDO-FREIGHT.EU",
        heroSubtitle: "Freight · Route · Deliver",
        heroDescription: "خدمات شحن احترافية عالمية",
        bookShipment: "FCL Quote (أوروبا)",
        serviceTitle: "خدماتنا",
        serviceDescription: "نقدم خدمات شحن احترافية مع ضمان الجودة والسرعة",
        shippingStages: "مراحل الشحن",
        stage1: "التجميع",
        stage2: "النقل",
        stage3: "التخزين المؤقت",
        stage4: "التوصيل",
        trustTitle: "الثقة والامتثال",
        fclQuote: "عرض سعر FCL",
        partnersTitle: "شركاؤنا",
        videoTitle: "رحلة الشحنة",
        videoDescription: "شاهد كيف ننقل شحنتك بأمان وسرعة",
        centersTitle: "مراكزنا الأوروبية",
        galleryTitle: "معرض الصور",
        login: "تسجيل الدخول",
        signup: "إنشاء حساب",
        getStarted: "ابدأ الآن",
        statsTitle: "أرقامنا",
        whyChooseUs: "لماذا نحن",
        whyChooseUsDesc: "نقدم حلول شحن متكاملة وموثوقة",
        feature1: "تتبع مباشر",
        feature1Desc: "تتبع شحنتك في الوقت الفعلي من البداية حتى الوصول",
        feature2: "أمان مضمون",
        feature2Desc: "تأمين شامل على جميع الشحنات مع تغطية كاملة",
        feature3: "أسعار شفافة",
        feature3Desc: "أسعار واضحة بدون رسوم مخفية أو مفاجآت",
        feature4: "دعم متواصل",
        feature4Desc: "فريق دعم متاح 24/7 لمساعدتك في أي وقت",
        feature5: "شبكة عالمية",
        feature5Desc: "شراكات استراتيجية في أكثر من 50 دولة",
        feature6: "سرعة في التنفيذ",
        feature6Desc: "خدمات سريعة مع التزام بمواعيد التسليم",
        statsShipments: "شحنة",
        statsCountries: "دولة",
        statsYears: "سنة خبرة",
        statsClients: "عميل راضٍ",
      },
      en: {
        heroTitle: "MEDO-FREIGHT.EU",
        heroSubtitle: "Freight · Route · Deliver",
        heroDescription: "Professional Global Freight Services",
        bookShipment: "FCL Quote (Europe)",
        serviceTitle: "Our Services",
        serviceDescription:
          "We provide professional shipping services with guaranteed quality and speed",
        shippingStages: "Shipping Stages",
        stage1: "Collection",
        stage2: "Transport",
        stage3: "Temporary Storage",
        stage4: "Delivery",
        trustTitle: "Trust & Compliance",
        fclQuote: "FCL Quote",
        partnersTitle: "Our Partners",
        videoTitle: "Shipment Journey",
        videoDescription:
          "Watch how we transport your shipment safely and quickly",
        centersTitle: "Our European Centers",
        galleryTitle: "Photo Gallery",
        login: "Login",
        signup: "Sign Up",
        getStarted: "Get Started",
        statsTitle: "Our Numbers",
        whyChooseUs: "Why Choose Us",
        whyChooseUsDesc:
          "We provide integrated and reliable shipping solutions",
        feature1: "Real-Time Tracking",
        feature1Desc: "Track your shipment in real-time from start to delivery",
        feature2: "Guaranteed Security",
        feature2Desc: "Comprehensive insurance coverage for all shipments",
        feature3: "Transparent Pricing",
        feature3Desc: "Clear pricing with no hidden fees or surprises",
        feature4: "24/7 Support",
        feature4Desc: "Dedicated support team available around the clock",
        feature5: "Global Network",
        feature5Desc: "Strategic partnerships in over 50 countries",
        feature6: "Fast Execution",
        feature6Desc: "Rapid services with commitment to delivery deadlines",
        statsShipments: "Shipments",
        statsCountries: "Countries",
        statsYears: "Years Experience",
        statsClients: "Satisfied Clients",
      },
    }),
    []
  );

  const t = translations[language];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Skip Navigation Link for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary-yellow focus:text-primary-dark focus:px-6 focus:py-3 focus:rounded-md focus:font-bold focus:shadow-xl focus:ring-4 focus:ring-primary-yellow/50"
        aria-label={
          !mounted
            ? "Skip to main content"
            : language === "ar"
            ? "انتقل إلى المحتوى الرئيسي"
            : "Skip to main content"
        }
      >
        {!mounted
          ? "Skip to content"
          : language === "ar"
          ? "انتقل إلى المحتوى"
          : "Skip to content"}
      </a>

      <Header />

      {/* Spacer for fixed header */}
      <div className="h-20" aria-hidden="true" />

      <main id="main-content" className="flex-grow" role="main">
        {/* Hero Banner */}
        <section
          className="relative overflow-hidden min-h-[600px] flex items-center"
          aria-labelledby="hero-heading"
        >
          {/* Background Image - Cargo Ship with Containers */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/hero-ship.avif"
              alt={
                language === "ar"
                  ? "سفينة شحن مع حاويات وبضائع"
                  : "Cargo container ship with freight"
              }
              fill
              priority
              quality={90}
              className="object-cover"
              sizes="100vw"
            />
          </div>

          <div className="container mx-auto px-4 py-20 text-center text-white relative z-10">
            <h1
              id="hero-heading"
              className="text-5xl md:text-6xl font-bold mb-4"
            >
              {t.heroTitle}
            </h1>
            <p className="text-2xl md:text-3xl mb-2 text-primary-yellow font-semibold">
              {t.heroSubtitle}
            </p>
            <p className="text-xl mb-8 font-medium">{t.heroDescription}</p>

            {/* CTA Buttons */}
            <div
              className="flex flex-wrap gap-4 justify-center"
              role="group"
              aria-label={
                language === "ar"
                  ? "أزرار الإجراءات الرئيسية"
                  : "Main action buttons"
              }
            >
              <Link
                href="/fcl-quote"
                className="bg-primary-yellow text-primary-dark px-8 py-3 rounded-md font-bold text-lg hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-primary-yellow/50 focus:ring-offset-2"
                aria-label={
                  language === "ar"
                    ? "FCL Quote (أوروبا)"
                    : "FCL Quote (Europe)"
                }
              >
                {t.bookShipment}
              </Link>
            </div>

            {/* Authentication Buttons - Only show if not authenticated */}
            {!authLoading && !isAuthenticated && (
              <div
                className="mt-8 flex flex-wrap gap-4 justify-center"
                role="group"
                aria-label={
                  language === "ar"
                    ? "أزرار تسجيل الدخول والتسجيل"
                    : "Login and signup buttons"
                }
              >
                <Link
                  href="/login"
                  className="bg-white/10 backdrop-blur-sm text-white border-2 border-white/50 px-8 py-3 rounded-md font-bold text-lg hover:bg-white/20 transition-all shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-white/50 focus:ring-offset-2"
                  aria-label={
                    language === "ar"
                      ? "تسجيل الدخول إلى حسابك"
                      : "Login to your account"
                  }
                >
                  {t.login}
                </Link>
                <Link
                  href="/register"
                  className="bg-primary-yellow text-primary-dark px-8 py-3 rounded-md font-bold text-lg hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-primary-yellow/50 focus:ring-offset-2"
                  aria-label={
                    language === "ar"
                      ? "إنشاء حساب جديد"
                      : "Create a new account"
                  }
                >
                  {t.signup}
                </Link>
              </div>
            )}

            {/* Dashboard Link - Only show if authenticated */}
            {!authLoading && isAuthenticated && (
              <div className="mt-8 flex justify-center">
                <Link
                  href="/dashboard"
                  className="bg-primary-yellow text-primary-dark px-8 py-3 rounded-md font-bold text-lg hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-primary-yellow/50 focus:ring-offset-2"
                  aria-label={
                    language === "ar"
                      ? "انتقل إلى لوحة التحكم"
                      : "Go to dashboard"
                  }
                >
                  {language === "ar" ? "لوحة التحكم" : "Go to Dashboard"}
                </Link>
              </div>
            )}

            {/* Social Media Links */}
            <div
              className="mt-12 flex flex-wrap gap-4 justify-center items-center"
              role="list"
              aria-label={
                language === "ar"
                  ? "روابط التواصل الاجتماعي"
                  : "Social media links"
              }
            >
              <span className="text-white/90 font-medium text-lg">
                {language === "ar" ? "تابعنا على:" : "Follow us on:"}
              </span>
              <div className="flex flex-wrap gap-3">
                {/* YouTube */}
                <a
                  href="https://www.youtube.com/@medo-freighteu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white/10 backdrop-blur-sm hover:bg-white/20 border-2 border-white/30 hover:border-red-400/80 text-white p-3 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-red-500/30 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-transparent"
                  aria-label={
                    language === "ar"
                      ? "زيارة قناة اليوتيوب"
                      : "Visit our YouTube channel"
                  }
                  role="listitem"
                >
                  <svg
                    className="w-6 h-6 group-hover:text-red-400 transition-colors"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>

                {/* Facebook */}
                <a
                  href="https://www.facebook.com/share/1bmbp5cpnB/?mibextid=wwXIfr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white/10 backdrop-blur-sm hover:bg-white/20 border-2 border-white/30 hover:border-blue-400/80 text-white p-3 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-transparent"
                  aria-label={
                    language === "ar"
                      ? "زيارة صفحة الفيسبوك"
                      : "Visit our Facebook page"
                  }
                  role="listitem"
                >
                  <svg
                    className="w-6 h-6 group-hover:text-blue-400 transition-colors"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>

                {/* TikTok */}
                <a
                  href="https://www.tiktok.com/@medo.freight.eu?_r=1&_t=ZG-91VsA4BS0oq"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white/10 backdrop-blur-sm hover:bg-white/20 border-2 border-white/30 hover:border-gray-300/80 text-white p-3 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-gray-500/30 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-transparent"
                  aria-label={
                    language === "ar"
                      ? "زيارة حساب التيك توك"
                      : "Visit our TikTok account"
                  }
                  role="listitem"
                >
                  <svg
                    className="w-6 h-6 group-hover:text-gray-300 transition-colors"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href="https://www.instagram.com/medo.freighteu?igsh=dzV5Z3hxeDU5MWhr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white/10 backdrop-blur-sm hover:bg-white/20 border-2 border-white/30 hover:border-pink-400/80 text-white p-3 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-pink-500/30 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 focus:ring-offset-transparent"
                  aria-label={
                    language === "ar"
                      ? "زيارة حساب الإنستغرام"
                      : "Visit our Instagram account"
                  }
                  role="listitem"
                >
                  <svg
                    className="w-6 h-6 group-hover:text-pink-400 transition-colors"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>

                {/* LinkedIn */}
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white/10 backdrop-blur-sm hover:bg-white/20 border-2 border-white/30 hover:border-blue-400/80 text-white p-3 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-transparent"
                  aria-label={
                    language === "ar"
                      ? "زيارة صفحة لينكد إن"
                      : "Visit our LinkedIn page"
                  }
                  role="listitem"
                >
                  <svg
                    className="w-6 h-6 group-hover:text-blue-400 transition-colors"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section
          className="py-16 bg-primary-dark text-white"
          aria-labelledby="stats-heading"
        >
          <div className="container mx-auto px-4">
            <h2
              id="stats-heading"
              className="text-4xl font-bold text-center mb-12 text-primary-yellow"
            >
              {t.statsTitle}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-5xl md:text-6xl font-bold text-primary-yellow mb-2">
                  +12
                </div>
                <div className="text-lg text-gray-300">{t.statsShipments}</div>
              </div>
              <div className="text-center">
                <div className="text-5xl md:text-6xl font-bold text-primary-yellow mb-2">
                  50+
                </div>
                <div className="text-lg text-gray-300">{t.statsCountries}</div>
              </div>
              <div className="text-center">
                <div className="text-5xl md:text-6xl font-bold text-primary-yellow mb-2">
                  15+
                </div>
                <div className="text-lg text-gray-300">{t.statsYears}</div>
              </div>
              <div className="text-center">
                <div className="text-5xl md:text-6xl font-bold text-primary-yellow mb-2">
                  5K+
                </div>
                <div className="text-lg text-gray-300">{t.statsClients}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section
          className="py-20 bg-gradient-to-b from-slate-50 to-gray-100"
          aria-labelledby="why-choose-heading"
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2
                id="why-choose-heading"
                className="text-4xl md:text-5xl font-bold mb-4 text-primary-dark"
              >
                {t.whyChooseUs}
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {t.whyChooseUsDesc}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-gradient-to-br from-white to-slate-50 p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-primary-yellow/50">
                <div className="w-14 h-14 bg-primary-yellow rounded-lg flex items-center justify-center mb-6">
                  <svg
                    className="w-8 h-8 text-primary-dark"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-primary-dark">
                  {t.feature1}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t.feature1Desc}
                </p>
              </div>
              {/* Feature 2 */}
              <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-primary-yellow/50">
                <div className="w-14 h-14 bg-primary-yellow rounded-lg flex items-center justify-center mb-6">
                  <svg
                    className="w-8 h-8 text-primary-dark"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-primary-dark">
                  {t.feature2}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t.feature2Desc}
                </p>
              </div>
              {/* Feature 3 */}
              <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-primary-yellow/50">
                <div className="w-14 h-14 bg-primary-yellow rounded-lg flex items-center justify-center mb-6">
                  <svg
                    className="w-8 h-8 text-primary-dark"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-primary-dark">
                  {t.feature3}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t.feature3Desc}
                </p>
              </div>
              {/* Feature 4 */}
              <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-primary-yellow/50">
                <div className="w-14 h-14 bg-primary-yellow rounded-lg flex items-center justify-center mb-6">
                  <svg
                    className="w-8 h-8 text-primary-dark"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-primary-dark">
                  {t.feature4}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t.feature4Desc}
                </p>
              </div>
              {/* Feature 5 */}
              <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-primary-yellow/50">
                <div className="w-14 h-14 bg-primary-yellow rounded-lg flex items-center justify-center mb-6">
                  <svg
                    className="w-8 h-8 text-primary-dark"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-primary-dark">
                  {t.feature5}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t.feature5Desc}
                </p>
              </div>
              {/* Feature 6 */}
              <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-primary-yellow/50">
                <div className="w-14 h-14 bg-primary-yellow rounded-lg flex items-center justify-center mb-6">
                  <svg
                    className="w-8 h-8 text-primary-dark"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-primary-dark">
                  {t.feature6}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t.feature6Desc}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Service Introduction */}
        <section
          className="py-20 bg-gradient-to-b from-gray-100 to-slate-50"
          aria-labelledby="services-heading"
        >
          <div className="container mx-auto px-4">
            <h2
              id="services-heading"
              className="text-4xl md:text-5xl font-bold text-center mb-4 text-primary-dark"
            >
              {t.serviceTitle}
            </h2>
            <p className="text-xl text-center text-gray-600 max-w-3xl mx-auto mb-16">
              {t.serviceDescription}
            </p>

            {/* Shipping Stages */}
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
              role="list"
              aria-label={language === "ar" ? "مراحل الشحن" : "Shipping stages"}
            >
              <div
                className="bg-gradient-to-br from-white to-slate-50 p-8 rounded-xl shadow-lg text-center hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-primary-yellow/50 hover:-translate-y-2"
                role="listitem"
              >
                <div
                  className="w-20 h-20 bg-gradient-to-br from-primary-yellow to-yellow-500 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-md"
                  aria-hidden="true"
                >
                  <span className="text-3xl font-bold text-primary-dark">
                    1
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-primary-dark">
                  {t.stage1}
                </h3>
                <p className="text-gray-600">
                  {language === "ar"
                    ? "تجميع الطرود من مراكزنا الأوروبية"
                    : "Collection from our European centers"}
                </p>
              </div>
              <div
                className="bg-gradient-to-br from-white to-slate-50 p-8 rounded-xl shadow-lg text-center hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-primary-yellow/50 hover:-translate-y-2"
                role="listitem"
              >
                <div
                  className="w-20 h-20 bg-gradient-to-br from-primary-yellow to-yellow-500 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-md"
                  aria-hidden="true"
                >
                  <span className="text-3xl font-bold text-primary-dark">
                    2
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-primary-dark">
                  {t.stage2}
                </h3>
                <p className="text-gray-600">
                  {language === "ar"
                    ? "نقل آمن عبر البحر والبر"
                    : "Safe transport by sea and land"}
                </p>
              </div>
              <div
                className="bg-gradient-to-br from-white to-slate-50 p-8 rounded-xl shadow-lg text-center hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-primary-yellow/50 hover:-translate-y-2"
                role="listitem"
              >
                <div
                  className="w-20 h-20 bg-gradient-to-br from-primary-yellow to-yellow-500 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-md"
                  aria-hidden="true"
                >
                  <span className="text-3xl font-bold text-primary-dark">
                    3
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-primary-dark">
                  {t.stage3}
                </h3>
                <p className="text-gray-600">
                  {language === "ar"
                    ? "تخزين آمن في مرافقنا المكيفة"
                    : "Secure storage in our climate-controlled facilities"}
                </p>
              </div>
              <div
                className="bg-gradient-to-br from-white to-slate-50 p-8 rounded-xl shadow-lg text-center hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-primary-yellow/50 hover:-translate-y-2"
                role="listitem"
              >
                <div
                  className="w-20 h-20 bg-gradient-to-br from-primary-yellow to-yellow-500 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-md"
                  aria-hidden="true"
                >
                  <span className="text-3xl font-bold text-primary-dark">
                    4
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-primary-dark">
                  {t.stage4}
                </h3>
                <p className="text-gray-600">
                  {language === "ar"
                    ? "توصيل سريع إلى العنوان المحدد"
                    : "Fast delivery to your specified address"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Video Section */}
        <section
          className="py-20 bg-gradient-to-b from-white to-gray-50"
          aria-labelledby="video-heading"
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2
                id="video-heading"
                className="text-4xl md:text-5xl font-bold mb-4 text-primary-dark"
              >
                {t.videoTitle}
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {t.videoDescription}
              </p>
            </div>
            <div className="max-w-5xl mx-auto">
              <div
                className="aspect-video bg-gradient-to-br from-primary-dark to-slate-800 rounded-2xl overflow-hidden relative shadow-2xl focus-within:ring-4 focus-within:ring-primary-yellow/50"
                role="region"
                aria-label={
                  language === "ar"
                    ? "مقطع فيديو توضيحي"
                    : "Demonstration video"
                }
              >
                <video
                  className="w-full h-full object-cover"
                  controls
                  preload="metadata"
                  playsInline
                  aria-label={
                    language === "ar"
                      ? "فيديو رحلة الشحنة"
                      : "Shipment journey video"
                  }
                  poster="/images/hero-ship.avif"
                >
                  <source src="/video.mp4" type="video/mp4" />
                  {language === "ar"
                    ? "متصفحك لا يدعم عرض الفيديو. يرجى تحديث المتصفح."
                    : "Your browser does not support the video tag. Please update your browser."}
                </video>
              </div>
            </div>
          </div>
        </section>

        {/* Photo Gallery */}
        <section
          className="py-20 bg-gradient-to-b from-gray-50 to-slate-100"
          aria-labelledby="gallery-heading"
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2
                id="gallery-heading"
                className="text-4xl md:text-5xl font-bold mb-4 text-primary-dark"
              >
                {t.galleryTitle}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8" role="list">
              {/* European Centers Image */}
              <figure
                className="relative h-80 rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-gray-200 to-gray-300 focus-within:ring-4 focus-within:ring-primary-yellow/50 group"
                role="listitem"
              >
                <Image
                  src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=70"
                  alt={
                    language === "ar"
                      ? "مراكز الشحن الأوروبية الحديثة مع مرافق تخزين متقدمة"
                      : "Modern European shipping centers with advanced storage facilities"
                  }
                  fill
                  quality={80}
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//9k="
                />
                <figcaption className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-6 group-hover:from-black/90 transition-all duration-300">
                  <p className="text-white font-bold text-xl">
                    {language === "ar" ? "مراكز أوروبية" : "European Centers"}
                  </p>
                </figcaption>
              </figure>

              {/* Containers Image */}
              <figure
                className="relative h-80 rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-gray-200 to-gray-300 focus-within:ring-4 focus-within:ring-primary-yellow/50 group"
                role="listitem"
              >
                <Image
                  src="https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800&q=70"
                  alt={
                    language === "ar"
                      ? "حاويات شحن بحرية جاهزة للنقل الدولي"
                      : "Sea freight containers ready for international transport"
                  }
                  fill
                  quality={80}
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//9k="
                />
                <figcaption className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-6 group-hover:from-black/90 transition-all duration-300">
                  <p className="text-white font-bold text-xl">
                    {language === "ar" ? "حاويات شحن" : "Shipping Containers"}
                  </p>
                </figcaption>
              </figure>

              {/* Logistics Image */}
              <figure
                className="relative h-80 rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-gray-200 to-gray-300 focus-within:ring-4 focus-within:ring-primary-yellow/50 group"
                role="listitem"
              >
                <Image
                  src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=70"
                  alt={
                    language === "ar"
                      ? "خدمات لوجستية متكاملة وإدارة سلسلة التوريد"
                      : "Comprehensive logistics services and supply chain management"
                  }
                  fill
                  quality={80}
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//9k="
                />
                <figcaption className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-6 group-hover:from-black/90 transition-all duration-300">
                  <p className="text-white font-bold text-xl">
                    {language === "ar" ? "خدمات لوجستية" : "Logistics Services"}
                  </p>
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* Partner Logos */}
        <section
          className="py-16 bg-gray-50"
          aria-labelledby="partners-heading"
        >
          <div className="container mx-auto px-4">
            <h2
              id="partners-heading"
              className="text-4xl font-bold text-center mb-12 text-primary-dark"
            >
              {t.partnersTitle}
            </h2>
            <PartnerLogos />
          </div>
        </section>

        {/* Interactive Map */}
        <section
          className="py-16 bg-gradient-to-b from-slate-100 to-gray-50"
          aria-labelledby="map-heading"
        >
          <div className="container mx-auto px-4">
            <InteractiveMap language={language} />

            {/* Company Information */}
            <div className="mt-12 max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-200">
              <h3 className="text-xl md:text-2xl font-bold text-primary-dark mb-6 text-center">
                {language === "ar"
                  ? "مزود خدمات لوجستية"
                  : "Logistics Service Provider"}
              </h3>
              <div className="grid md:grid-cols-2 gap-6 text-sm md:text-base">
                <div className="space-y-3">
                  <div>
                    <span className="font-semibold text-primary-dark">
                      {language === "ar" ? "العنوان:" : "Address:"}
                    </span>
                    <p className="text-gray-700 mt-1">
                      Titanlaan 1, 4624 AX Bergen op Zoom
                      <br />
                      The Netherlands
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-primary-dark">
                      KvK nr:
                    </span>
                    <span className="text-gray-700 ml-2">75251663</span>
                  </div>
                  <div>
                    <span className="font-semibold text-primary-dark">
                      TAX nr:
                    </span>
                    <span className="text-gray-700 ml-2">NL002518102B41</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="font-semibold text-primary-dark">
                      EORI number:
                    </span>
                    <span className="text-gray-700 ml-2">NL1320963189</span>
                  </div>
                  <div>
                    <span className="font-semibold text-primary-dark">
                      {language === "ar" ? "الهاتف:" : "Tel:"}
                    </span>
                    <a
                      href="tel:+31639788989"
                      className="text-primary-yellow hover:text-primary-dark ml-2 transition-colors"
                    >
                      +31 6 39 788 989
                    </a>
                  </div>
                  <div>
                    <span className="font-semibold text-primary-dark">
                      {language === "ar" ? "البريد الإلكتروني:" : "E-mail:"}
                    </span>
                    <a
                      href="mailto:contact@medo-freight.eu"
                      className="text-primary-yellow hover:text-primary-dark ml-2 transition-colors"
                    >
                      contact@medo-freight.eu
                    </a>
                  </div>
                  <div>
                    <span className="font-semibold text-primary-dark">
                      {language === "ar" ? "الموقع الإلكتروني:" : "Website:"}
                    </span>
                    <a
                      href="http://medo-freight.eu"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-yellow hover:text-primary-dark ml-2 transition-colors"
                    >
                      http://medo-freight.eu
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust & Compliance */}
        <section
          className="py-20 bg-gradient-to-b from-gray-100 to-slate-50"
          aria-labelledby="trust-heading"
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2
                id="trust-heading"
                className="text-4xl md:text-5xl font-bold mb-4 text-primary-dark"
              >
                {t.trustTitle}
              </h2>
            </div>
            <div
              className="grid grid-cols-2 md:grid-cols-5 gap-6 items-center justify-items-center"
              role="list"
              aria-label={
                language === "ar"
                  ? "شهادات الامتثال والثقة"
                  : "Trust and compliance certifications"
              }
            >
              <div
                className="bg-gradient-to-br from-white to-slate-50 p-8 rounded-xl text-center min-w-[150px] shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-primary-yellow/50 hover:-translate-y-1"
                role="listitem"
              >
                <p
                  className="font-bold text-2xl text-primary-dark"
                  aria-label="EX-A Certification"
                >
                  EX-A
                </p>
              </div>
              <div
                className="bg-gradient-to-br from-white to-slate-50 p-8 rounded-xl text-center min-w-[150px] shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-primary-yellow/50 hover:-translate-y-1"
                role="listitem"
              >
                <p
                  className="font-bold text-2xl text-primary-dark"
                  aria-label={
                    language === "ar" ? "تأمين الشحنات" : "Shipment Insurance"
                  }
                >
                  Insurance
                </p>
              </div>
              <div
                className="bg-gradient-to-br from-white to-slate-50 p-8 rounded-xl text-center min-w-[150px] shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-primary-yellow/50 hover:-translate-y-1"
                role="listitem"
              >
                <p
                  className="font-bold text-2xl text-primary-dark"
                  aria-label="FENEX Certification"
                >
                  FENEX
                </p>
              </div>
              <div
                className="bg-gradient-to-br from-white to-slate-50 p-8 rounded-xl text-center min-w-[150px] shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-primary-yellow/50 hover:-translate-y-1"
                role="listitem"
              >
                <p
                  className="font-bold text-2xl text-primary-dark"
                  aria-label={
                    language === "ar"
                      ? "حماية البيانات الأوروبية"
                      : "European Data Protection"
                  }
                >
                  GDPR
                </p>
              </div>
              <div
                className="bg-gradient-to-br from-white to-slate-50 p-8 rounded-xl text-center min-w-[150px] shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-primary-yellow/50 hover:-translate-y-1"
                role="listitem"
              >
                <p
                  className="font-bold text-2xl text-primary-dark"
                  aria-label={
                    language === "ar" ? "الامتثال القانوني" : "Legal Compliance"
                  }
                >
                  Legal Compliance
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FCL Quote CTA */}
        <section
          className="py-16 bg-primary-dark text-white"
          aria-labelledby="fcl-quote-heading"
        >
          <div className="container mx-auto px-4 text-center">
            <h2 id="fcl-quote-heading" className="text-4xl font-bold mb-6">
              {t.fclQuote}
            </h2>
            <p className="text-xl mb-8 font-medium">
              {language === "ar"
                ? "احصل على عرض سعر فوري لشحنتك"
                : "Get an instant quote for your shipment"}
            </p>
            <Link
              href="/fcl-quote"
              className="bg-primary-yellow text-primary-dark px-8 py-3 rounded-md font-bold text-lg hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl inline-block focus:outline-none focus:ring-4 focus:ring-primary-yellow/50 focus:ring-offset-2 focus:ring-offset-primary-dark"
              aria-label={
                language === "ar"
                  ? "احصل على عرض سعر للحاويات الكاملة"
                  : "Get a full container load quote"
              }
            >
              {t.fclQuote}
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
