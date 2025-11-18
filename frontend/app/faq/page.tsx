'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

type Language = 'ar' | 'en';

export default function FAQPage() {
  const [language, setLanguage] = useState<Language>('ar');

  const translations = {
    ar: {
      title: 'الأسئلة الشائعة',
      description: 'جميع الأسئلة والأجوبة التي قد تحتاجها',
    },
    en: {
      title: 'Frequently Asked Questions',
      description: 'All the questions and answers you might need',
    },
  };

  const t = translations[language];

  return (
    <div className="min-h-screen flex flex-col" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Header language={language} setLanguage={setLanguage} />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold text-primary-dark mb-4">
            {t.title}
          </h1>
          <p className="text-gray-600 text-lg">
            {t.description}
          </p>
          
          {/* محتوى الصفحة سيضاف لاحقاً */}
        </div>
      </main>

      <Footer language={language} />
    </div>
  );
}

