"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import emergencyContent from "@/content/emergency.json";
import { useLanguage } from "@/hooks/useLanguage";

const iconComponents: Record<string, React.FC<{ className?: string }>> = {
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
  alert: ({ className }) => (
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
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  ),
  damage: ({ className }) => (
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
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  ),
  question: ({ className }) => (
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
        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
};

export default function EmergencyPage() {
  const { language, isRTL } = useLanguage();
  const content = emergencyContent[language];

  return (
    <div className="min-h-screen flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
      <Header />
      
      <main className="flex-grow" role="main">
        {/* Hero Section */}
        <div className="bg-red-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 rounded-full mb-6 animate-pulse">
              <svg
                className="w-14 h-14"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              {content.mainTitle}
            </h1>
            <p className="text-2xl md:text-3xl font-semibold mb-2 text-red-100">
              {content.subtitle}
            </p>
            <p className="text-xl max-w-3xl mx-auto">{content.intro}</p>
          </div>
        </div>

        {/* Phone Number Section */}
        <div className="bg-gradient-to-b from-primary-dark to-blue-900 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 md:p-12 border-4 border-primary-yellow shadow-2xl">
                <h2 className="text-2xl md:text-3xl font-bold mb-6 text-primary-yellow">
                  {content.availabilityTitle}
                </h2>
                <div className="mb-8">
                  <div className="inline-flex items-center gap-3 bg-primary-yellow/20 px-6 py-3 rounded-full">
                    <svg
                      className="w-6 h-6 text-primary-yellow"
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
                    <span className="text-xl font-bold">
                      {content.availability}
                    </span>
                  </div>
                </div>
                
                <a 
                  href={`tel:${content.emergencyNumber}`}
                  className="inline-block group"
                >
                  <div
                    className="text-6xl md:text-7xl lg:text-8xl font-bold mb-4 text-white group-hover:text-primary-yellow transition-colors duration-300"
                    dir="ltr"
                  >
                    {content.emergencyNumberFormatted}
                  </div>
                  <div className="inline-flex items-center gap-3 bg-primary-yellow text-primary-dark px-8 py-4 rounded-full font-bold text-xl hover:bg-opacity-90 transition-all shadow-lg group-hover:scale-105">
                    <svg
                      className="w-7 h-7"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    {language === "ar" ? "اتصل الآن" : "Call Now"}
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* When to Call Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-dark text-center mb-12">
              {content.whenToCall.title}
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {content.whenToCall.situations.map((situation) => {
                const IconComponent = iconComponents[situation.icon];
                
                return (
                  <div 
                    key={situation.id}
                    className="bg-white rounded-lg shadow-lg p-6 border-r-4 border-red-600 hover:shadow-xl transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {IconComponent && (
                          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <IconComponent className="w-7 h-7 text-red-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-grow">
                        <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                          {situation.title}
                        </h3>
                        <p className="text-gray-600">{situation.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Alternative Contact Section */}
        <div className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-dark text-center mb-8">
                {content.alternativeContact.title}
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                  <svg
                    className="w-12 h-12 mx-auto mb-4 text-primary-dark"
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
                  <h3 className="font-bold text-lg mb-2">
                    {language === "ar" ? "البريد الإلكتروني" : "Email"}
                  </h3>
                  <a
                    href={`mailto:${content.alternativeContact.email}`}
                    className="text-primary-dark hover:text-primary-yellow transition-colors"
                  >
                    {content.alternativeContact.email}
                  </a>
                </div>
                
                <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                  <svg
                    className="w-12 h-12 mx-auto mb-4 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <h3 className="font-bold text-lg mb-2">
                    {language === "ar" ? "واتساب" : "WhatsApp"}
                  </h3>
                  <p className="text-gray-700">
                    {content.alternativeContact.whatsapp}
                  </p>
                </div>
              </div>
              
              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
                <p className="text-gray-700 text-center">
                  {content.alternativeContact.note}
                </p>
              </div>
              
              {/* Languages */}
              <div className="mt-8 text-center">
                <h3 className="text-xl font-bold text-primary-dark mb-3">
                  {content.languages.title}
                </h3>
                <p className="text-lg text-gray-700">
                  {content.languages.list}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer language={language} />
    </div>
  );
}
