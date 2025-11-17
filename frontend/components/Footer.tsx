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
    <footer className="bg-primary-dark text-white mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div>
            <div className="text-2xl font-bold mb-2">MEDO-FREIGHT.EU</div>
            <p className="text-gray-300 text-sm">Freight · Route · Deliver</p>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-bold mb-4">{t.company}</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/about" className="hover:text-primary-yellow transition-colors">{t.about}</Link></li>
              <li><Link href="/contact" className="hover:text-primary-yellow transition-colors">{t.contact}</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold mb-4">{t.services}</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/services" className="hover:text-primary-yellow transition-colors">{t.services}</Link></li>
              <li><Link href="/quote" className="hover:text-primary-yellow transition-colors">FCL Quote</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold mb-4">{t.legal}</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/privacy" className="hover:text-primary-yellow transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary-yellow transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-300">
          <p suppressHydrationWarning>
            &copy; {isMounted ? new Date().getFullYear() : 2025} MEDO-FREIGHT.EU. {t.rights}.
          </p>
        </div>
      </div>
    </footer>
  );
}

