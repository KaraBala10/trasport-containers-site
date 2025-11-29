"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function PartnerLogos() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const partners = [
    {
      id: 1,
      name: "Medo-Freight EU",
      nameAr: "Medo-Freight EU",
      location: "Netherlands",
      locationAr: "هولندا",
      icon: "🇪🇺",
      useSvg: false,
    },
    {
      id: 2,
      name: "Al Ikram Trading Co.",
      nameAr: "شركة الإكرام التجارية",
      location: "Middle East",
      locationAr: "الشرق الأوسط",
      icon: "🌐",
      useSvg: false,
    },
    {
      id: 3,
      name: "Future Partners",
      nameAr: "شركاء مستقبليون",
      location: "China · Maritime Lines",
      locationAr: "الصين · خطوط ملاحية",
      icon: "🌐",
      isFuture: true,
    },
  ];

  // Render placeholder during SSR to match structure
  if (!isMounted) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch justify-items-center">
        {partners.map((partner) => (
          <div
            key={partner.id}
            className="bg-white p-6 rounded-lg shadow-md min-w-[200px] max-w-[300px] w-full"
          >
            <div className="w-full h-24 bg-gray-200 animate-pulse rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch justify-items-center"
      role="list"
      aria-label="Partner companies"
    >
      {partners.map((partner) => (
        <div
          key={partner.id}
          className={`bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-all min-w-[200px] max-w-[300px] w-full border-t-4 ${
            partner.isFuture ? "border-gray-400" : "border-primary-yellow"
          } ${partner.isFuture ? "opacity-70" : ""}`}
          role="listitem"
        >
          <div className="text-center">
            <div className="text-5xl mb-4 flex items-center justify-center h-16">
              {partner.useSvg && partner.svgPath ? (
                <img
                  src={partner.svgPath}
                  alt={`${partner.name} flag`}
                  className="h-11 w-auto object-contain"
                />
              ) : (
                <span>{partner.icon}</span>
              )}
            </div>
            <h3 className="text-xl font-bold text-primary-dark mb-2">
              {partner.name}
            </h3>
            <p className="text-sm text-gray-600 font-medium mb-1">
              {partner.nameAr}
            </p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <p className="text-sm text-gray-500">{partner.location}</p>
            </div>
            {partner.isFuture && (
              <div className="mt-4">
                <span className="inline-block bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold">
                  قريباً · Coming Soon
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
