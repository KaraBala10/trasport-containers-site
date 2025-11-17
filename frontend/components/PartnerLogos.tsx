'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function PartnerLogos() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const partners = [
    { name: 'PostNL', logo: '/logos/postnl.png', alt: 'PostNL Logo' },
    { name: 'BMC', logo: '/logos/bmc.png', alt: 'BMC Logo' },
    { name: 'DHL', logo: '/logos/dhl.png', alt: 'DHL Logo' },
  ];

  // Render placeholder during SSR to match structure
  if (!isMounted) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center justify-items-center">
        {partners.map((partner) => (
          <div
            key={partner.name}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all min-w-[200px] max-w-[250px] flex items-center justify-center h-32"
          >
            <div className="w-32 h-16 bg-gray-200 animate-pulse rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center justify-items-center">
      {partners.map((partner) => (
        <div
          key={partner.name}
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all min-w-[200px] max-w-[250px] flex items-center justify-center h-32"
        >
          <Image
            src={partner.logo}
            alt={partner.alt}
            width={200}
            height={100}
            className="object-contain max-h-24 w-auto filter grayscale hover:grayscale-0 transition-all duration-300"
            loading="lazy"
            unoptimized
          />
        </div>
      ))}
    </div>
  );
}
