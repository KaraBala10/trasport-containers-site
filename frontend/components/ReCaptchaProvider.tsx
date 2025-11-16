'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import ReCaptchaWrapper from './ReCaptchaWrapper';

interface ReCaptchaProviderProps {
  children: ReactNode;
}

export default function ReCaptchaProvider({ children }: ReCaptchaProviderProps) {
  const [recaptchaKey, setRecaptchaKey] = useState<string>('');
  const [Provider, setProvider] = useState<React.ComponentType<any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Get key from environment on client side
    const key = typeof window !== 'undefined' 
      ? (process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '')
      : '';

    if (!key) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('reCAPTCHA site key not found. reCAPTCHA will be disabled.');
      }
      setIsLoading(false);
      return;
    }

    setRecaptchaKey(key);

    // Load reCAPTCHA after page is interactive (performance optimization)
    const loadRecaptcha = () => {
      // Dynamic import to avoid SSR issues
      import('react-google-recaptcha-v3')
        .then((module) => {
          if (module?.GoogleReCaptchaProvider) {
            setProvider(() => module.GoogleReCaptchaProvider);
            setIsReady(true);
          } else {
            if (process.env.NODE_ENV === 'development') {
              console.warn('GoogleReCaptchaProvider not found in module');
            }
          }
          setIsLoading(false);
        })
        .catch((error) => {
          if (process.env.NODE_ENV === 'development') {
            console.warn('reCAPTCHA module not available:', error);
          }
          setIsLoading(false);
        });
    };

    // Delay reCAPTCHA loading significantly for better performance
    // Load only when user interacts or after 3 seconds
    if (typeof window !== 'undefined') {
      let loaded = false;
      const loadOnInteraction = () => {
        if (!loaded) {
          loaded = true;
          loadRecaptcha();
          window.removeEventListener('scroll', loadOnInteraction, { passive: true });
          window.removeEventListener('mousedown', loadOnInteraction);
          window.removeEventListener('touchstart', loadOnInteraction, { passive: true });
        }
      };

      // Load on user interaction
      window.addEventListener('scroll', loadOnInteraction, { passive: true });
      window.addEventListener('mousedown', loadOnInteraction);
      window.addEventListener('touchstart', loadOnInteraction, { passive: true });

      // Fallback: load after 5 seconds if no interaction
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => {
          setTimeout(() => {
            if (!loaded) {
              loadOnInteraction();
            }
          }, 5000);
        }, { timeout: 8000 });
      } else {
        setTimeout(() => {
          if (!loaded) {
            loadOnInteraction();
          }
        }, 5000);
      }
    }
  }, []);

  // Show children while loading or if not ready
  if (isLoading || !isReady || !Provider || !recaptchaKey) {
    return <>{children}</>;
  }

  // Final safety check
  if (!Provider || !recaptchaKey) {
    return <>{children}</>;
  }

  // Use React.createElement to render the dynamic component
  // Wrap children with ReCaptchaWrapper inside Provider
  try {
    const ProviderComponent = Provider;
    return (
      <ProviderComponent
        reCaptchaKey={recaptchaKey}
        scriptProps={{
          async: true,
          defer: true,
          appendTo: 'head',
        }}
      >
        <ReCaptchaWrapper>{children}</ReCaptchaWrapper>
      </ProviderComponent>
    );
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error rendering reCAPTCHA Provider:', error);
    }
    return <>{children}</>;
  }
}

