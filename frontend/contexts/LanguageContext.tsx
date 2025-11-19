'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

type Language = 'ar' | 'en';

const LANGUAGE_STORAGE_KEY = 'app-language';
const DEFAULT_LANGUAGE: Language = 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  mounted: boolean;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Helper function to get initial language from localStorage synchronously
function getInitialLanguage(): Language {
  if (typeof window === 'undefined') {
    return DEFAULT_LANGUAGE;
  }
  try {
    const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null;
    if (savedLanguage === 'ar' || savedLanguage === 'en') {
      return savedLanguage;
    }
  } catch (error) {
    // localStorage might not be available (SSR, private browsing, etc.)
    console.warn('Failed to read language from localStorage:', error);
  }
  return DEFAULT_LANGUAGE;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Initialize with saved language from localStorage immediately to prevent flash
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);
  const [mounted, setMounted] = useState(false);

  // Set mounted flag after hydration
  useEffect(() => {
    setMounted(true);
    
    // Double-check localStorage in case it changed
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null;
      if (savedLanguage === 'ar' || savedLanguage === 'en') {
        setLanguageState(savedLanguage);
      }
    }
  }, []);

  // Save language to localStorage and update document attributes
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    
    if (typeof window !== 'undefined') {
      try {
        // Save to localStorage
        localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
        
        // Update document attributes
        if (typeof document !== 'undefined') {
          const html = document.documentElement;
          const dir = lang === 'ar' ? 'rtl' : 'ltr';
          html.setAttribute('dir', dir);
          html.setAttribute('lang', lang);
        }
      } catch (error) {
        console.warn('Failed to save language to localStorage:', error);
      }
    }
  }, []);

  // Update document attributes when language changes
  useEffect(() => {
    if (mounted && typeof window !== 'undefined' && typeof document !== 'undefined') {
      const html = document.documentElement;
      const dir = language === 'ar' ? 'rtl' : 'ltr';
      html.setAttribute('dir', dir);
      html.setAttribute('lang', language);
    }
  }, [language, mounted]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    mounted,
    isRTL: language === 'ar',
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
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

