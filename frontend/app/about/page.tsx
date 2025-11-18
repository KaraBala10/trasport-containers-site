'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import aboutContent from '@/content/about.json';

type Language = 'ar' | 'en';

export default function AboutPage() {
  const [language, setLanguage] = useState<Language>('ar');
  const content = aboutContent[language];
  const isRTL = language === 'ar';

  return (
    <div className="min-h-screen flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
      <Header language={language} setLanguage={setLanguage} />
      
      <main className="flex-grow" role="main">
        {/* Hero Section */}
        <div className="bg-primary-dark text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{content.mainTitle}</h1>
            <p className="text-xl max-w-3xl mx-auto">{content.intro}</p>
          </div>
        </div>

        {/* Offices Section */}
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-dark text-center mb-12">
            {content.offices.title}
          </h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Europe Office */}
            <div className="bg-white rounded-lg shadow-lg p-8 border-t-4 border-primary-yellow">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-primary-dark mb-2">
                  {content.offices.europe.title}
                </h3>
                <div className="text-primary-yellow font-bold text-xl mb-1">
                  {content.offices.europe.companyName}
                </div>
                <div className="text-gray-600 text-sm italic">
                  {content.offices.europe.tagline}
                </div>
              </div>

              <div className="space-y-4">
                {/* Address */}
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-primary-dark flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-gray-700">{content.offices.europe.address}</p>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-primary-dark flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href={`tel:${content.offices.europe.phone}`} className="text-gray-700 hover:text-primary-yellow transition-colors">
                    {content.offices.europe.phone}
                  </a>
                </div>

                {/* Email */}
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-primary-dark flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href={`mailto:${content.offices.europe.email}`} className="text-gray-700 hover:text-primary-yellow transition-colors">
                    {content.offices.europe.email}
                  </a>
                </div>

                {/* Website */}
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-primary-dark flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <a href={`https://${content.offices.europe.website}`} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-primary-yellow transition-colors">
                    {content.offices.europe.website}
                  </a>
                </div>
              </div>
            </div>

            {/* Syria Office */}
            <div className="bg-white rounded-lg shadow-lg p-8 border-t-4 border-primary-dark">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-primary-dark mb-2">
                  {content.offices.syria.title}
                </h3>
                <div className="text-primary-dark font-bold text-xl mb-1">
                  {content.offices.syria.companyName}
                </div>
                <div className="text-gray-600 text-sm italic">
                  {content.offices.syria.companyNameEn}
                </div>
              </div>

              <div className="space-y-4">
                {/* Locations */}
                {content.offices.syria.locations.map((location, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-primary-dark flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <div className="font-semibold text-primary-dark">{location.name}</div>
                      <div className="text-gray-700">{location.address}</div>
                    </div>
                  </div>
                ))}

                {/* Phone */}
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-primary-dark flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href={`tel:${content.offices.syria.phone}`} className="text-gray-700 hover:text-primary-yellow transition-colors">
                    {content.offices.syria.phone}
                  </a>
                </div>

                {/* Email */}
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-primary-dark flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href={`mailto:${content.offices.syria.email}`} className="text-gray-700 hover:text-primary-yellow transition-colors">
                    {content.offices.syria.email}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer language={language} />
    </div>
  );
}

