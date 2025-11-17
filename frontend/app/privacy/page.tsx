'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

type Language = 'ar' | 'en';

export default function PrivacyPage() {
  const [language, setLanguage] = useState<Language>('ar');

  const translations = {
    ar: {
      title: 'سياسة الخصوصية',
      description: 'حماية بياناتك وفقاً للائحة العامة لحماية البيانات (GDPR)',
      comingSoon: 'قريباً',
      placeholder: 'هذه الصفحة قيد التطوير. سيتم إضافة سياسة الخصوصية الكاملة قريباً.',
      gdpr: 'نحن ملتزمون بحماية بياناتك الشخصية وفقاً للائحة العامة لحماية البيانات (GDPR) للاتحاد الأوروبي.',
    },
    en: {
      title: 'Privacy Policy',
      description: 'Data protection in accordance with GDPR',
      comingSoon: 'Coming Soon',
      placeholder: 'This page is under development. The complete privacy policy will be added soon.',
      gdpr: 'We are committed to protecting your personal data in accordance with the EU General Data Protection Regulation (GDPR).',
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
          <div className="max-w-3xl mx-auto">
            <div className="bg-primary-yellow p-8 rounded-lg shadow-lg mb-8">
              <h2 className="text-3xl font-bold text-primary-dark mb-4">{t.comingSoon}</h2>
              <p className="text-lg text-gray-700">{t.placeholder}</p>
            </div>
            
            <div className="bg-gray-100 p-6 rounded-lg">
              <p className="text-gray-800 font-medium text-center">{t.gdpr}</p>
            </div>
          </div>
        </div>
      </main>

      <Footer language={language} />
    </div>
  );
}

