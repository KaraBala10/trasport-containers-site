'use client';

import { useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import LanguageSwitcher from './LanguageSwitcher';

type Language = 'ar' | 'en';

interface HeaderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export default function Header({ language, setLanguage }: HeaderProps) {
  const isRTL = language === 'ar';
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const html = document.documentElement;
      const dir = isRTL ? 'rtl' : 'ltr';
      html.setAttribute('dir', dir);
      html.setAttribute('lang', language);
      html.dir = dir;
      html.lang = language;
    }
  }, [language, isRTL]);

  const translations = {
    ar: {
      home: 'الرئيسية',
      pricing: 'الأسعار',
      tracking: 'التتبع',
      about: 'من نحن',
      contact: 'اتصل بنا',
      createShipment: 'إنشاء شحنة',
    },
    en: {
      home: 'Home',
      pricing: 'Pricing',
      tracking: 'Tracking',
      about: 'About',
      contact: 'Contact',
      createShipment: 'Create Shipment',
    },
  };

  const t = translations[language];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50" role="banner">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo Placeholder */}
          <Link 
            href="/" 
            className="flex items-center focus:outline-none focus:ring-4 focus:ring-primary-yellow/50 rounded-md px-2 py-1 -mx-2 -my-1"
            aria-label={language === 'ar' ? 'العودة إلى الصفحة الرئيسية - MEDO-FREIGHT.EU' : 'Go to homepage - MEDO-FREIGHT.EU'}
          >
            <div className="text-2xl font-bold text-primary-dark">
              MEDO-FREIGHT.EU
            </div>
            <div className={`${isRTL ? 'mr-2' : 'ml-2'} text-sm text-gray-700 font-medium`} aria-hidden="true">
              Freight · Route · Deliver
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6" role="navigation" aria-label={language === 'ar' ? 'التنقل الرئيسي' : 'Main navigation'}>
            <Link 
              href="/" 
              className={`relative text-gray-800 hover:text-primary-dark transition-colors font-medium focus:outline-none focus:ring-4 focus:ring-primary-yellow/50 rounded px-2 py-1 ${
                pathname === '/' ? 'text-primary-dark' : ''
              }`}
              aria-label={t.home}
              aria-current={pathname === '/' ? 'page' : undefined}
            >
              {t.home}
              {pathname === '/' && (
                <span className="absolute bottom-0 left-0 right-0 h-1 bg-primary-yellow rounded-full" aria-hidden="true"></span>
              )}
            </Link>
            <Link 
              href="/pricing" 
              className={`relative text-gray-800 hover:text-primary-dark transition-colors font-medium focus:outline-none focus:ring-4 focus:ring-primary-yellow/50 rounded px-2 py-1 ${
                pathname === '/pricing' ? 'text-primary-dark' : ''
              }`}
              aria-label={t.pricing}
              aria-current={pathname === '/pricing' ? 'page' : undefined}
            >
              {t.pricing}
              {pathname === '/pricing' && (
                <span className="absolute bottom-0 left-0 right-0 h-1 bg-primary-yellow rounded-full" aria-hidden="true"></span>
              )}
            </Link>
            <Link 
              href="/tracking" 
              className={`relative text-gray-800 hover:text-primary-dark transition-colors font-medium focus:outline-none focus:ring-4 focus:ring-primary-yellow/50 rounded px-2 py-1 ${
                pathname === '/tracking' ? 'text-primary-dark' : ''
              }`}
              aria-label={t.tracking}
              aria-current={pathname === '/tracking' ? 'page' : undefined}
            >
              {t.tracking}
              {pathname === '/tracking' && (
                <span className="absolute bottom-0 left-0 right-0 h-1 bg-primary-yellow rounded-full" aria-hidden="true"></span>
              )}
            </Link>
            <Link 
              href="/about" 
              className={`relative text-gray-800 hover:text-primary-dark transition-colors font-medium focus:outline-none focus:ring-4 focus:ring-primary-yellow/50 rounded px-2 py-1 ${
                pathname === '/about' ? 'text-primary-dark' : ''
              }`}
              aria-label={t.about}
              aria-current={pathname === '/about' ? 'page' : undefined}
            >
              {t.about}
              {pathname === '/about' && (
                <span className="absolute bottom-0 left-0 right-0 h-1 bg-primary-yellow rounded-full" aria-hidden="true"></span>
              )}
            </Link>
            <Link 
              href="/contact" 
              className={`relative text-gray-800 hover:text-primary-dark transition-colors font-medium focus:outline-none focus:ring-4 focus:ring-primary-yellow/50 rounded px-2 py-1 ${
                pathname === '/contact' ? 'text-primary-dark' : ''
              }`}
              aria-label={t.contact}
              aria-current={pathname === '/contact' ? 'page' : undefined}
            >
              {t.contact}
              {pathname === '/contact' && (
                <span className="absolute bottom-0 left-0 right-0 h-1 bg-primary-yellow rounded-full" aria-hidden="true"></span>
              )}
            </Link>
            <Link 
              href="/create-shipment" 
              className={`relative text-gray-800 hover:text-primary-dark transition-colors font-medium focus:outline-none focus:ring-4 focus:ring-primary-yellow/50 rounded px-2 py-1 ${
                pathname === '/create-shipment' ? 'text-primary-dark' : ''
              }`}
              aria-label={language === 'ar' ? 'إنشاء شحنة جديدة' : 'Create a new shipment'}
              aria-current={pathname === '/create-shipment' ? 'page' : undefined}
            >
              {t.createShipment}
              {pathname === '/create-shipment' && (
                <span className="absolute bottom-0 left-0 right-0 h-1 bg-primary-yellow rounded-full" aria-hidden="true"></span>
              )}
            </Link>
          </nav>

          {/* Language Switcher */}
          <LanguageSwitcher language={language} setLanguage={setLanguage} />
        </div>
      </div>
    </header>
  );
}
 
