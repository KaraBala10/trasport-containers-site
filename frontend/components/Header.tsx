"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";

// Constants
const HEADER_HEIGHT = "h-20"; // 80px
const SCROLL_THRESHOLD = 10;

// Translations
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
    mainNav: "التنقل الرئيسي",
    mobileNav: "القائمة المحمولة",
    closeMenu: "إغلاق القائمة",
    openMenu: "فتح القائمة",
    goToHome: "العودة إلى الصفحة الرئيسية - MEDO-FREIGHT.EU",
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
    mainNav: "Main navigation",
    mobileNav: "Mobile navigation",
    closeMenu: "Close menu",
    openMenu: "Open menu",
    goToHome: "Go to homepage - MEDO-FREIGHT.EU",
  },
};

// NavLink Component with enhanced styling
interface NavLinkProps {
  href: string;
  label: string;
  isMobile?: boolean;
  pathname: string;
  isRTL: boolean;
  onClick?: () => void;
}

function NavLink({
  href,
  label,
  isMobile = false,
  pathname,
  isRTL,
  onClick,
}: NavLinkProps) {
  const isActive = pathname === href;

  const desktopClasses = `
    relative group px-4 py-2.5 rounded-xl font-medium transition-all duration-300
    text-sm
    ${
      isActive
        ? "text-white font-semibold bg-white/10 backdrop-blur-sm shadow-lg"
        : "text-gray-200 hover:text-white hover:bg-white/5"
    }
    focus:outline-none focus:ring-2 focus:ring-primary-yellow/50 focus:ring-offset-2
    before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-r before:from-primary-yellow/0 before:via-primary-yellow/0 before:to-primary-yellow/0
    before:transition-all before:duration-300
    hover:before:from-primary-yellow/10 hover:before:via-primary-yellow/5 hover:before:to-primary-yellow/10
    ${isActive ? "shadow-[0_0_20px_rgba(255,210,0,0.3)]" : ""}
  `;

  const mobileClasses = `
    relative group px-5 py-3.5 rounded-xl font-medium transition-all duration-300 block text-base
    ${
      isActive
        ? "text-primary-dark bg-gradient-to-r from-primary-yellow/40 to-primary-yellow/20 font-bold border-l-4 border-primary-yellow shadow-md"
        : "text-gray-800 hover:text-primary-dark hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 border-l-4 border-transparent hover:border-primary-yellow/30"
    }
    focus:outline-none focus:ring-2 focus:ring-primary-yellow/50 focus:ring-offset-2
    transform hover:translate-x-1 transition-transform
  `;

  return (
    <Link
      href={href}
      className={isMobile ? mobileClasses.trim() : desktopClasses.trim()}
      aria-current={isActive ? "page" : undefined}
      onClick={onClick}
    >
      <span className="relative z-10 whitespace-nowrap flex items-center gap-2">
        {label}
        {isActive && !isMobile && (
          <span className="w-1.5 h-1.5 bg-primary-yellow rounded-full animate-pulse" />
        )}
      </span>
      {!isMobile && (
        <>
          {isActive && (
            <span
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2/3 h-1 bg-gradient-to-r from-transparent via-primary-yellow to-transparent rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(255,210,0,0.5)]"
              aria-hidden="true"
            />
          )}
          {!isActive && (
            <span
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-transparent via-primary-yellow to-transparent rounded-full transition-all duration-300 group-hover:w-2/3"
              aria-hidden="true"
            />
          )}
        </>
      )}
    </Link>
  );
}

// Enhanced Logo Component
interface LogoProps {
  language: "ar" | "en";
  isRTL: boolean;
  goToHomeLabel: string;
}

function Logo({ language, isRTL, goToHomeLabel }: LogoProps) {
  return (
    <Link
      href="/"
      className="flex items-center space-x-2 sm:space-x-3 focus:outline-none focus:ring-4 focus:ring-primary-yellow/50 rounded-xl px-3 py-2 -mx-3 -my-2 transition-all duration-300 hover:scale-105 flex-shrink-0 min-w-0 max-w-[50%] sm:max-w-none group"
      aria-label={goToHomeLabel}
    >
      <div className="relative flex-shrink-0 min-w-0">
        <div className="text-xl sm:text-2xl md:text-3xl lg:text-3xl font-extrabold text-white tracking-tight truncate bg-gradient-to-r from-white via-primary-yellow/90 to-white bg-clip-text text-transparent group-hover:from-primary-yellow group-hover:via-white group-hover:to-primary-yellow transition-all duration-500">
          MEDO-FREIGHT
        </div>
        <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-yellow to-transparent rounded-full opacity-80 group-hover:opacity-100 group-hover:via-primary-yellow group-hover:shadow-[0_0_15px_rgba(255,210,0,0.6)] transition-all duration-300" />
      </div>
      <div
        className={`hidden sm:block text-xs md:text-sm text-gray-300 font-medium flex-shrink-0 whitespace-nowrap transition-colors group-hover:text-gray-200 ${
          isRTL ? "mr-2" : "ml-2"
        }`}
        aria-hidden="true"
      >
        <span className="text-primary-yellow font-semibold">·</span> Freight{" "}
        <span className="text-primary-yellow font-semibold">·</span> Route{" "}
        <span className="text-primary-yellow font-semibold">·</span> Deliver
      </div>
    </Link>
  );
}

