"use client";

import { ReactNode, createContext, useContext } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

// Context for standard reCAPTCHA v3
const ReCaptchaContext = createContext<{
  executeRecaptcha?: (action: string) => Promise<string>;
}>({});

export const useReCaptcha = () => {
  const context = useContext(ReCaptchaContext);
  
  // Always call useGoogleReCaptcha hook unconditionally (Rules of Hooks)
  // This hook must be called in the same order on every render
  // The hook will return undefined/null if provider is not available, which is fine
  const recaptchaHookResult = useGoogleReCaptcha();

  // Priority 1: Use context value if available
  if (context.executeRecaptcha) {
    return context;
  }

  // Priority 2: Use hook result if available
  if (recaptchaHookResult?.executeRecaptcha) {
    return { executeRecaptcha: recaptchaHookResult.executeRecaptcha };
  }

  // Fallback: return empty context
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
