"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import privacyContent from "@/content/privacy.json";
import { useLanguage } from "@/hooks/useLanguage";

const iconComponents: Record<string, React.FC<{ className?: string }>> = {
  database: ({ className }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
      />
    </svg>
  ),
  shield: ({ className }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  ),
  lock: ({ className }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  ),
  user: ({ className }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  ),
  clock: ({ className }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  security: ({ className }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  ),
  cookie: ({ className }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
      />
    </svg>
  ),
  mail: ({ className }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  ),
};

export default function PrivacyPage() {
  const { language, isRTL } = useLanguage();
  const content = privacyContent[language];

  return (
    <div className="min-h-screen flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
      <Header />

      <main className="flex-grow" role="main">
        {/* Hero Section */}
        <div className="bg-primary-dark text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {content.mainTitle}
            </h1>
            <p className="text-xl max-w-3xl mx-auto mb-4">{content.intro}</p>
            <div className="flex items-center justify-center">
              <span className="text-sm text-gray-300">
                {content.lastUpdated}
              </span>
            </div>
          </div>
        </div>

        {/* Privacy Sections */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-5xl mx-auto space-y-6">
            {content.sections.map((section) => {
              const IconComponent = iconComponents[section.icon];

              return (
                <div
                  key={section.id}
                  className="bg-white rounded-lg shadow-lg p-6 md:p-8 border-r-4 border-primary-yellow hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {IconComponent && (
                        <div className="w-12 h-12 bg-primary-yellow/10 rounded-lg flex items-center justify-center">
                          <IconComponent className="w-7 h-7 text-primary-dark" />
                        </div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <h2 className="text-xl md:text-2xl font-bold text-primary-dark mb-3">
                        {section.title}
                      </h2>
                      <p className="text-gray-700 leading-relaxed text-base md:text-lg">
                        {section.content}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Download Documents Section */}
        <div className="bg-gradient-to-r from-primary-dark to-blue-900 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <svg
                className="w-16 h-16 mx-auto mb-6 text-primary-yellow"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                {language === "ar" ? "تحميل المستندات" : "Download Documents"}
              </h3>
              <p className="text-lg text-gray-200 mb-8">
                {language === "ar"
                  ? "جميع سياسات الخصوصية متاحة للتحميل"
                  : "All privacy policies are available for download"}
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <a
                  href="/documents/GDPR Privacy Policy - Medo-Freight EU.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary-yellow text-primary-dark px-6 py-4 rounded-xl font-bold text-lg hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  {language === "ar" ? "سياسة GDPR" : "GDPR Policy"}
                </a>
                <a
                  href="/documents/Cookie Policy - Medo-Freight EU.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary-yellow text-primary-dark px-6 py-4 rounded-xl font-bold text-lg hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  {language === "ar" ? "سياسة الكوكيز" : "Cookie Policy"}
                </a>
                <a
                  href="/documents/AML_KYC Compliance - Medo-Freight EU.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary-yellow text-primary-dark px-6 py-4 rounded-xl font-bold text-lg hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  {language === "ar" ? "AML/KYC" : "AML/KYC"}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="bg-gray-100 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="text-2xl md:text-3xl font-bold text-primary-dark mb-4">
                {content.footer.title}
              </h3>
              <p className="text-lg text-gray-700">{content.footer.content}</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
