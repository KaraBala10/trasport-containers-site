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

  useEffect(() => {
    // Get key from environment on client side
    const key = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';
    setRecaptchaKey(key);

    if (!key) {
      console.warn('reCAPTCHA site key not found. reCAPTCHA will be disabled.');
      setIsLoading(false);
      return;
    }

    // Dynamic import to avoid SSR issues
    import('react-google-recaptcha-v3')
      .then((module) => {
        if (module.GoogleReCaptchaProvider) {
          setProvider(module.GoogleReCaptchaProvider);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.warn('reCAPTCHA module not available:', error);
        setIsLoading(false);
      });
  }, []);

  // Show children while loading or if no provider
  if (isLoading || !Provider || !recaptchaKey) {
    return <>{children}</>;
  }

  // Double check Provider is available
  if (!Provider) {
    return <>{children}</>;
  }

  // Use React.createElement to render the dynamic component
  // Wrap children with ReCaptchaWrapper inside Provider
  try {
    return React.createElement(
      Provider,
      {
        reCaptchaKey: recaptchaKey,
        scriptProps: {
          async: true,
          defer: true,
          appendTo: 'head',
        },
      },
      <ReCaptchaWrapper>{children}</ReCaptchaWrapper>
    );
  } catch (error) {
    console.error('Error rendering reCAPTCHA Provider:', error);
    return <>{children}</>;
  }
}

