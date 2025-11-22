"use client";

import { useState } from "react";

type Language = "ar" | "en";

interface InteractiveMapProps {
  language: Language;
}

export default function InteractiveMap({ language }: InteractiveMapProps) {
  const [hoveredCenter, setHoveredCenter] = useState<number | null>(null);

  const translations = {
    ar: {
      title: "مراكزنا",
      description: "نقاط التجميع والتوزيع حول العالم",
      country: "الدولة",
      city: "المدينة",
      address: "العنوان",
      service: "الخدمة",
    },
    en: {
      title: "Our Centers",
      description: "Collection and distribution points worldwide",
      country: "Country",
      city: "City",
      address: "Address",
      service: "Service",
    },
  };

  const t = translations[language];

  // Centers (3 points)
  const centers = [
    {
      id: 1,
      country: "Netherlands",
      countryAr: "هولندا",
      city: "Bergen op Zoom",
      cityAr: "Bergen op Zoom",
      address: "Wattweg 5, 4622RA Bergen op Zoom, Nederland",
      addressAr: "Wattweg 5, 4622RA Bergen op Zoom, Nederland",
      services: ["LCL", "FCL"],
      x: "30%", // Position on map
      y: "30%",
      flag: "🇳🇱",
      useSvg: false,
    },
    {
      id: 2,
      country: "Syria",
      countryAr: "سورية",
      city: "Aleppo - Ramousa",
      cityAr: "حلب – الراموسة",
      address: "Next to Pullman Garage",
      addressAr: "بجانب كراج البولمان",
      services: [language === "ar" ? "توزيع LCL+FCL" : "Distribution LCL+FCL"],
      x: "65%",
      y: "55%",
      flag: "🇸🇾",
      useSvg: true,
      svgPath: "/images/syrian_flag.svg",
    },
    {
      id: 3,
      country: "Syria",
      countryAr: "سورية",
      city: "Aleppo - Sheikh Najjar",
      cityAr: "حلب – الشيخ نجار",
      address: "International Shipping Offices Area",
      addressAr: "منطقة مكاتب الشحن الدولي",
      services: [language === "ar" ? "FCL التجاري" : "Commercial FCL"],
      x: "67%",
      y: "57%",
      flag: "🇸🇾",
      useSvg: true,
      svgPath: "/images/syrian_flag.svg",
    },
  ];

  return (
    <div className="w-full">
      <h3 className="text-3xl md:text-4xl font-bold mb-4 text-center text-primary-dark">
        {t.title}
      </h3>
      <p className="text-gray-600 mb-8 text-center text-lg">{t.description}</p>

      {/* Map Container */}
      <div className="w-full max-w-6xl mx-auto bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-2xl p-8 relative overflow-hidden">
        {/* Simplified World Map (Europe to Middle East) */}
        <div className="relative w-full h-[500px] bg-white rounded-xl shadow-inner flex items-center justify-center overflow-hidden">
          {/* Simple map background with continents outline */}
          <svg
            viewBox="0 0 1000 600"
            className="absolute inset-0 w-full h-full opacity-20"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Europe */}
            <path
              d="M 150 150 L 200 130 L 280 140 L 350 160 L 400 180 L 430 220 L 450 270 L 440 320 L 410 360 L 370 380 L 320 390 L 260 380 L 220 350 L 180 300 L 160 240 L 155 190 Z"
              fill="#E5E7EB"
              stroke="#9CA3AF"
              strokeWidth="2"
            />
            {/* Middle East / Syria area */}
            <path
              d="M 550 280 L 620 270 L 680 290 L 720 330 L 730 380 L 710 420 L 670 440 L 620 430 L 580 400 L 560 360 L 555 320 Z"
              fill="#E5E7EB"
              stroke="#9CA3AF"
              strokeWidth="2"
            />
            {/* Connection line (symbolic route) */}
            <line
              x1="400"
              y1="250"
              x2="580"
              y2="350"
              stroke="#FFD200"
              strokeWidth="3"
              strokeDasharray="10,5"
              opacity="0.4"
            />
          </svg>

          {/* Grid lines for visual effect */}
          <div className="absolute inset-0 opacity-10">
            {[...Array(10)].map((_, i) => (
              <div
                key={`h-${i}`}
                className="absolute w-full border-t border-gray-400"
                style={{ top: `${i * 10}%` }}
              ></div>
            ))}
            {[...Array(12)].map((_, i) => (
              <div
                key={`v-${i}`}
                className="absolute h-full border-l border-gray-400"
                style={{ left: `${i * 8.33}%` }}
              ></div>
            ))}
          </div>

          {/* Center Points */}
          {centers.map((center) => (
            <div
              key={center.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              style={{ left: center.x, top: center.y }}
              onMouseEnter={() => setHoveredCenter(center.id)}
              onMouseLeave={() => setHoveredCenter(null)}
            >
              {/* Pulsing circle effect */}
              <div className="absolute w-16 h-16 bg-primary-yellow rounded-full animate-ping opacity-30 -top-8 -left-8"></div>

              {/* Main point */}
              <div className="relative">
                <div className="w-6 h-6 bg-primary-yellow rounded-full border-4 border-white shadow-lg group-hover:scale-125 transition-transform duration-300 relative z-10"></div>

                {/* Info popup on hover */}
                {hoveredCenter === center.id && (
                  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-primary-dark text-white px-5 py-3 rounded-lg shadow-xl z-20 animate-fade-in min-w-[220px]">
                    <div className="mb-1 flex items-center justify-center h-8">
                      {center.useSvg && center.svgPath ? (
                        <img
                          src={center.svgPath}
                          alt={`${center.country} flag`}
                          className="h-8 w-auto object-contain"
                        />
                      ) : (
                        <span className="text-2xl">{center.flag}</span>
                      )}
                    </div>
                    <div className="font-bold text-base">
                      {language === "ar" ? center.countryAr : center.country}
                    </div>
                    <div className="text-sm text-primary-yellow">
                      {language === "ar" ? center.cityAr : center.city}
                    </div>
                    {/* Arrow pointer */}
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-primary-dark"></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary-yellow rounded-full border-2 border-white shadow"></div>
            <span className="text-gray-700 font-medium">
              {language === "ar"
                ? "مركز تجميع وشحن"
                : "Collection & Shipping Center"}
            </span>
          </div>
        </div>
      </div>

      {/* Centers Table Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 max-w-6xl mx-auto">
        {centers.map((center) => (
          <div
            key={center.id}
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all border-t-4 border-primary-yellow cursor-pointer"
            onMouseEnter={() => setHoveredCenter(center.id)}
            onMouseLeave={() => setHoveredCenter(null)}
          >
            {/* Flag & Country */}
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
              <div className="flex items-center justify-center h-10 w-10">
                {center.useSvg && center.svgPath ? (
                  <img
                    src={center.svgPath}
                    alt={`${center.country} flag`}
                    className="h-10 w-auto object-contain"
                  />
                ) : (
                  <span className="text-3xl">{center.flag}</span>
                )}
              </div>
              <div>
                <h4 className="font-bold text-lg text-primary-dark">
                  {language === "ar" ? center.countryAr : center.country}
                </h4>
                <p className="text-sm text-gray-500">{t.country}</p>
              </div>
            </div>

            {/* City */}
            <div className="mb-3">
              <div className="text-xs text-gray-500 mb-1">{t.city}</div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-primary-yellow flex-shrink-0"
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
                <p className="text-gray-700 font-medium text-sm">
                  {language === "ar" ? center.cityAr : center.city}
                </p>
              </div>
            </div>

            {/* Address */}
            <div className="mb-3">
              <div className="text-xs text-gray-500 mb-1">{t.address}</div>
              <p className="text-gray-600 text-sm">
                {language === "ar" ? center.addressAr : center.address}
              </p>
            </div>

            {/* Services */}
            <div>
              <div className="text-xs text-gray-500 mb-2">{t.service}</div>
              <div className="flex flex-wrap gap-2">
                {center.services.map((service, idx) => (
                  <span
                    key={idx}
                    className="bg-primary-yellow text-primary-dark px-3 py-1 rounded-full text-xs font-bold"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
