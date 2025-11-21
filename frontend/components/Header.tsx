"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";

export default function Header() {
  // Always use the context hook for consistent language state
  const { language, setLanguage, mounted, isRTL } = useLanguage();

  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const translations = {
    ar: {
      home: "الرئيسية",
      tracking: "التتبع",
      about: "من نحن",
      contact: "اتصل بنا",
      faq: "الأسئلة الشائعة",
      createShipment: "إنشاء شحنة LCL سوريا",
      login: "تسجيل الدخول",
      signup: "إنشاء حساب",
      logout: "تسجيل الخروج",
      dashboard: "لوحة التحكم",
    },
    en: {
      home: "Home",
      tracking: "Tracking",
      about: "About",
      contact: "Contact",
      faq: "FAQ",
      createShipment: "Create LCL Shipment Syria",
      login: "Login",
      signup: "Sign Up",
      logout: "Logout",
      dashboard: "Dashboard",
    },
  };

  // Ensure we always have a valid translation object
  const t = translations[language] || translations.ar;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { href: "/", label: t.home },
    { href: "/tracking", label: t.tracking },
    { href: "/about", label: t.about },
    { href: "/contact", label: t.contact },
    { href: "/faq", label: t.faq },
    { href: "/create-shipment", label: t.createShipment },
  ];

  const NavLink = ({
    href,
    label,
    isMobile = false,
  }: {
    href: string;
    label: string;
    isMobile?: boolean;
  }) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        className={`
          relative group px-4 py-2 rounded-lg font-medium transition-all duration-300
          ${
            isMobile
              ? `text-lg ${
                  isActive
                    ? "text-primary-dark bg-primary-yellow/20 font-bold"
                    : "text-gray-700 hover:text-primary-dark hover:bg-gray-100"
                }`
              : `text-sm ${
                  isActive
                    ? "text-primary-dark font-semibold"
                    : "text-gray-700 hover:text-primary-dark"
                }`
          }
          focus:outline-none focus:ring-2 focus:ring-primary-yellow/50 focus:ring-offset-2
        `}
        aria-current={isActive ? "page" : undefined}
        onClick={() => isMobile && setIsMobileMenuOpen(false)}
      >
        <span className="relative z-10">{label}</span>
        {isActive && !isMobile && (
          <span
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-primary-yellow rounded-full transition-all duration-300"
            aria-hidden="true"
          />
        )}
        {!isActive && !isMobile && (
          <span
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-primary-yellow rounded-full transition-all duration-300 group-hover:w-1/2"
            aria-hidden="true"
          />
        )}
      </Link>
    );
  };

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg"
            : "bg-white shadow-md"
        }
      `}
      role="banner"
    >
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-3 focus:outline-none focus:ring-4 focus:ring-primary-yellow/50 rounded-lg px-2 py-1 -mx-2 -my-1 transition-transform hover:scale-105"
            aria-label={
              language === "ar"
                ? "العودة إلى الصفحة الرئيسية - MEDO-FREIGHT.EU"
                : "Go to homepage - MEDO-FREIGHT.EU"
            }
          >
            <div className="relative">
              <div className="text-2xl lg:text-3xl font-bold text-primary-dark tracking-tight">
                MEDO-FREIGHT
              </div>
              <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-primary-yellow via-primary-yellow/80 to-transparent rounded-full" />
            </div>
            <div
              className={`hidden sm:block text-xs lg:text-sm text-gray-600 font-medium ${
                isRTL ? "mr-2" : "ml-2"
              }`}
              aria-hidden="true"
            >
              <span className="text-primary-yellow font-semibold">·</span>{" "}
              Freight{" "}
              <span className="text-primary-yellow font-semibold">·</span> Route{" "}
              <span className="text-primary-yellow font-semibold">·</span>{" "}
              Deliver
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden lg:flex items-center gap-1"
            role="navigation"
            aria-label={
              language === "ar" ? "التنقل الرئيسي" : "Main navigation"
            }
          >
            {navLinks.map((link) => (
              <NavLink key={link.href} href={link.href} label={link.label} />
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3 lg:gap-4">
            {/* Authentication Buttons - Desktop */}
            {mounted && (
              <div className="hidden md:flex items-center gap-3">
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-dark transition-colors rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-yellow/50"
                    >
                      {user?.first_name || user?.username || t.dashboard}
                    </Link>
                    <button
                      onClick={logout}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                    >
                      {t.logout}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-dark transition-colors rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-yellow/50"
                    >
                      {t.login}
                    </Link>
                    <Link
                      href="/register"
                      className="px-4 py-2 text-sm font-bold text-primary-dark bg-primary-yellow rounded-lg hover:bg-primary-yellow/90 transition-all duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:ring-offset-2 transform hover:scale-105"
                    >
                      {t.signup}
                    </Link>
                  </>
                )}
              </div>
            )}

            {/* Language Switcher */}
            <div className="hidden sm:block">
              <LanguageSwitcher language={language} setLanguage={setLanguage} />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-700 hover:text-primary-dark hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-yellow/50 transition-colors"
              aria-label={
                isMobileMenuOpen
                  ? language === "ar"
                    ? "إغلاق القائمة"
                    : "Close menu"
                  : language === "ar"
                  ? "فتح القائمة"
                  : "Open menu"
              }
              aria-expanded={isMobileMenuOpen}
            >
              <div className="w-6 h-6 flex flex-col justify-center gap-1.5">
                <span
                  className={`block h-0.5 w-6 bg-current transition-all duration-300 ${
                    isMobileMenuOpen ? "rotate-45 translate-y-2" : ""
                  }`}
                />
                <span
                  className={`block h-0.5 w-6 bg-current transition-all duration-300 ${
                    isMobileMenuOpen ? "opacity-0" : ""
                  }`}
                />
                <span
                  className={`block h-0.5 w-6 bg-current transition-all duration-300 ${
                    isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`
          lg:hidden fixed inset-x-0 top-20 bottom-0 bg-white/98 backdrop-blur-lg shadow-2xl
          transform transition-transform duration-300 ease-in-out overflow-y-auto
          ${
            isMobileMenuOpen
              ? "translate-x-0"
              : isRTL
              ? "translate-x-full"
              : "-translate-x-full"
          }
        `}
        aria-hidden={!isMobileMenuOpen}
      >
        <nav
          className="container mx-auto px-4 py-8 space-y-2"
          role="navigation"
          aria-label={
            language === "ar" ? "القائمة المحمولة" : "Mobile navigation"
          }
        >
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              label={link.label}
              isMobile={true}
            />
          ))}

          <div className="pt-6 border-t border-gray-200 mt-6 space-y-3">
            {mounted && (
              <>
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="block px-4 py-3 text-lg font-medium text-gray-700 hover:text-primary-dark hover:bg-gray-100 rounded-lg transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {user?.first_name || user?.username || t.dashboard}
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full px-4 py-3 text-lg font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
                    >
                      {t.logout}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block px-4 py-3 text-lg font-medium text-gray-700 hover:text-primary-dark hover:bg-gray-100 rounded-lg transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t.login}
                    </Link>
                    <Link
                      href="/register"
                      className="block px-4 py-3 text-lg font-bold text-primary-dark bg-primary-yellow rounded-lg hover:bg-primary-yellow/90 transition-colors text-center shadow-md"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t.signup}
                    </Link>
                  </>
                )}
              </>
            )}
            <div className="pt-4 border-t border-gray-200">
              <LanguageSwitcher language={language} setLanguage={setLanguage} />
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40 top-20"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </header>
  );
}