// Enhanced Mobile Menu Button
interface MobileMenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
  ariaLabel: string;
}

function MobileMenuButton({
  isOpen,
  onClick,
  ariaLabel,
}: MobileMenuButtonProps) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden p-2.5 rounded-xl text-white hover:text-primary-yellow hover:bg-white/10 active:bg-white/20 focus:outline-none focus:ring-2 focus:ring-primary-yellow/50 transition-all duration-300 relative z-[101] flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center group"
      aria-label={ariaLabel}
      aria-expanded={isOpen}
      type="button"
    >
      <div className="w-6 h-6 flex flex-col justify-center gap-1.5 relative">
        <span
          className={`block h-0.5 w-6 bg-current transition-all duration-300 ease-in-out rounded-full ${
            isOpen
              ? "rotate-45 translate-y-2 bg-primary-yellow"
              : "group-hover:bg-primary-yellow"
          }`}
        />
        <span
          className={`block h-0.5 w-6 bg-current transition-all duration-300 ease-in-out rounded-full ${
            isOpen
              ? "opacity-0 scale-0"
              : "opacity-100 scale-100 group-hover:bg-primary-yellow"
          }`}
        />
        <span
          className={`block h-0.5 w-6 bg-current transition-all duration-300 ease-in-out rounded-full ${
            isOpen
              ? "-rotate-45 -translate-y-2 bg-primary-yellow"
              : "group-hover:bg-primary-yellow"
          }`}
        />
      </div>
    </button>
  );
}

// Enhanced Auth Buttons Component
interface AuthButtonsProps {
  isAuthenticated: boolean;
  user: any;
  logout: () => void;
  translations: typeof translations.en;
  isMobile?: boolean;
  onLinkClick?: () => void;
}

