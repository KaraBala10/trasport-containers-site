'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

type Language = 'ar' | 'en';

export default function EmergencyPage() {
  const [language, setLanguage] = useState<Language>('ar');

  const translations = {
    ar: {
      title: 'اتصال الطوارئ',
      description: 'معلومات الاتصال في حالات الطوارئ',
      comingSoon: 'قريباً',
      placeholder: 'هذه الصفحة قيد التطوير. سيتم إضافة معلومات الاتصال في حالات الطوارئ قريباً.',
    },
    en: {
      title: 'Emergency Contact',
      description: 'Emergency contact information',
      comingSoon: 'Coming Soon',
      placeholder: 'This page is under development. Emergency contact information will be added soon.',
    },
  };

  const t = translations[language];

  return (
    <div className="min-h-screen flex flex-col">
      <Header language={language} setLanguage={setLanguage} />
      
      <main className="flex-grow" role="main">
        <div className="bg-primary-dark text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t.title}</h1>
            <p className="text-xl">{t.description}</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-red-500 text-white p-8 rounded-lg shadow-lg">
              <h2 className="text-3xl font-bold mb-4">{t.comingSoon}</h2>
              <p className="text-lg">{t.placeholder}</p>
            </div>
          </div>
        </div>
      </main>

      <Footer language={language} />
    </div>
  );
}

