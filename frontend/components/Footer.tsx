'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Language = 'ar' | 'en';

interface FooterProps {
  language: Language;
}

export default function Footer({ language }: FooterProps) {
  const [isMounted, setIsMounted] = useState(false);
  const isRTL = language === 'ar';

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const translations = {
    ar: {
      company: 'الشركة',
      services: 'الخدمات',
      legal: 'قانوني',
      contact: 'اتصل بنا',
      followUs: 'تابعنا',
      rights: 'جميع الحقوق محفوظة',
      about: 'من نحن',
    },
    en: {
      company: 'Company',
      services: 'Services',
      legal: 'Legal',
      contact: 'Contact Us',
      followUs: 'Follow Us',
      rights: 'All rights reserved',
      about: 'About',
    },
  };

  const t = translations[language];

  return (
    <footer className="bg-primary-dark text-white mt-20" role="contentinfo">
      <div className="container mx-auto px-4 py-12">
        <nav className="grid grid-cols-1 md:grid-cols-4 gap-8" aria-label={language === 'ar' ? 'روابط التذييل' : 'Footer navigation'}>
          {/* Logo & Description */}
          <div>
            <div className="text-2xl font-bold mb-2" aria-label="Company name">MEDO-FREIGHT.EU</div>
            <p className="text-gray-300 text-base font-medium">Freight · Route · Deliver</p>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-bold mb-4 text-lg">{t.company}</h3>
            <ul className="space-y-2 text-sm" role="list">
              <li><Link href="/about" className="text-gray-300 hover:text-primary-yellow transition-colors focus:outline-none focus:ring-2 focus:ring-primary-yellow/50 rounded px-1 py-0.5 inline-block">{t.about}</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-primary-yellow transition-colors focus:outline-none focus:ring-2 focus:ring-primary-yellow/50 rounded px-1 py-0.5 inline-block">{t.contact}</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold mb-4 text-lg">{t.services}</h3>
            <ul className="space-y-2 text-sm" role="list">
              <li><Link href="/services" className="text-gray-300 hover:text-primary-yellow transition-colors focus:outline-none focus:ring-2 focus:ring-primary-yellow/50 rounded px-1 py-0.5 inline-block">{t.services}</Link></li>
              <li><Link href="/quote" className="text-gray-300 hover:text-primary-yellow transition-colors focus:outline-none focus:ring-2 focus:ring-primary-yellow/50 rounded px-1 py-0.5 inline-block" aria-label={language === 'ar' ? 'احصل على عرض سعر للحاويات الكاملة' : 'Get full container load quote'}>FCL Quote</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold mb-4 text-lg">{t.legal}</h3>
            <ul className="space-y-2 text-sm" role="list">
              <li><Link href="/privacy" className="text-gray-300 hover:text-primary-yellow transition-colors focus:outline-none focus:ring-2 focus:ring-primary-yellow/50 rounded px-1 py-0.5 inline-block" aria-label={language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}>Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-300 hover:text-primary-yellow transition-colors focus:outline-none focus:ring-2 focus:ring-primary-yellow/50 rounded px-1 py-0.5 inline-block" aria-label={language === 'ar' ? 'الشروط والأحكام' : 'Terms and Conditions'}>Terms & Conditions</Link></li>
            </ul>
          </div>
        </nav>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-base text-gray-300">
          <p suppressHydrationWarning>
            &copy; {isMounted ? new Date().getFullYear() : 2025} MEDO-FREIGHT.EU. {t.rights}.
          </p>
        </div>
      </div>
    </footer>
  );
}

