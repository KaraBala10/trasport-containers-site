"use client";

import { useState, useEffect } from "react";

interface LanguageSwitcherProps {
  language: "ar" | "en";
  setLanguage: (lang: "ar" | "en") => void;
}

const languages = [
  { code: "ar" as const, name: "العربية", nativeName: "AR", flag: "🇸🇦" },
  { code: "en" as const, name: "English", nativeName: "EN", flag: "🇬🇧" },
];

export default function LanguageSwitcher({
  language,
  setLanguage,
}: LanguageSwitcherProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const isArabic = language === "ar";

  const handleToggle = () => {
    setIsAnimating(true);
    const newLang = language === "ar" ? "en" : "ar";
    setTimeout(() => {
      setLanguage(newLang);
      setIsAnimating(false);
    }, 150);
  };

  return (
    <div
      className="relative z-[110]"
      style={{ overflow: "visible", position: "relative", zIndex: 110 }}
      dir="ltr"
    >
      {/* Toggle Switch Container */}
      <button
        type="button"
        onClick={handleToggle}
        className={`
          group relative flex items-center justify-between
          w-[110px] h-[44px] md:w-[130px] md:h-[48px]
          rounded-full
          bg-gradient-to-r from-gray-800/90 via-gray-700/90 to-gray-800/90
          backdrop-blur-xl
          border-2 border-white/10
          shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]
          transition-all duration-500 ease-out
          hover:border-primary-yellow/30
          hover:shadow-[0_12px_40px_rgba(255,210,0,0.2),inset_0_1px_0_rgba(255,255,255,0.2)]
          focus:outline-none focus:ring-4 focus:ring-primary-yellow/30 focus:ring-offset-2
          overflow-hidden
          ${isAnimating ? "scale-95" : "scale-100"}
        `}
        aria-label={`Switch to ${isArabic ? "English" : "Arabic"}`}
        aria-pressed={isArabic}
      >
        {/* Animated Background Glow */}
        <div
          className={`
            absolute inset-0 rounded-full
            bg-gradient-to-r from-primary-yellow/20 via-primary-yellow/30 to-primary-yellow/20
            transition-all duration-500 ease-out
            ${
              isArabic
                ? "translate-x-0 opacity-100"
                : "translate-x-full opacity-0"
            }
          `}
        />

        {/* Sliding Indicator */}
        <div
          className={`
            absolute top-1 left-1 bottom-1
            w-[48px] md:w-[58px]
            rounded-full
            bg-gradient-to-br from-primary-yellow via-primary-yellow/95 to-primary-yellow/90
            shadow-[0_4px_20px_rgba(255,210,0,0.5),inset_0_1px_0_rgba(255,255,255,0.3)]
            transition-all duration-500 ease-out
            ${
              isArabic
                ? "translate-x-0"
                : "translate-x-[58px] md:translate-x-[68px]"
            }
            ${isAnimating ? "scale-95" : "scale-100"}
          `}
        >
          {/* Shimmer Effect */}
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div
              className={`
                absolute inset-0
                bg-gradient-to-r from-transparent via-white/30 to-transparent
                translate-x-[-100%]
                group-hover:translate-x-[100%]
                transition-transform duration-1000 ease-in-out
              `}
            />
          </div>

          {/* Glow Pulse */}
          <div
            className={`
              absolute inset-0 rounded-full
              bg-primary-yellow/50
              animate-pulse
              opacity-0 group-hover:opacity-100
              transition-opacity duration-300
            `}
          />
        </div>

        {/* Language Options - AR/EN Text */}
        <div className="relative z-10 flex items-center justify-between w-full px-4 md:px-5 gap-2">
          {/* Arabic Option */}
          <div
            className={`
              flex items-center justify-center flex-1
              transition-all duration-500 ease-out
              ${isArabic ? "scale-110 z-20" : "scale-100 opacity-50 z-10"}
            `}
          >
            <span
              className={`
                text-sm md:text-base font-extrabold tracking-wider
                transition-all duration-500 ease-out
                pointer-events-none
                ${
                  isArabic
                    ? "text-primary-dark drop-shadow-lg"
                    : "text-gray-300"
                }
              `}
            >
              {languages[0].nativeName}
            </span>
          </div>

          {/* English Option */}
          <div
            className={`
              flex items-center justify-center flex-1
              transition-all duration-500 ease-out
              ${!isArabic ? "scale-110 z-20" : "scale-100 opacity-50 z-10"}
            `}
          >
            <span
              className={`
                text-sm md:text-base font-extrabold tracking-wider
                transition-all duration-500 ease-out
                pointer-events-none
                ${
                  !isArabic
                    ? "text-primary-dark drop-shadow-lg"
                    : "text-gray-300"
                }
              `}
            >
              {languages[1].nativeName}
            </span>
          </div>
        </div>

        {/* Ripple Effect on Click */}
        <div
          className={`
            absolute inset-0 rounded-full
            bg-white/20
            scale-0
            ${isAnimating ? "scale-150 opacity-0 animate-ping" : ""}
            transition-all duration-500
          `}
        />

        {/* Border Glow Effect */}
        <div
          className={`
            absolute inset-0 rounded-full
            border-2 border-primary-yellow/0
            transition-all duration-500
            ${isAnimating ? "border-primary-yellow/60" : ""}
          `}
        />
      </button>

      {/* Floating Particles Effect (Optional decorative element) */}
      <div className="absolute inset-0 pointer-events-none overflow-visible">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={`
              absolute w-1 h-1 rounded-full bg-primary-yellow/60
              transition-all duration-1000 ease-out
              ${isAnimating ? "opacity-100" : "opacity-0"}
            `}
            style={{
              top: `${20 + i * 15}%`,
              left: isArabic ? `${30 + i * 10}%` : `${70 - i * 10}%`,
              transform: isAnimating
                ? `translateY(-20px) scale(2)`
                : `translateY(0) scale(1)`,
              transitionDelay: `${i * 100}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
