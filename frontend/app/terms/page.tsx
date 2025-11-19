'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import termsContent from '@/content/terms.json';
import { useLanguage } from '@/hooks/useLanguage';

const iconComponents: Record<string, React.FC<{ className?: string }>> = {
  payment: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  customs: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  package: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  time: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  insurance: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  prohibited: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
  ),
};

export default function TermsPage() {
  const { language, isRTL } = useLanguage();
  const content = termsContent[language];

  return (
    <div className="min-h-screen flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
      <Header />
      
      <main className="flex-grow" role="main">
        {/* Hero Section */}
        <div className="bg-primary-dark text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{content.mainTitle}</h1>
            <p className="text-xl max-w-3xl mx-auto mb-4">{content.intro}</p>
            <div className="flex items-center justify-center">
              <span className="text-sm text-gray-300">{content.lastUpdated}</span>
            </div>
          </div>
        </div>

        {/* Terms List */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-5xl mx-auto space-y-6">
            {content.terms.map((term, index) => {
              const IconComponent = iconComponents[term.icon];
              
              return (
                <div 
                  key={term.id}
                  className="bg-white rounded-lg shadow-lg p-6 md:p-8 border-r-4 border-primary-yellow hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary-yellow/20 rounded-lg flex items-center justify-center font-bold text-primary-dark text-xl">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-start gap-3 mb-3">
                        {IconComponent && (
                          <div className="flex-shrink-0 mt-1">
                            <IconComponent className="w-6 h-6 text-primary-dark" />
                          </div>
                        )}
                        <h2 className="text-xl md:text-2xl font-bold text-primary-dark">
                          {term.title}
                        </h2>
                      </div>
                      <p className="text-gray-700 leading-relaxed text-base md:text-lg">
                        {term.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Acceptance Box */}
        <div className="bg-blue-50 border-t-4 border-blue-500 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-start gap-4">
                <svg className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-blue-900 mb-2">{content.acceptanceBox.title}</h3>
                  <p className="text-blue-800 text-base md:text-lg">{content.acceptanceBox.content}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contract Download Section */}
        <div className="bg-gradient-to-r from-primary-dark to-blue-900 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <svg className="w-16 h-16 mx-auto mb-4 text-primary-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {content.contractSection.title}
              </h2>
              <p className="text-xl mb-8">
                {content.contractSection.description}
              </p>
              <a
                href="/documents/shipping-contract-full.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-primary-yellow text-primary-dark px-8 py-4 rounded-md font-bold text-lg hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {content.contractSection.downloadButton}
              </a>
              <div className="mt-4 text-sm text-gray-300">
                {content.contractSection.fileSize}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Legal Section */}
        <div className="bg-gray-100 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="text-2xl md:text-3xl font-bold text-primary-dark mb-4">
                {content.footer.title}
              </h3>
              <p className="text-lg text-gray-700">
                {content.footer.content}
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer language={language} />
    </div>
  );
}

