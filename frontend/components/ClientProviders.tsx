'use client';

import { ReactNode, useEffect, useState } from 'react';
import Script from 'next/script';
import ReCaptchaProvider from './ReCaptchaProvider';
import WhatsAppButton from './WhatsAppButton';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import { ToastProvider } from '@/contexts/ToastContext';

interface ClientProvidersProps {
  children: ReactNode;
}

function WhatsAppButtonWrapper() {
  const { language } = useLanguage();
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '31683083916';
  
  return <WhatsAppButton phoneNumber={whatsappNumber} language={language} />;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  const [shouldLoadGA, setShouldLoadGA] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const gaId = process.env.NEXT_PUBLIC_GA_ID || '';

  useEffect(() => {
    setIsMounted(true);
    
    if (!gaId) {
      return;
    }

    // Delay GA loading significantly - only load after 10 seconds or on user interaction
    let loaded = false;
    const loadGA = () => {
      if (!loaded && typeof window !== 'undefined') {
        loaded = true;
        if ('requestIdleCallback' in window) {
          window.requestIdleCallback(() => {
            setShouldLoadGA(true);
          }, { timeout: 10000 });
        } else {
          setTimeout(() => setShouldLoadGA(true), 5000);
        }
      }
    };

    // Load on user interaction only
    const events = ['mousedown', 'touchstart', 'keydown'];
    events.forEach(event => {
      window.addEventListener(event, loadGA, { once: true, passive: true });
    });

    // Fallback: load after 10 seconds
    const timer = setTimeout(loadGA, 10000);

    return () => {
      clearTimeout(timer);
      events.forEach(event => {
        window.removeEventListener(event, loadGA);
      });
    };
  }, [gaId]);

  return (
    <LanguageProvider>
      {isMounted && gaId && shouldLoadGA && (
        <>
          <Script
            strategy="lazyOnload"
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
          />
          <Script
            id="google-analytics"
            strategy="lazyOnload"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', {
                  page_path: window.location.pathname,
                  send_page_view: true,
                });
              `,
            }}
          />
        </>
      )}
      <ReCaptchaProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </ReCaptchaProvider>
      
      {/* زر الواتساب العائم - يظهر في جميع الصفحات */}
      {isMounted && <WhatsAppButtonWrapper />}
    </LanguageProvider>
  );
}

