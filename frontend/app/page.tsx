"use client";

import { useMemo } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Countdown from "@/components/Countdown";
import PartnerLogos from "@/components/PartnerLogos";
import InteractiveMap from "@/components/InteractiveMap";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";

export default function Home() {
  const { language, isRTL, mounted } = useLanguage();
  const { isAuthenticated, loading: authLoading } = useAuth();

  // Target date: December 1, 2025
  const targetDate = useMemo(() => new Date("2025-12-01T00:00:00"), []);

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
        stage3: "التخزين",
        stage4: "التوصيل",
        trustTitle: "الثقة والامتثال",
        fclQuote: "عرض سعر FCL",
        partnersTitle: "شركاؤنا",
        videoTitle: "رحلة الشحنة من أوروبا إلى سورية",
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
        stage3: "Storage",
        stage4: "Delivery",
        trustTitle: "Trust & Compliance",
        fclQuote: "FCL Quote",
        partnersTitle: "Our Partners",
        videoTitle: "Shipment Journey from Europe to Syria",
        videoDescription:
          "Watch how we transport your shipment safely and quickly",
        centersTitle: "Our European Centers",
        galleryTitle: "Photo Gallery",
        login: "Login",
        signup: "Sign Up",
        getStarted: "Get Started",
        statsTitle: "Our Numbers",
        whyChooseUs: "Why Choose Us",
        whyChooseUsDesc: "We provide integrated and reliable shipping solutions",
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
        {/* Hero Banner with Countdown */}
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

            {/* Countdown */}
            <div
              className="mb-12"
              role="region"
              aria-label={
                language === "ar"
                  ? "العد التنازلي لإطلاق الخدمة"
                  : "Service launch countdown"
              }
            >
              <p className="text-xl mb-6 font-semibold">
                {language === "ar"
                  ? "العد التنازلي حتى 1 ديسمبر 2025"
                  : "Countdown to December 1, 2025"}
              </p>
              <Countdown language={language} targetDate={targetDate} />
            </div>

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
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-primary-dark text-white" aria-labelledby="stats-heading">
          <div className="container mx-auto px-4">
            <h2 id="stats-heading" className="text-4xl font-bold text-center mb-12 text-primary-yellow">
              {t.statsTitle}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-5xl md:text-6xl font-bold text-primary-yellow mb-2">10K+</div>
                <div className="text-lg text-gray-300">{t.statsShipments}</div>
              </div>
              <div className="text-center">
                <div className="text-5xl md:text-6xl font-bold text-primary-yellow mb-2">50+</div>
                <div className="text-lg text-gray-300">{t.statsCountries}</div>
              </div>
              <div className="text-center">
                <div className="text-5xl md:text-6xl font-bold text-primary-yellow mb-2">15+</div>
                <div className="text-lg text-gray-300">{t.statsYears}</div>
              </div>
              <div className="text-center">
                <div className="text-5xl md:text-6xl font-bold text-primary-yellow mb-2">5K+</div>
                <div className="text-lg text-gray-300">{t.statsClients}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-20 bg-gradient-to-b from-slate-50 to-gray-100" aria-labelledby="why-choose-heading">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 id="why-choose-heading" className="text-4xl md:text-5xl font-bold mb-4 text-primary-dark">
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
                  <svg className="w-8 h-8 text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-primary-dark">{t.feature1}</h3>
                <p className="text-gray-600 leading-relaxed">{t.feature1Desc}</p>
              </div>
              {/* Feature 2 */}
              <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-primary-yellow/50">
                <div className="w-14 h-14 bg-primary-yellow rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-primary-dark">{t.feature2}</h3>
                <p className="text-gray-600 leading-relaxed">{t.feature2Desc}</p>
              </div>
              {/* Feature 3 */}
              <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-primary-yellow/50">
                <div className="w-14 h-14 bg-primary-yellow rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-primary-dark">{t.feature3}</h3>
                <p className="text-gray-600 leading-relaxed">{t.feature3Desc}</p>
              </div>
              {/* Feature 4 */}
              <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-primary-yellow/50">
                <div className="w-14 h-14 bg-primary-yellow rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-primary-dark">{t.feature4}</h3>
                <p className="text-gray-600 leading-relaxed">{t.feature4Desc}</p>
              </div>
              {/* Feature 5 */}
              <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-primary-yellow/50">
                <div className="w-14 h-14 bg-primary-yellow rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-primary-dark">{t.feature5}</h3>
                <p className="text-gray-600 leading-relaxed">{t.feature5Desc}</p>
              </div>
              {/* Feature 6 */}
              <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-primary-yellow/50">
                <div className="w-14 h-14 bg-primary-yellow rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-primary-dark">{t.feature6}</h3>
                <p className="text-gray-600 leading-relaxed">{t.feature6Desc}</p>
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
        <section className="py-20 bg-gradient-to-b from-white to-gray-50" aria-labelledby="video-heading">
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
                {/* Video Placeholder - Replace with actual video */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-24 h-24 bg-primary-yellow/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                      <svg
                        className="w-12 h-12 text-primary-dark ml-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                        role="img"
                      >
                        <title>
                          {language === "ar"
                            ? "أيقونة تشغيل الفيديو"
                            : "Play video icon"}
                        </title>
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                    <p className="text-xl font-semibold mb-2">
                      {language === "ar"
                        ? "فيديو تعريفي"
                        : "Intro Video"}
                    </p>
                    <p className="text-gray-300 text-sm">
                      {language === "ar"
                        ? "سيتم إضافة الفيديو الحقيقي قريباً"
                        : "Real video will be added soon"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Photo Gallery */}
        <section className="py-20 bg-gradient-to-b from-gray-50 to-slate-100" aria-labelledby="gallery-heading">
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
        <section className="py-16 bg-gradient-to-b from-slate-100 to-gray-50" aria-labelledby="map-heading">
          <div className="container mx-auto px-4">
            <InteractiveMap language={language} />
          </div>
        </section>

        {/* Trust & Compliance */}
        <section className="py-20 bg-gradient-to-b from-gray-100 to-slate-50" aria-labelledby="trust-heading">
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
