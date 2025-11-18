'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import faqContent from '@/content/faq.json';

type Language = 'ar' | 'en';

export default function FAQPage() {
  const [language, setLanguage] = useState<Language>('ar');
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const content = faqContent[language];
  const isRTL = language === 'ar';

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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

        {/* FAQ Accordion */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto space-y-4">
            {content.faqItems.map((item, index) => (
              <div 
                key={item.id} 
                className="bg-white rounded-lg shadow-lg overflow-hidden border-l-4 border-primary-yellow transition-all hover:shadow-xl"
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full px-6 py-5 text-right flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                  aria-expanded={openIndex === index}
                >
                  <span className="text-lg md:text-xl font-bold text-primary-dark flex-grow text-right">
                    {item.question}
                  </span>
                  <svg
                    className={`w-6 h-6 flex-shrink-0 text-primary-yellow transition-transform duration-300 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openIndex === index ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <div className="px-6 py-5 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-700 text-base md:text-lg leading-relaxed text-right">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-primary-dark to-blue-900 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {content.contactSection.title}
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              {content.contactSection.description}
            </p>
            <Link
              href="/contact"
              className="inline-block bg-primary-yellow text-primary-dark px-8 py-4 rounded-md font-bold text-lg hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-white/50"
            >
              {content.contactSection.button}
            </Link>
          </div>
        </div>
      </main>

      <Footer language={language} />
    </div>
  );
}