function AuthButtons({
  isAuthenticated,
  user,
  logout,
  translations,
  isMobile = false,
  onLinkClick,
}: AuthButtonsProps) {
  if (isMobile) {
    return (
      <div className="pt-6 border-t border-gray-200 mt-6 space-y-3">
        {isAuthenticated ? (
          <>
            <Link
              href="/dashboard"
              className="block px-5 py-3.5 text-lg font-semibold text-gray-800 hover:text-primary-dark hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md transform hover:translate-x-1"
              onClick={onLinkClick}
            >
              👤 {user?.first_name || user?.username || translations.dashboard}
            </Link>
            <button
              onClick={() => {
                logout();
                onLinkClick?.();
              }}
              className="w-full px-5 py-3.5 text-lg font-semibold text-red-600 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 rounded-xl transition-all duration-300 text-left shadow-sm hover:shadow-md transform hover:translate-x-1"
            >
              🚪 {translations.logout}
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="block px-5 py-3.5 text-lg font-semibold text-gray-800 hover:text-primary-dark hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md transform hover:translate-x-1"
              onClick={onLinkClick}
            >
              🔐 {translations.login}
            </Link>
            <Link
              href="/register"
              className="block px-5 py-3.5 text-lg font-bold text-primary-dark bg-gradient-to-r from-primary-yellow to-primary-yellow/90 rounded-xl hover:from-primary-yellow/90 hover:to-primary-yellow transition-all duration-300 text-center shadow-lg hover:shadow-xl transform hover:scale-105"
              onClick={onLinkClick}
            >
              ✨ {translations.signup}
            </Link>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center gap-3 flex-shrink-0 min-w-0">
      {isAuthenticated ? (
        <>
          <Link
            href="/dashboard"
            className="px-4 py-2.5 text-sm font-semibold text-gray-200 hover:text-white transition-all duration-300 rounded-xl hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-primary-yellow/50 whitespace-nowrap shadow-sm hover:shadow-md"
          >
            {user?.first_name || user?.username || translations.dashboard}
          </Link>
          <button
            onClick={logout}
            className="px-4 py-2.5 text-sm font-semibold text-gray-200 hover:text-red-200 transition-all duration-300 rounded-xl hover:bg-red-500/20 backdrop-blur-sm border border-transparent hover:border-red-500/30 focus:outline-none focus:ring-2 focus:ring-red-500/50 whitespace-nowrap shadow-sm hover:shadow-md"
          >
            {translations.logout}
          </button>
        </>
      ) : (
        <>
          <Link
            href="/login"
            className="px-4 py-2.5 text-sm font-semibold text-gray-200 hover:text-white transition-all duration-300 rounded-xl hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-primary-yellow/50 whitespace-nowrap shadow-sm hover:shadow-md"
          >
            {translations.login}
          </Link>
          <Link
            href="/register"
            className="px-5 py-2.5 text-sm font-bold text-primary-dark bg-gradient-to-r from-primary-yellow via-primary-yellow to-primary-yellow/90 rounded-xl hover:from-primary-yellow/90 hover:via-primary-yellow hover:to-primary-yellow transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:ring-offset-2 transform hover:scale-105 whitespace-nowrap relative overflow-hidden group"
          >
            <span className="relative z-10">{translations.signup}</span>
            <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          </Link>
        </>
      )}
    </div>
  );
}

// Main Header Component
export default function Header() {
  const { language, setLanguage, mounted, isRTL } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const t = translations[language] || translations.ar;

  // Navigation links
  const navLinks = [
    { href: "/", label: t.home },
    { href: "/about", label: t.about },
    { href: "/contact", label: t.contact },
    { href: "/faq", label: t.faq },
    { href: "/create-shipment", label: t.createShipment },
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
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

  const handleMobileMenuClose = () => setIsMobileMenuOpen(false);

  // Enhanced header classes with gradient and glass effect
  const headerClasses = `
    fixed top-0 left-0 right-0 z-[100] transition-all duration-500
    w-full max-w-full overflow-x-hidden overflow-y-visible
    ${
      isScrolled
        ? "bg-gradient-to-b from-[#0a1628] via-[#0a1628] to-[#0a1628]/95 backdrop-blur-xl shadow-2xl border-b border-white/5"
        : "bg-gradient-to-b from-[#0a1628] via-[#0a1628] to-[#0a1628]/90 backdrop-blur-md shadow-lg border-b border-white/5"
    }
  `;

  return (
    <>
      <header className={headerClasses.trim()} role="banner">
        <div className="container mx-auto px-4 lg:px-6 w-full max-w-full overflow-x-hidden overflow-y-visible">
          <div
            className={`flex items-center justify-between ${HEADER_HEIGHT} min-w-0 w-full`}
            style={{ overflow: "visible" }}
          >
            {/* Logo */}
            <Logo
              language={language}
              isRTL={isRTL}
              goToHomeLabel={t.goToHome}
            />

            {/* Desktop Navigation */}
            <nav
              className="hidden lg:flex items-center gap-1 flex-shrink-0 min-w-0"
              role="navigation"
              aria-label={t.mainNav}
            >
              {navLinks.map((link) => (
                <NavLink
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  pathname={pathname}
                  isRTL={isRTL}
                />
              ))}
            </nav>

            {/* Right Side Actions */}
            <div
              className="flex items-center gap-2 md:gap-3 flex-shrink-0 min-w-0"
              style={{ overflow: "visible" }}
            >
              {/* Authentication Buttons - Desktop */}
              {mounted && (
                <AuthButtons
                  isAuthenticated={isAuthenticated}
                  user={user}
                  logout={logout}
                  translations={t}
                />
              )}

              {/* Language Switcher */}
              <div
                className="hidden md:block"
                style={{
                  overflow: "visible",
                  position: "relative",
                  zIndex: 110,
                }}
              >
                <LanguageSwitcher
                  language={language}
                  setLanguage={setLanguage}
                />
              </div>

              {/* Mobile Menu Button */}
              <MobileMenuButton
                isOpen={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                ariaLabel={isMobileMenuOpen ? t.closeMenu : t.openMenu}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay with enhanced blur */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/60 backdrop-blur-md z-[99] overflow-x-hidden animate-in fade-in duration-300"
          onClick={handleMobileMenuClose}
          aria-hidden="true"
        />
      )}

      {/* Enhanced Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed top-20 left-0 right-0 bottom-0 bg-gradient-to-b from-white via-white to-gray-50 shadow-2xl z-[101] w-full max-w-full overflow-x-hidden animate-in slide-in-from-top duration-300"
          aria-hidden={false}
        >
          <div className="h-full overflow-y-auto overflow-x-hidden">
            <nav
              className="w-full px-5 py-8 space-y-2"
              role="navigation"
              aria-label={t.mobileNav}
            >
              {navLinks.map((link) => (
                <NavLink
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  isMobile={true}
                  pathname={pathname}
                  isRTL={isRTL}
                  onClick={handleMobileMenuClose}
                />
              ))}

              {/* Mobile Auth Buttons */}
              {mounted && (
                <AuthButtons
                  isAuthenticated={isAuthenticated}
                  user={user}
                  logout={logout}
                  translations={t}
                  isMobile={true}
                  onLinkClick={handleMobileMenuClose}
                />
              )}

              {/* Mobile Language Switcher */}
              <div
                className="pt-6 border-t-2 border-gray-200 mt-6"
                style={{
                  overflow: "visible",
                  position: "relative",
                  zIndex: 110,
                }}
              >
                <LanguageSwitcher
                  language={language}
                  setLanguage={setLanguage}
                />
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
