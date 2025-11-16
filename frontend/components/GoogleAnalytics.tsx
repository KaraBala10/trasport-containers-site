'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

interface GoogleAnalyticsProps {
  gaId?: string;
}

export default function GoogleAnalytics({ gaId = process.env.NEXT_PUBLIC_GA_ID || '' }: GoogleAnalyticsProps) {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (!gaId) return;

    // Delay GA loading significantly - only load after 10 seconds or on user interaction
    let loaded = false;
    const loadGA = () => {
      if (!loaded && typeof window !== 'undefined') {
        loaded = true;
        if ('requestIdleCallback' in window) {
          window.requestIdleCallback(() => {
            setShouldLoad(true);
          }, { timeout: 10000 });
        } else {
          setTimeout(() => setShouldLoad(true), 5000);
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

  if (!gaId || !shouldLoad) {
    return null;
  }

  return (
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
  );
}

