'use client';

import { ReactNode, createContext, useContext } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

// Context to safely access reCAPTCHA
const ReCaptchaContext = createContext<{
  executeRecaptcha?: (action: string) => Promise<string>;
}>({});

export const useReCaptcha = () => {
  const context = useContext(ReCaptchaContext);
  return context;
};

interface ReCaptchaWrapperProps {
  children: ReactNode;
}

// This component must be inside GoogleRecaptchaProvider
export default function ReCaptchaWrapper({ children }: ReCaptchaWrapperProps) {
  // Use hook directly - this will work because we're inside GoogleRecaptchaProvider
  let executeRecaptcha: ((action: string) => Promise<string>) | undefined;
  
  try {
    const recaptcha = useGoogleReCaptcha();
    executeRecaptcha = recaptcha?.executeRecaptcha;
  } catch (error) {
    // reCAPTCHA not available (no provider)
    executeRecaptcha = undefined;
  }

  return (
    <ReCaptchaContext.Provider value={{ executeRecaptcha }}>
      {children}
    </ReCaptchaContext.Provider>
  );
}

