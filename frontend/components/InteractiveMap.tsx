'use client';

import { useEffect, useRef } from 'react';

type Language = 'ar' | 'en';

interface InteractiveMapProps {
  language: Language;
}

export default function InteractiveMap({ language }: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize map using Leaflet or Google Maps
    // For now, using a placeholder with CSS
    if (mapRef.current) {
      // Map will be initialized here
      // You can use Leaflet, Google Maps, or Mapbox
    }
  }, []);

  const translations = {
    ar: {
      title: 'مراكزنا الأوروبية',
      description: 'نقاط التجميع والتوزيع في أوروبا',
    },
    en: {
      title: 'Our European Centers',
      description: 'Collection and distribution points across Europe',
    },
  };

  const t = translations[language];

  // European centers coordinates (example)
  const centers = [
    { name: 'Amsterdam', lat: 52.3676, lng: 4.9041 },
    { name: 'Rotterdam', lat: 51.9244, lng: 4.4777 },
    { name: 'Berlin', lat: 52.5200, lng: 13.4050 },
    { name: 'Frankfurt', lat: 50.1109, lng: 8.6821 },
  ];

  return (
    <div className="w-full">
      <h3 className="text-2xl font-bold mb-4 text-primary-dark">{t.title}</h3>
      <p className="text-gray-600 mb-6">{t.description}</p>
      
      {/* Map Container */}
      <div
        ref={mapRef}
        className="w-full h-96 bg-gradient-to-br from-primary-dark to-primary-dark rounded-lg relative overflow-hidden flex items-center justify-center"
      >
        {/* Map markers will be added here */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white bg-opacity-90 p-4 rounded-lg text-center">
            <p className="text-primary-dark font-bold">
              {language === 'ar' ? 'خريطة تفاعلية - سيتم إضافة الخريطة الحقيقية' : 'Interactive Map - Real map will be added'}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              {language === 'ar' 
                ? 'استخدم Leaflet أو Google Maps API' 
                : 'Use Leaflet or Google Maps API'}
            </p>
          </div>
        </div>
      </div>

      {/* Centers List */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {centers.map((center) => (
          <div key={center.name} className="bg-white p-4 rounded-lg shadow-md text-center">
            <div className="w-3 h-3 bg-primary-yellow rounded-full mx-auto mb-2"></div>
            <p className="font-bold text-primary-dark">{center.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

