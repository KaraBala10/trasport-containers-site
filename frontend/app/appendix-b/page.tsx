'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

type Language = 'ar' | 'en';

export default function AppendixBPage() {
  const [language, setLanguage] = useState<Language>('ar');

  const translations = {
    ar: {
      title: 'الملحق (B) - المواد المحظورة',
      description: 'قائمة البضائع والمواد المحظورة وفقاً للوائح الشحن الدولية',
      comingSoon: 'قريباً',
      placeholder: 'هذه الصفحة قيد التطوير. سيتم إضافة قائمة المواد المحظورة الكاملة قريباً.',
      prohibited: 'يمنع شحن: الأموال، المعادن الثمينة، المواد القابلة للاشتعال، الأدوية، والمواد الخطرة.',
      inspection: 'جميع الشحنات تُفحص قبل التحميل لضمان التوافق مع لوائح الاتحاد الأوروبي.',
    },
    en: {
      title: 'Appendix B - Prohibited Materials',
      description: 'List of prohibited goods and materials according to international shipping regulations',
      comingSoon: 'Coming Soon',
      placeholder: 'This page is under development. The complete list of prohibited materials will be added soon.',
      prohibited: 'Prohibited items include: Money, precious metals, flammable materials, pharmaceuticals, and hazardous materials.',
      inspection: 'All shipments are inspected before loading to ensure compliance with EU regulations.',
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
            <p className="text-xl max-w-3xl mx-auto">{t.description}</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto">
            <div className="bg-red-50 border-2 border-red-500 p-8 rounded-lg shadow-lg mb-8">
              <h2 className="text-3xl font-bold text-red-700 mb-4">{t.comingSoon}</h2>
              <p className="text-lg text-gray-700 mb-4">{t.placeholder}</p>
              <p className="text-gray-800 font-medium">{t.prohibited}</p>
            </div>
            
            <div className="bg-gray-100 p-6 rounded-lg">
              <p className="text-gray-800 font-medium text-center">{t.inspection}</p>
            </div>
          </div>
        </div>
      </main>

      <Footer language={language} />
    </div>
  );
}

