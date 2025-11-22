"use client";

import { useState, useEffect, useRef } from "react";

interface LanguageSwitcherProps {
  language: "ar" | "en";
  setLanguage: (lang: "ar" | "en") => void;
}

// Syrian green flag component using the SVG file
const SyrianGreenFlag = ({ className = "w-5 h-5" }: { className?: string }) => {
  return (
    <img
      src="/images/syrian_flag.svg"
      alt="Syrian Flag"
      className={className}
      style={{ objectFit: "contain", display: "inline-block" }}
    />
  );
};

const languages = [
  { code: "ar" as const, name: "العربية", nativeName: "عربي", flag: "🇸🇾" },
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
          flex items-center gap-2 px-3 py-2 rounded-lg
          bg-white border border-gray-200 shadow-sm
          hover:bg-gray-50 hover:border-gray-300
          focus:outline-none focus:ring-2 focus:ring-primary-yellow/50 focus:ring-offset-2
          transition-all duration-200
          ${isOpen ? "bg-gray-50 border-gray-300 shadow-md" : ""}
        `}
        aria-label="Select language"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Globe Icon */}
        <svg
          className="w-5 h-5 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
          />
        </svg>

        {/* Current Language */}
        <span className="text-sm font-medium text-gray-700 hidden sm:inline flex items-center gap-1.5">
          {currentLanguage.code === "ar" ? (
            <SyrianGreenFlag className="w-4 h-4" />
          ) : (
            <span>{currentLanguage.flag}</span>
          )}
          {currentLanguage.nativeName}
        </span>
        <span className="text-sm font-medium text-gray-700 sm:hidden flex items-center">
          {currentLanguage.code === "ar" ? (
            <SyrianGreenFlag className="w-4 h-4" />
          ) : (
            <span>{currentLanguage.flag}</span>
          )}
        </span>

        {/* Dropdown Arrow */}
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
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
          className="absolute top-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[180px] max-h-[300px] overflow-y-auto z-[9999] transform transition-all duration-200 ease-out origin-top-right opacity-100 scale-100"
          role="menu"
          aria-orientation="vertical"
          style={{
            [language === 'ar' ? 'left' : 'right']: 0,
            maxHeight: '300px',
            overflowY: 'auto',
          }}
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleLanguageChange(lang.code)}
              className={`
                w-full flex items-center gap-3 px-4 py-2.5 text-left
                transition-colors duration-150
                ${
                  language === lang.code
                    ? "bg-primary-yellow/10 text-primary-dark font-semibold"
                    : "text-gray-700 hover:bg-gray-50"
                }
                focus:outline-none focus:bg-gray-50
              `}
              role="menuitem"
              aria-label={`Switch to ${lang.name}`}
            >
              {/* Flag */}
              {lang.code === "ar" ? (
                <SyrianGreenFlag className="w-6 h-6" />
              ) : (
                <span className="text-xl" role="img" aria-label={lang.name}>
                  {lang.flag}
                </span>
              )}

              {/* Language Name */}
              <div className="flex flex-col">
                <span className="text-sm font-medium">{lang.nativeName}</span>
                <span className="text-xs text-gray-500">{lang.name}</span>
              </div>

              {/* Checkmark for selected language */}
              {language === lang.code && (
                <svg
                  className="w-5 h-5 text-primary-dark ml-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
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
