"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Language = "ar" | "en";

interface FooterProps {
  language: Language;
}

export default function Footer({ language }: FooterProps) {
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
      createShipment: "إنشاء شحنة LCL سوريا",
      faq: "الأسئلة الشائعة",
      europeCenters: "مراكز أوروبا",
      aleppoCenter: "مركز حلب والتوزيع",
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
      createShipment: "Create LCL Shipment Syria",
      faq: "FAQ",
      europeCenters: "Europe Centers",
      aleppoCenter: "Aleppo Distribution Center",
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
                ? "نوفّر شحنًا شهريًا من أوروبا إلى سورية ودول الشرق الأوسط بأسعار ثابتة."
                : "Monthly EU→MENA sea freight with transparent pricing."}
            </p>
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
                  href="/aleppo-center"
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
