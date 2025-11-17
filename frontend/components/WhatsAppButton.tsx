'use client';

import { useState, useEffect } from 'react';

type Language = 'ar' | 'en';

interface WhatsAppButtonProps {
  language: Language;
  phoneNumber?: string;
}

export default function WhatsAppButton({ language, phoneNumber = '+31612345678' }: WhatsAppButtonProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    
    // Show button immediately, hide only at very top
    const handleScroll = () => {
      if (window.scrollY < 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };

    // Check initial scroll position
    handleScroll();
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const translations = {
    ar: {
      message: 'مرحباً، أريد الاستفسار عن خدمات الشحن',
      label: 'تواصل معنا',
    },
    en: {
      message: 'Hello, I would like to inquire about shipping services',
      label: 'Contact Us',
    },
  };

  const t = translations[language];
  const message = encodeURIComponent(t.message);
  const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${message}`;

  // Don't render during SSR to avoid hydration mismatch
  // Return null during SSR as this is a floating button that doesn't affect layout
  if (!isMounted) {
    return null;
  }

  if (!isVisible) {
    return null;
  }

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed bottom-6 z-50 flex items-center gap-3 bg-[#25D366] text-white px-5 py-4 rounded-full shadow-2xl hover:bg-[#20BA5A] transition-all transform hover:scale-105 active:scale-95 ${
        language === 'ar' ? 'left-6' : 'right-6'
      }`}
      aria-label={language === 'ar' ? 'تواصل معنا عبر واتساب' : 'Contact us on WhatsApp'}
      style={{
        boxShadow: '0 10px 30px rgba(37, 211, 102, 0.4)',
      }}
    >
      {/* WhatsApp Icon */}
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.386 1.262.617 1.694.789.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
      </svg>
      
      {/* Text Label */}
      <span className="font-semibold text-sm hidden sm:block whitespace-nowrap">
        {t.label}
      </span>
      
      {/* Pulse Animation */}
      <span className="absolute -top-1 -right-1 flex h-4 w-4">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75"></span>
        <span className="relative inline-flex rounded-full h-4 w-4 bg-[#20BA5A]"></span>
      </span>
    </a>
  );
}
