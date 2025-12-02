"use client";

import React, { ReactNode, useEffect, useState } from "react";
import ReCaptchaWrapper from "./ReCaptchaWrapper";

interface ReCaptchaProviderProps {
  children: ReactNode;
}

export default function ReCaptchaProvider({
  children,
}: ReCaptchaProviderProps) {
  const [recaptchaKey, setRecaptchaKey] = useState<string>("");
  const [Provider, setProvider] = useState<React.ComponentType<any> | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Get key from environment on client side
    // Try build-time env var first, then runtime env var as fallback
    const getRecaptchaKey = () => {
      if (typeof window === "undefined") return "";

      // First try build-time env var (embedded in bundle)
      let key = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";

      // Fallback: Try to get from window (injected at runtime)
      if (!key && typeof window !== "undefined") {
        // @ts-ignore - runtime env injection
        key = window.__NEXT_PUBLIC_RECAPTCHA_SITE_KEY__ || "";
      }

      return key;
    };

    const key = getRecaptchaKey();

    if (!key) {
      console.warn(
        "[reCAPTCHA] Site key not found. reCAPTCHA will be disabled.\n" +
          "Please ensure NEXT_PUBLIC_RECAPTCHA_SITE_KEY is set in your environment variables."
      );
      setIsLoading(false);
      return;
    }

    console.log(
      "[reCAPTCHA] Initializing with site key:",
      key.substring(0, 10) + "..."
    );
    setRecaptchaKey(key);

    // Load reCAPTCHA after page is interactive (performance optimization)
    const loadRecaptcha = () => {
      // Dynamic import to avoid SSR issues
      import("react-google-recaptcha-v3")
        .then((module) => {
          if (module?.GoogleReCaptchaProvider) {
            console.log("[reCAPTCHA] Provider module loaded successfully");
            setProvider(() => module.GoogleReCaptchaProvider);
            setIsReady(true);
          } else {
            console.error(
              "[reCAPTCHA] GoogleReCaptchaProvider not found in module"
            );
          }
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("[reCAPTCHA] Failed to load module:", error);
          setIsLoading(false);
        });
    };

    // Load reCAPTCHA v3 immediately for better reliability
    // v3 is lightweight and invisible, so we can load it right away
    if (typeof window !== "undefined") {
      // Load immediately when component mounts
      if (
        document.readyState === "complete" ||
        document.readyState === "interactive"
      ) {
        // Page is ready, load immediately
        loadRecaptcha();
      } else {
        // Wait for DOM to be ready, then load
        window.addEventListener(
          "DOMContentLoaded",
          () => {
            loadRecaptcha();
          },
          { once: true }
        );

        // Fallback: load after 500ms if DOMContentLoaded hasn't fired
        setTimeout(() => {
          loadRecaptcha();
        }, 500);
      }
    }
  }, []);

  // Always return children during SSR to avoid hydration mismatch
  // Only wrap with Provider after mount and when ready
  if (!isMounted || isLoading || !isReady || !Provider || !recaptchaKey) {
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
    console.log(
      "[reCAPTCHA] Rendering Provider with key:",
      recaptchaKey.substring(0, 10) + "..."
    );
    return (
      <ProviderComponent
        reCaptchaKey={recaptchaKey}
        scriptProps={{
          async: true,
          defer: true,
          appendTo: "head",
          onLoadCallbackName: "onRecaptchaLoad",
        }}
        useRecaptchaNet={false}
        useEnterprise={false}
      >
        <ReCaptchaWrapper>{children}</ReCaptchaWrapper>
      </ProviderComponent>
    );
  } catch (error) {
    console.error("[reCAPTCHA] Error rendering Provider:", error);
    return <>{children}</>;
  }
}
