'use client';

import { useLayoutEffect } from 'react';
import Link from 'next/link';
import LanguageSwitcher from './LanguageSwitcher';

type Language = 'ar' | 'en';

interface HeaderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export default function Header({ language, setLanguage }: HeaderProps) {
  const isRTL = language === 'ar';

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
      services: 'الخدمات',
      about: 'من نحن',
      contact: 'اتصل بنا',
      quote: 'عرض سعر',
    },
    en: {
      home: 'Home',
      services: 'Services',
      about: 'About',
      contact: 'Contact',
      quote: 'Get Quote',
    },
  };

  const t = translations[language];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo Placeholder */}
          <Link href="/" className="flex items-center">
            <div className="text-2xl font-bold text-primary-dark">
              MEDO-FREIGHT.EU
            </div>
            <div className={`${isRTL ? 'mr-2' : 'ml-2'} text-sm text-gray-600`}>
              Freight · Route · Deliver
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-700 hover:text-primary-dark transition-colors">
              {t.home}
            </Link>
            <Link href="/services" className="text-gray-700 hover:text-primary-dark transition-colors">
              {t.services}
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-primary-dark transition-colors">
              {t.about}
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-primary-dark transition-colors">
              {t.contact}
            </Link>
            <Link 
              href="/quote" 
              className="bg-primary-yellow text-primary-dark px-4 py-2 rounded-md font-medium hover:bg-opacity-90 transition-colors"
            >
              {t.quote}
            </Link>
          </nav>

          {/* Language Switcher */}
          <LanguageSwitcher language={language} setLanguage={setLanguage} />
        </div>
      </div>
    </header>
  );
}
 
