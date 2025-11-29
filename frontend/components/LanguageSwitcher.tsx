"use client";

import { useState, useEffect, useRef } from "react";

interface LanguageSwitcherProps {
  language: "ar" | "en";
  setLanguage: (lang: "ar" | "en") => void;
}

const languages = [
  { code: "ar" as const, name: "العربية", nativeName: "عربي", flag: "🌐" },
  { code: "en" as const, name: "English", nativeName: "English", flag: "🇬🇧" },
];

export default function LanguageSwitcher({
  language,
  setLanguage,
}: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage =
    languages.find((lang) => lang.code === language) || languages[0];

  const handleLanguageChange = (lang: "ar" | "en") => {
    if (setLanguage) {
      setLanguage(lang);
    }
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Language Selector Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          group relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
          bg-white/80 backdrop-blur-sm
          border transition-all duration-200
          ${isOpen 
            ? "border-primary-yellow/50 bg-white shadow-sm" 
            : "border-gray-200/60 hover:border-primary-yellow/30 hover:bg-white"
          }
          focus:outline-none focus:ring-1 focus:ring-primary-yellow/30
        `}
        aria-label="Select language"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Current Language Flag */}
        <span className="text-base leading-none">
          {currentLanguage.flag}
        </span>

        {/* Language Code */}
        <span className="text-xs font-medium text-gray-700 hidden sm:inline">
          {currentLanguage.code.toUpperCase()}
        </span>

        {/* Dropdown Arrow */}
        <svg
          className={`w-3 h-3 transition-all duration-200 text-gray-400 ${
            isOpen ? "rotate-180 text-primary-yellow" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute top-full mt-1.5 bg-white/95 backdrop-blur-md rounded-lg shadow-lg border border-gray-100/80 py-1.5 min-w-[140px] z-[9999] transform transition-all duration-200 ease-out origin-top-right"
          role="menu"
          aria-orientation="vertical"
          style={{
            [language === 'ar' ? 'left' : 'right']: 0,
          }}
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleLanguageChange(lang.code)}
              className={`
                w-full flex items-center gap-2 px-3 py-2 text-left
                transition-all duration-150
                ${
                  language === lang.code
                    ? "bg-primary-yellow/10 text-primary-dark"
                    : "text-gray-700 hover:bg-gray-50/80"
                }
                focus:outline-none
                first:rounded-t-lg last:rounded-b-lg
              `}
              role="menuitem"
              aria-label={`Switch to ${lang.name}`}
            >
              {/* Flag */}
              <span className="text-sm" role="img" aria-label={lang.name}>
                {lang.flag}
              </span>

              {/* Language Name */}
              <span className={`text-xs font-medium flex-1 ${
                language === lang.code ? "text-primary-dark" : ""
              }`}>
                {lang.nativeName}
              </span>

              {/* Checkmark for selected language */}
              {language === lang.code && (
                <svg
                  className="w-3.5 h-3.5 text-primary-yellow"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
