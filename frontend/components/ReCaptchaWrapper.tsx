"use client";

import { ReactNode, createContext, useContext } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

// Context for standard reCAPTCHA v3
const ReCaptchaContext = createContext<{
  executeRecaptcha?: (action: string) => Promise<string>;
}>({});

export const useReCaptcha = () => {
  const context = useContext(ReCaptchaContext);

  // Use standard v3 from react-google-recaptcha-v3
  if (context.executeRecaptcha) {
    return context;
  }

  // Fallback: try to get from GoogleReCaptchaProvider directly
  try {
    const recaptcha = useGoogleReCaptcha();
    if (recaptcha?.executeRecaptcha) {
      return { executeRecaptcha: recaptcha.executeRecaptcha };
    }
  } catch {
    // Provider not available
  }

  return context;
};

interface ReCaptchaWrapperProps {
  children: ReactNode;
}

// Wrapper for standard reCAPTCHA v3 (react-google-recaptcha-v3)
export default function ReCaptchaWrapper({ children }: ReCaptchaWrapperProps) {
  // Get executeRecaptcha from GoogleReCaptchaProvider
  let executeRecaptcha: ((action: string) => Promise<string>) | undefined;

  try {
    const recaptcha = useGoogleReCaptcha();
    executeRecaptcha = recaptcha?.executeRecaptcha;
  } catch {
    // Provider not available
    executeRecaptcha = undefined;
  }

  return (
    <ReCaptchaContext.Provider value={{ executeRecaptcha }}>
      {children}
    </ReCaptchaContext.Provider>
  );
}
