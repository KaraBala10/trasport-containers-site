"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Footer() {
  const { language } = useLanguage();
  const [isMounted, setIsMounted] = useState(false);
  const isRTL = language === "ar";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const translations = {
    ar: {
      company: "الشركة",
      services: "الخدمات",
      legal: "قانوني",
      contact: "اتصل بنا",
      followUs: "تابعنا",
      rights: "جميع الحقوق محفوظة",
      about: "من نحن",
      createShipment: "إنشاء شحنة LCL جزئية",
      faq: "الأسئلة الشائعة",
      europeCenters: "مراكز أوروبا",
      aleppoCenter: "مركز الشرق الأوسط والتوزيع",
      prohibitedGoods: "البضائع المحظورة",
      privacy: "سياسة الخصوصية",
      terms: "الشروط والأحكام",
      contracts: "العقود",
      emergency: "اتصال الطوارئ",
      appendixB: "الملحق (B)",
    },
    en: {
      company: "Company",
      services: "Services",
      legal: "Legal",
      contact: "Contact Us",
      followUs: "Follow Us",
      rights: "All rights reserved",
      about: "About",
      createShipment: "Create LCL Partial Shipment",
      faq: "FAQ",
      europeCenters: "Europe Centers",
      aleppoCenter: "Middle East Distribution Center",
      prohibitedGoods: "Prohibited Goods",
      privacy: "Privacy Policy",
      terms: "Terms & Conditions",
      contracts: "Contracts",
      emergency: "Emergency Contact",
      appendixB: "Appendix B",
    },
  };

  const t = translations[language];

  return (
    <footer className="bg-primary-dark text-white mt-20" role="contentinfo">
      <div className="container mx-auto px-4 py-12">
        <nav
          className="grid grid-cols-1 md:grid-cols-4 gap-8"
          aria-label={language === "ar" ? "روابط التذييل" : "Footer navigation"}
        >
          {/* Logo & Description */}
          <div>
            <div className="text-2xl font-bold mb-2" aria-label="Company name">
              MEDO-FREIGHT.EU
            </div>
            <p className="text-gray-300 text-base font-medium">
              Freight · Route · Deliver
            </p>
            <p className="text-gray-400 text-sm mt-4">
              {language === "ar"
                ? "نوفّر شحنًا شهريًا من أوروبا إلى دول الشرق الأوسط بأسعار ثابتة."
                : "Monthly EU→MENA sea freight with transparent pricing."}
            </p>
            
            {/* Social Media Links */}
            <div className="mt-6">
              <h3 className="font-bold mb-4 text-lg">{t.followUs}</h3>
              <div className="flex flex-wrap gap-3" role="list" aria-label={language === "ar" ? "روابط التواصل الاجتماعي" : "Social media links"}>
                {/* YouTube */}
                <a
                  href="https://www.youtube.com/@medo-freighteu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white p-3 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-red-500/50 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-primary-dark"
                  aria-label={language === "ar" ? "زيارة قناة اليوتيوب" : "Visit our YouTube channel"}
                  role="listitem"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>

                {/* Facebook */}
                <a
                  href="https://www.facebook.com/share/1bmbp5cpnB/?mibextid=wwXIfr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white p-3 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-primary-dark"
                  aria-label={language === "ar" ? "زيارة صفحة الفيسبوك" : "Visit our Facebook page"}
                  role="listitem"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>

                {/* TikTok */}
                <a
                  href="https://www.tiktok.com/@medo.freight.eu?_r=1&_t=ZG-91VsA4BS0oq"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-gradient-to-br from-gray-900 to-black hover:from-gray-800 hover:to-gray-900 text-white p-3 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-gray-500/50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-primary-dark"
                  aria-label={language === "ar" ? "زيارة حساب التيك توك" : "Visit our TikTok account"}
                  role="listitem"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href="https://www.instagram.com/medo.freighteu?igsh=dzV5Z3hxeDU5MWhr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 hover:from-purple-500 hover:via-pink-500 hover:to-orange-400 text-white p-3 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-pink-500/50 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 focus:ring-offset-primary-dark"
                  aria-label={language === "ar" ? "زيارة حساب الإنستغرام" : "Visit our Instagram account"}
                  role="listitem"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>

                {/* LinkedIn */}
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-gradient-to-br from-blue-700 to-blue-800 hover:from-blue-600 hover:to-blue-700 text-white p-3 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-primary-dark"
                  aria-label={language === "ar" ? "زيارة صفحة لينكد إن" : "Visit our LinkedIn page"}
                  role="listitem"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Company & Services */}
          <div>
            <h3 className="font-bold mb-4 text-lg">{t.company}</h3>
            <ul className="space-y-2 text-sm" role="list">
              <li>
                <Link
                  href="/about"
                  className="text-gray-300 hover:text-primary-yellow transition-colors focus:outline-none focus:ring-2 focus:ring-primary-yellow/50 rounded px-1 py-0.5 inline-block"
                >
                  {t.about}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-300 hover:text-primary-yellow transition-colors focus:outline-none focus:ring-2 focus:ring-primary-yellow/50 rounded px-1 py-0.5 inline-block"
                >
                  {t.contact}
                </Link>
              </li>
              <li>
                <Link
                  href="/create-shipment"
                  className="text-gray-300 hover:text-primary-yellow transition-colors focus:outline-none focus:ring-2 focus:ring-primary-yellow/50 rounded px-1 py-0.5 inline-block"
                >
                  {t.createShipment}
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-gray-300 hover:text-primary-yellow transition-colors focus:outline-none focus:ring-2 focus:ring-primary-yellow/50 rounded px-1 py-0.5 inline-block"
                >
                  {t.faq}
                </Link>
              </li>
            </ul>
          </div>

          {/* Centers */}
          <div>
            <h3 className="font-bold mb-4 text-lg">
              {language === "ar" ? "المراكز" : "Centers"}
            </h3>
            <ul className="space-y-2 text-sm" role="list">
              <li>
                <Link
                  href="/europe-centers"
                  className="text-gray-300 hover:text-primary-yellow transition-colors focus:outline-none focus:ring-2 focus:ring-primary-yellow/50 rounded px-1 py-0.5 inline-block"
                >
                  {t.europeCenters}
                </Link>
              </li>
              <li>
                <Link
                  href="/middle-east-center"
                  className="text-gray-300 hover:text-primary-yellow transition-colors focus:outline-none focus:ring-2 focus:ring-primary-yellow/50 rounded px-1 py-0.5 inline-block"
                >
                  {t.aleppoCenter}
                </Link>
              </li>
              <li>
                <Link
                  href="/prohibited-goods"
                  className="text-gray-300 hover:text-primary-yellow transition-colors focus:outline-none focus:ring-2 focus:ring-primary-yellow/50 rounded px-1 py-0.5 inline-block"
                >
                  {t.prohibitedGoods}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold mb-4 text-lg">{t.legal}</h3>
            <ul className="space-y-2 text-sm" role="list">
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-300 hover:text-primary-yellow transition-colors focus:outline-none focus:ring-2 focus:ring-primary-yellow/50 rounded px-1 py-0.5 inline-block"
                >
                  {t.privacy}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-gray-300 hover:text-primary-yellow transition-colors focus:outline-none focus:ring-2 focus:ring-primary-yellow/50 rounded px-1 py-0.5 inline-block"
                >
                  {t.terms}
                </Link>
              </li>
              <li>
                <Link
                  href="/contracts"
                  className="text-gray-300 hover:text-primary-yellow transition-colors focus:outline-none focus:ring-2 focus:ring-primary-yellow/50 rounded px-1 py-0.5 inline-block"
                >
                  {t.contracts}
                </Link>
              </li>
              <li>
                <Link
                  href="/emergency"
                  className="text-gray-300 hover:text-primary-yellow transition-colors focus:outline-none focus:ring-2 focus:ring-primary-yellow/50 rounded px-1 py-0.5 inline-block"
                >
                  {t.emergency}
                </Link>
              </li>
              <li>
                <Link
                  href="/appendix-b"
                  className="text-gray-300 hover:text-primary-yellow transition-colors focus:outline-none focus:ring-2 focus:ring-primary-yellow/50 rounded px-1 py-0.5 inline-block"
                >
                  {t.appendixB}
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-300">
          <p suppressHydrationWarning className="mb-2">
            © {isMounted ? new Date().getFullYear() : 2025}{" "}
            {language === "ar" ? "شركة MEDO-B2B EU" : "MEDO-B2B EU Company"} –{" "}
            {t.rights}
          </p>
          <p className="text-xs text-gray-400">
            {language === "ar"
              ? "القانون المعتمد: مملكة هولندا – اختصاص روتردام"
              : "Governed by: Kingdom of the Netherlands – Rotterdam Jurisdiction"}
          </p>
        </div>
      </div>
    </footer>
  );
}
