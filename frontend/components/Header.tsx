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
      about: "من نحن",
      contact: "اتصل بنا",
      faq: "الأسئلة الشائعة",
      createShipment: "إنشاء شحنة LCL جزئية",
      login: "تسجيل الدخول",
      signup: "إنشاء حساب",
      logout: "تسجيل الخروج",
      dashboard: "لوحة التحكم",
    },
    en: {
      home: "Home",
      about: "About",
      contact: "Contact",
      faq: "FAQ",
      createShipment: "Create LCL Partial Shipment",
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
          relative group px-3 py-2 rounded-lg font-medium transition-all duration-300 block
          ${
            isMobile
              ? `text-base ${
                  isActive
                    ? "text-primary-dark bg-primary-yellow/30 font-bold border-l-4 border-primary-yellow"
                    : "text-gray-900 hover:text-primary-dark hover:bg-gray-100 border-l-4 border-transparent"
                }`
              : `text-sm ${
                  isActive
                    ? "text-white font-semibold"
                    : "text-gray-200 hover:text-white"
                }`
          }
          focus:outline-none focus:ring-2 focus:ring-primary-yellow/50 focus:ring-offset-2
        `}
        aria-current={isActive ? "page" : undefined}
        onClick={() => isMobile && setIsMobileMenuOpen(false)}
      >
        <span className="relative z-10 whitespace-nowrap">{label}</span>
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
    <>
      <header
        className={`
          fixed top-0 left-0 right-0 z-[100] transition-all duration-300
          w-full max-w-full overflow-x-hidden
          ${
            isScrolled
              ? "bg-[#0a1628] backdrop-blur-md shadow-lg"
              : "bg-[#0a1628] backdrop-blur-sm shadow-md"
          }
        `}
        role="banner"
      >
      <div className="container mx-auto px-4 lg:px-6 w-full max-w-full overflow-x-hidden">
        <div className="flex items-center justify-between h-20 min-w-0 w-full">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 sm:space-x-3 focus:outline-none focus:ring-4 focus:ring-primary-yellow/50 rounded-lg px-2 py-1 -mx-2 -my-1 transition-transform hover:scale-105 flex-shrink-0 min-w-0 max-w-[50%] sm:max-w-none"
            aria-label={
              language === "ar"
                ? "العودة إلى الصفحة الرئيسية - MEDO-FREIGHT.EU"
                : "Go to homepage - MEDO-FREIGHT.EU"
            }
          >
            <div className="relative flex-shrink-0 min-w-0">
              <div className="text-lg sm:text-xl md:text-2xl lg:text-2xl font-bold text-white tracking-tight truncate">
                MEDO-FREIGHT
              </div>
              <div className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-yellow via-primary-yellow/80 to-transparent rounded-full" />
            </div>
            <div
              className={`hidden sm:block text-xs md:text-sm text-gray-300 font-medium flex-shrink-0 whitespace-nowrap ${
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
            className="hidden lg:flex items-center gap-0.5 flex-shrink-0 min-w-0"
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
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0 min-w-0">
            {/* Authentication Buttons - Desktop */}
            {mounted && (
              <div className="hidden md:flex items-center gap-2 flex-shrink-0 min-w-0">
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="px-3 py-2 text-sm font-medium text-gray-200 hover:text-white transition-colors rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary-yellow/50 whitespace-nowrap"
                    >
                      {user?.first_name || user?.username || t.dashboard}
                    </Link>
                    <button
                      onClick={logout}
                      className="px-3 py-2 text-sm font-medium text-gray-200 hover:text-red-300 transition-colors rounded-lg hover:bg-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-500/50 whitespace-nowrap"
                    >
                      {t.logout}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="px-3 py-2 text-sm font-medium text-gray-200 hover:text-white transition-colors rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary-yellow/50 whitespace-nowrap"
                    >
                      {t.login}
                    </Link>
                    <Link
                      href="/register"
                      className="px-4 py-2 text-sm font-bold text-primary-dark bg-primary-yellow rounded-lg hover:bg-primary-yellow/90 transition-all duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:ring-offset-2 transform hover:scale-105 whitespace-nowrap"
                    >
                      {t.signup}
                    </Link>
                  </>
                )}
              </div>
            )}

            {/* Language Switcher - Hidden on mobile to save space */}
            <div className="hidden md:block">
              <LanguageSwitcher language={language} setLanguage={setLanguage} />
            </div>

            {/* Mobile Menu Button - Always visible on small screens, hidden on large */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-white hover:text-primary-yellow hover:bg-white/10 active:bg-white/20 focus:outline-none focus:ring-2 focus:ring-primary-yellow/50 transition-all duration-200 relative z-[101] flex-shrink-0 min-w-[40px] min-h-[40px] flex items-center justify-center"
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
              type="button"
            >
              <div className="w-5 h-5 flex flex-col justify-center gap-1.5 relative">
                <span
                  className={`block h-0.5 w-5 bg-current transition-all duration-300 ease-in-out ${
                    isMobileMenuOpen ? "rotate-45 translate-y-1.5" : ""
                  }`}
                />
                <span
                  className={`block h-0.5 w-5 bg-current transition-all duration-300 ease-in-out ${
                    isMobileMenuOpen ? "opacity-0 scale-0" : "opacity-100 scale-100"
                  }`}
                />
                <span
                  className={`block h-0.5 w-5 bg-current transition-all duration-300 ease-in-out ${
                    isMobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>

    {/* Mobile Menu Overlay - Behind menu */}
    {isMobileMenuOpen && (
      <div
        className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[99] overflow-x-hidden"
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      />
    )}

    {/* Mobile Menu - Drops down from header */}
    {isMobileMenuOpen && (
      <div
        className="lg:hidden fixed top-20 left-0 right-0 bottom-0 bg-white shadow-2xl z-[101] w-full max-w-full overflow-x-hidden"
        style={{ backgroundColor: '#ffffff' }}
        aria-hidden={false}
      >
        <div className="h-full overflow-y-auto overflow-x-hidden">
          <nav
            className="w-full px-4 py-6 sm:py-8 space-y-2"
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
                        className="block px-4 py-3 text-lg font-medium text-gray-800 hover:text-primary-dark hover:bg-gray-100 rounded-lg transition-colors"
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
                        className="block px-4 py-3 text-lg font-medium text-gray-800 hover:text-primary-dark hover:bg-gray-100 rounded-lg transition-colors"
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
      </div>
    )}
    </>
  );
}
