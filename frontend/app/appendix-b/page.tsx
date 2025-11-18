'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import appendixBContent from '@/content/appendix-b.json';

type Language = 'ar' | 'en';

export default function AppendixBPage() {
  const [language, setLanguage] = useState<Language>('ar');
  const content = appendixBContent[language];
  const isRTL = language === 'ar';

  const handleDownload = () => {
    // رابط ثابت لملف PDF - يمكن تغييره عند توفر الملف
    const pdfUrl = `/documents/${content.downloadSection.fileName}`;
    // يمكن أيضاً استخدام window.open(pdfUrl, '_blank');
    alert(language === 'ar' ? 'سيتم توفير رابط التحميل قريباً' : 'Download link will be available soon');
  };

  return (
    <div className="min-h-screen flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
      <Header language={language} setLanguage={setLanguage} />
      
      <main className="flex-grow" role="main">
        {/* Hero Section */}
        <div className="bg-red-700 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-full mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{content.mainTitle}</h1>
            <p className="text-2xl font-semibold mb-2">{content.subtitle}</p>
            <p className="text-xl max-w-3xl mx-auto">{content.intro}</p>
          </div>
        </div>

        {/* Download Section - Top */}
        <div className="bg-gradient-to-r from-primary-dark to-blue-900 text-white py-12 border-b-4 border-primary-yellow">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <svg className="w-16 h-16 mx-auto mb-4 text-primary-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                {content.downloadSection.title}
              </h2>
              <p className="text-lg mb-6">
                {content.downloadSection.description}
              </p>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-3 bg-primary-yellow text-primary-dark px-8 py-4 rounded-md font-bold text-lg hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {content.downloadSection.downloadButton}
              </button>
              <div className="mt-3 text-sm text-gray-300">
                {content.downloadSection.fileSize}
              </div>
            </div>
          </div>
        </div>

        {/* Categories List */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto space-y-8">
            {content.categories.map((category) => (
              <div 
                key={category.id}
                className="bg-white rounded-lg shadow-lg p-6 md:p-8 border-r-4 border-red-600"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center font-bold text-red-700 text-lg flex-shrink-0">
                    {category.id}
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-red-700">
                    {category.title}
                  </h3>
                </div>
                <ul className="space-y-2">
                  {category.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Warning Box */}
        <div className="bg-yellow-50 border-t-4 border-yellow-500 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-start gap-4">
                <svg className="w-10 h-10 text-yellow-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-yellow-800 mb-2">{content.warningBox.title}</h3>
                  <p className="text-yellow-700 text-base md:text-lg">{content.warningBox.content}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Download Section - Bottom */}
        <div className="bg-gradient-to-r from-primary-dark to-blue-900 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {content.downloadSection.title}
              </h2>
              <p className="text-xl mb-8">
                {content.downloadSection.description}
              </p>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-3 bg-primary-yellow text-primary-dark px-10 py-5 rounded-md font-bold text-xl hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {content.downloadSection.downloadButton}
              </button>
              <div className="mt-4 text-sm text-gray-300">
                {content.downloadSection.fileSize}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer language={language} />
    </div>
  );
}

