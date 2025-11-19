"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";
import { useAuth } from "@/hooks/useAuth";

type Language = "ar" | "en";

interface HeaderProps {
  language?: Language;
  setLanguage?: (lang: Language) => void;
}

export default function Header({
  language: propLanguage,
  setLanguage: propSetLanguage,
}: HeaderProps = {}) {
  // Default to 'ar' if language prop is not provided
  const [internalLanguage, setInternalLanguage] = useState<Language>("ar");
  // Ensure language is always a valid value ('ar' or 'en')
  const language: Language =
    propLanguage === "ar" || propLanguage === "en"
      ? propLanguage
      : internalLanguage;
  const setLanguage = propSetLanguage ?? setInternalLanguage;

  const isRTL = language === "ar";
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Fix hydration error by only setting dir/lang after mount
  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      const html = document.documentElement;
      const dir = isRTL ? "rtl" : "ltr";
      html.setAttribute("dir", dir);
      html.setAttribute("lang", language);
    }
  }, [language, isRTL]);

  const translations = {
    ar: {
      home: "الرئيسية",
      pricing: "الأسعار",
      tracking: "التتبع",
      about: "من نحن",
      contact: "اتصل بنا",
      faq: "الأسئلة الشائعة",
      createShipment: "إنشاء شحنة",
    },
    en: {
      home: "Home",
      pricing: "Pricing",
      tracking: "Tracking",
      about: "About",
      contact: "Contact",
      faq: "FAQ",
      createShipment: "Create Shipment",
    },
  };

  // Ensure we always have a valid translation object
  const t = translations[language] || translations.ar;

  return (
    <header className="bg-white shadow-md sticky top-0 z-50" role="banner">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo Placeholder */}
          <Link
            href="/"
            className="flex items-center focus:outline-none focus:ring-4 focus:ring-primary-yellow/50 rounded-md px-2 py-1 -mx-2 -my-1"
            aria-label={
              language === "ar"
                ? "العودة إلى الصفحة الرئيسية - MEDO-FREIGHT.EU"
                : "Go to homepage - MEDO-FREIGHT.EU"
            }
          >
            <div className="text-2xl font-bold text-primary-dark">
              MEDO-FREIGHT.EU
            </div>
            <div
              className={`${
                isRTL ? "mr-2" : "ml-2"
              } text-sm text-gray-700 font-medium`}
              aria-hidden="true"
            >
              Freight · Route · Deliver
            </div>
          </Link>

          {/* Navigation */}
          <nav
            className="hidden md:flex items-center gap-6"
            role="navigation"
            aria-label={
              language === "ar" ? "التنقل الرئيسي" : "Main navigation"
            }
          >
            <Link
              href="/"
              className={`relative text-gray-800 hover:text-primary-dark transition-colors font-medium focus:outline-none focus:ring-4 focus:ring-primary-yellow/50 rounded px-2 py-1 ${
                pathname === "/" ? "text-primary-dark" : ""
              }`}
              aria-label={t.home}
              aria-current={pathname === "/" ? "page" : undefined}
            >
              {t.home}
              {pathname === "/" && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-1 bg-primary-yellow rounded-full"
                  aria-hidden="true"
                ></span>
              )}
            </Link>
            <Link
              href="/pricing"
              className={`relative text-gray-800 hover:text-primary-dark transition-colors font-medium focus:outline-none focus:ring-4 focus:ring-primary-yellow/50 rounded px-2 py-1 ${
                pathname === "/pricing" ? "text-primary-dark" : ""
              }`}
              aria-label={t.pricing}
              aria-current={pathname === "/pricing" ? "page" : undefined}
            >
              {t.pricing}
              {pathname === "/pricing" && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-1 bg-primary-yellow rounded-full"
                  aria-hidden="true"
                ></span>
              )}
            </Link>
            <Link
              href="/tracking"
              className={`relative text-gray-800 hover:text-primary-dark transition-colors font-medium focus:outline-none focus:ring-4 focus:ring-primary-yellow/50 rounded px-2 py-1 ${
                pathname === "/tracking" ? "text-primary-dark" : ""
              }`}
              aria-label={t.tracking}
              aria-current={pathname === "/tracking" ? "page" : undefined}
            >
              {t.tracking}
              {pathname === "/tracking" && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-1 bg-primary-yellow rounded-full"
                  aria-hidden="true"
                ></span>
              )}
            </Link>
            <Link
              href="/about"
              className={`relative text-gray-800 hover:text-primary-dark transition-colors font-medium focus:outline-none focus:ring-4 focus:ring-primary-yellow/50 rounded px-2 py-1 ${
                pathname === "/about" ? "text-primary-dark" : ""
              }`}
              aria-label={t.about}
              aria-current={pathname === "/about" ? "page" : undefined}
            >
              {t.about}
              {pathname === "/about" && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-1 bg-primary-yellow rounded-full"
                  aria-hidden="true"
                ></span>
              )}
            </Link>
            <Link
              href="/contact"
              className={`relative text-gray-800 hover:text-primary-dark transition-colors font-medium focus:outline-none focus:ring-4 focus:ring-primary-yellow/50 rounded px-2 py-1 ${
                pathname === "/contact" ? "text-primary-dark" : ""
              }`}
              aria-label={t.contact}
              aria-current={pathname === "/contact" ? "page" : undefined}
            >
              {t.contact}
              {pathname === "/contact" && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-1 bg-primary-yellow rounded-full"
                  aria-hidden="true"
                ></span>
              )}
            </Link>
            <Link
              href="/faq"
              className={`relative text-gray-800 hover:text-primary-dark transition-colors font-medium focus:outline-none focus:ring-4 focus:ring-primary-yellow/50 rounded px-2 py-1 ${
                pathname === "/faq" ? "text-primary-dark" : ""
              }`}
              aria-label={t.faq}
              aria-current={pathname === "/faq" ? "page" : undefined}
            >
              {t.faq}
              {pathname === "/faq" && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-1 bg-primary-yellow rounded-full"
                  aria-hidden="true"
                ></span>
              )}
            </Link>
            <Link
              href="/create-shipment"
              className={`relative text-gray-800 hover:text-primary-dark transition-colors font-medium focus:outline-none focus:ring-4 focus:ring-primary-yellow/50 rounded px-2 py-1 ${
                pathname === "/create-shipment" ? "text-primary-dark" : ""
              }`}
              aria-label={
                language === "ar" ? "إنشاء شحنة جديدة" : "Create a new shipment"
              }
              aria-current={
                pathname === "/create-shipment" ? "page" : undefined
              }
            >
              {t.createShipment}
              {pathname === "/create-shipment" && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-1 bg-primary-yellow rounded-full"
                  aria-hidden="true"
                ></span>
              )}
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {/* Authentication Buttons */}
            {mounted && (
              <>
                {isAuthenticated ? (
                  <div className="flex items-center gap-3">
                    <Link
                      href="/dashboard"
                      className="text-gray-800 hover:text-primary-dark transition-colors font-medium focus:outline-none focus:ring-4 focus:ring-primary-yellow/50 rounded px-2 py-1"
                    >
                      {user?.first_name || user?.username || "Dashboard"}
                    </Link>
                    <button
                      onClick={logout}
                      className="text-gray-800 hover:text-primary-dark transition-colors font-medium focus:outline-none focus:ring-4 focus:ring-primary-yellow/50 rounded px-2 py-1"
                    >
                      {language === "ar" ? "تسجيل الخروج" : "Logout"}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Link
                      href="/login"
                      className="text-gray-800 hover:text-primary-dark transition-colors font-medium focus:outline-none focus:ring-4 focus:ring-primary-yellow/50 rounded px-2 py-1"
                    >
                      {language === "ar" ? "تسجيل الدخول" : "Login"}
                    </Link>
                    <Link
                      href="/register"
                      className="bg-primary-yellow text-primary-dark px-4 py-2 rounded-md font-bold hover:bg-opacity-90 transition-colors focus:outline-none focus:ring-4 focus:ring-primary-yellow/50"
                    >
                      {language === "ar" ? "إنشاء حساب" : "Sign Up"}
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* Language Switcher */}
            <LanguageSwitcher language={language} setLanguage={setLanguage} />
          </div>
        </div>
      </div>
    </header>
  );
}
