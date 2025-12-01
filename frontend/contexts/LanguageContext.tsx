"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

type Language = "ar" | "en";

const LANGUAGE_STORAGE_KEY = "app-language";
const DEFAULT_LANGUAGE: Language = "ar";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  mounted: boolean;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

// Helper function to get initial language from localStorage synchronously
function getInitialLanguage(): Language {
  if (typeof window === "undefined") {
    return DEFAULT_LANGUAGE;
  }
  try {
    const savedLanguage = localStorage.getItem(
      LANGUAGE_STORAGE_KEY
    ) as Language | null;
    if (savedLanguage === "ar" || savedLanguage === "en") {
      return savedLanguage;
    }
  } catch (error) {
    // localStorage might not be available (SSR, private browsing, etc.)
    console.warn("Failed to read language from localStorage:", error);
  }
  return DEFAULT_LANGUAGE;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Always initialize with DEFAULT_LANGUAGE to ensure server and client match
  // This prevents hydration errors - we'll update from localStorage after mount
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Set mounted flag and load language from localStorage after hydration
  useEffect(() => {
    setMounted(true);

    // Load saved language from localStorage after mount
    if (typeof window !== "undefined") {
      try {
        const savedLanguage = localStorage.getItem(
          LANGUAGE_STORAGE_KEY
        ) as Language | null;
        if (savedLanguage === "ar" || savedLanguage === "en") {
          setLanguageState(savedLanguage);
        }
      } catch (error) {
        console.warn("Failed to read language from localStorage:", error);
      }
    }
  }, []);

  // Save language to localStorage and update document attributes
  const setLanguage = useCallback(
    (lang: Language) => {
      const previousLang = language;
      setLanguageState(lang);

      if (typeof window !== "undefined") {
        try {
          // Save to localStorage
          localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);

          // Update document attributes immediately
          if (typeof document !== "undefined") {
            const html = document.documentElement;
            const dir = lang === "ar" ? "rtl" : "ltr";
            html.setAttribute("dir", dir);
            html.setAttribute("lang", lang);
          }

          // If language actually changed, refresh the router to clear cache
          if (previousLang !== lang) {
            // Use router.refresh() to clear Next.js cache and re-fetch data
            router.refresh();
          }
        } catch (error) {
          console.warn("Failed to save language to localStorage:", error);
        }
      }
    },
    [language, router]
  );

  // Update document attributes when language changes
  useEffect(() => {
    if (
      mounted &&
      typeof window !== "undefined" &&
      typeof document !== "undefined"
    ) {
      const html = document.documentElement;
      const dir = language === "ar" ? "rtl" : "ltr";
      html.setAttribute("dir", dir);
      html.setAttribute("lang", language);
    }
  }, [language, mounted]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    mounted,
    isRTL: language === "ar",
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
