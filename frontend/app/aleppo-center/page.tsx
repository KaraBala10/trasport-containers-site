'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import aleppoCenterContent from '@/content/aleppo-center.json';

type Language = 'ar' | 'en';

export default function AleppoCenterPage() {
  const [language, setLanguage] = useState<Language>('ar');
  const content = aleppoCenterContent[language];
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
            <div className="mt-4">
              <span className="inline-block bg-primary-yellow text-primary-dark px-4 py-2 rounded-full text-sm font-bold">
                {content.note}
              </span>
            </div>
          </div>
        </div>

        {/* Locations Table */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-5xl mx-auto">
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-lg shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-primary-dark text-white">
                  <tr>
                    <th className="px-6 py-4 text-right font-bold text-lg">{content.tableHeaders.country}</th>
                    <th className="px-6 py-4 text-right font-bold text-lg">{content.tableHeaders.city}</th>
                    <th className="px-6 py-4 text-right font-bold text-lg">{content.tableHeaders.address}</th>
                    <th className="px-6 py-4 text-right font-bold text-lg">{content.tableHeaders.service}</th>
                  </tr>
                </thead>
                <tbody>
                  {content.locations.map((location, index) => (
                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {location.countryCode === 'SY' && (
                            <svg className="w-8 h-8 flex-shrink-0" viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
                              <rect width="900" height="200" fill="#CE1126"/>
                              <rect y="200" width="900" height="200" fill="#FFFFFF"/>
                              <rect y="400" width="900" height="200" fill="#000000"/>
                              <g transform="translate(225,300)">
                                <polygon points="0,-50 14.7,-15.5 48.3,-12.4 24.1,11.8 30.9,45 0,27.5 -30.9,45 -24.1,11.8 -48.3,-12.4 -14.7,-15.5" fill="#007A3D"/>
                                <polygon points="75,-50 89.7,-15.5 123.3,-12.4 99.1,11.8 105.9,45 75,27.5 44.1,45 50.9,11.8 26.7,-12.4 60.3,-15.5" fill="#007A3D"/>
                              </g>
                            </svg>
                          )}
                          <span className="font-semibold text-primary-dark text-lg">{location.country}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700 font-semibold">{location.city}</td>
                      <td className="px-6 py-4 text-gray-700">{location.address}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {location.services.map((service, idx) => (
                            <span 
                              key={idx} 
                              className="bg-primary-yellow text-primary-dark px-3 py-1 rounded-full text-sm font-bold"
                            >
                              {service}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {content.locations.map((location, index) => (
                <div key={index} className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-primary-yellow">
                  <div className="flex items-center gap-3 mb-4">
                    {location.countryCode === 'SY' && (
                      <svg className="w-12 h-12 flex-shrink-0" viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
                        <rect width="900" height="200" fill="#CE1126"/>
                        <rect y="200" width="900" height="200" fill="#FFFFFF"/>
                        <rect y="400" width="900" height="200" fill="#000000"/>
                        <g transform="translate(225,300)">
                          <polygon points="0,-50 14.7,-15.5 48.3,-12.4 24.1,11.8 30.9,45 0,27.5 -30.9,45 -24.1,11.8 -48.3,-12.4 -14.7,-15.5" fill="#007A3D"/>
                          <polygon points="75,-50 89.7,-15.5 123.3,-12.4 99.1,11.8 105.9,45 75,27.5 44.1,45 50.9,11.8 26.7,-12.4 60.3,-15.5" fill="#007A3D"/>
                        </g>
                      </svg>
                    )}
                    <div>
                      <div className="font-bold text-primary-dark text-lg">{location.country}</div>
                      <div className="text-gray-600 font-semibold">{location.city}</div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-sm text-gray-500 mb-1">{content.tableHeaders.address}</div>
                    <div className="text-gray-700">{location.address}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500 mb-2">{content.tableHeaders.service}</div>
                    <div className="flex flex-wrap gap-2">
                      {location.services.map((service, idx) => (
                        <span 
                          key={idx} 
                          className="bg-primary-yellow text-primary-dark px-3 py-1 rounded-full text-sm font-bold"
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
        </div>

        {/* Services Info */}
        <div className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-dark text-center mb-12">
              {content.servicesInfo.title}
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Distribution Service Card */}
              <div className="bg-white rounded-lg shadow-lg p-8 border-t-4 border-primary-yellow">
                <div className="flex items-center gap-3 mb-4">
                  <svg className="w-12 h-12 text-primary-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  <h3 className="text-2xl font-bold text-primary-dark">{content.servicesInfo.distribution.title}</h3>
                </div>
                <p className="text-gray-700">{content.servicesInfo.distribution.description}</p>
              </div>

              {/* Storage Service Card */}
              <div className="bg-white rounded-lg shadow-lg p-8 border-t-4 border-primary-dark">
                <div className="flex items-center gap-3 mb-4">
                  <svg className="w-12 h-12 text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                  </svg>
                  <h3 className="text-2xl font-bold text-primary-dark">{content.servicesInfo.storage.title}</h3>
                </div>
                <p className="text-gray-700">{content.servicesInfo.storage.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info Section */}
        <div className="bg-primary-dark text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              {content.contactInfo.title}
            </h2>
            
            <div className="max-w-2xl mx-auto space-y-4">
              <p className="text-xl font-semibold text-primary-yellow">
                {content.contactInfo.partner}
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-6">
                <a 
                  href={`tel:${content.contactInfo.phone}`}
                  className="flex items-center gap-2 text-lg hover:text-primary-yellow transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {content.contactInfo.phone}
                </a>
                
                <a 
                  href={`mailto:${content.contactInfo.email}`}
                  className="flex items-center gap-2 text-lg hover:text-primary-yellow transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {content.contactInfo.email}
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer language={language} />
    </div>
  );
}

