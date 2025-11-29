"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/hooks/useLanguage";

export default function ContractsPage() {
  const { language, isRTL } = useLanguage();

  const translations = {
    ar: {
      title: "العقود والمستندات",
      description: "جميع العقود والنماذج والملاحق متاحة للتحميل",
      subtitle: "تحميل المستندات الرسمية",
      lclContract: {
        title: "عقد الشحن LCL",
        description: "عقد الشحن الدولي لـ LCL (Less than Container Load) مع جميع الشروط والأحكام",
        size: "PDF",
        button: "تحميل عقد LCL",
      },
      fclContract: {
        title: "عقد الشحن FCL",
        description: "عقد الشحن الدولي لـ FCL (Full Container Load) مع جميع الشروط والأحكام",
        size: "PDF",
        button: "تحميل عقد FCL",
      },
      warning: "⚠️ يُرجى قراءة جميع المستندات بعناية قبل التوقيع",
      note: "جميع المستندات متوفرة بصيغة PDF ويمكن طباعتها",
    },
    en: {
      title: "Contracts & Documents",
      description: "All contracts, forms and annexes available for download",
      subtitle: "Download Official Documents",
      lclContract: {
        title: "LCL Shipping Agreement",
        description: "International shipping agreement for LCL (Less than Container Load) with all terms and conditions",
        size: "PDF",
        button: "Download LCL Agreement",
      },
      fclContract: {
        title: "FCL Shipping Agreement",
        description: "International shipping agreement for FCL (Full Container Load) with all terms and conditions",
        size: "PDF",
        button: "Download FCL Agreement",
      },
      warning: "⚠️ Please read all documents carefully before signing",
      note: "All documents are available in PDF format and can be printed",
    },
  };

  const t = translations[language];

  const handleDownloadLCL = () => {
    window.open(`/documents/${encodeURIComponent("LCL Shipping Agreement - Medo-Freight EU.pdf")}`, "_blank");
  };

  const handleDownloadFCL = () => {
    window.open(`/documents/${encodeURIComponent("FCL Shipping Agreement - Medo-Freight EU.pdf")}`, "_blank");
  };

  return (
    <div className="min-h-screen flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
      <Header />

      <main className="flex-grow" role="main">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary-dark to-blue-900 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <svg
              className="w-20 h-20 mx-auto mb-6 text-primary-yellow"
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t.title}</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              {t.description}
            </p>
          </div>
        </div>

        {/* Download Cards Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-primary-dark mb-12">
              {t.subtitle}
            </h2>

            {/* Cards Grid */}
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* LCL Contract Card */}
              <div className="bg-white rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 border-t-4 border-primary-yellow">
                <div className="p-8">
                  <div className="w-20 h-20 bg-primary-yellow rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                      className="w-10 h-10 text-primary-dark"
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
                  </div>
                  <h3 className="text-2xl font-bold text-primary-dark text-center mb-3">
                    {t.lclContract.title}
                  </h3>
                  <p className="text-gray-600 text-center mb-6 leading-relaxed">
                    {t.lclContract.description}
                  </p>
                  <div className="text-center mb-6">
                    <span className="inline-block bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm font-medium">
                      📄 PDF • {t.lclContract.size}
                    </span>
                  </div>
                  <button
                    onClick={handleDownloadLCL}
                    className="w-full bg-primary-dark text-white px-6 py-4 rounded-lg font-bold text-lg hover:bg-opacity-90 transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                  >
                    <svg
                      className="w-6 h-6"
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
                    {t.lclContract.button}
                  </button>
                </div>
              </div>

              {/* FCL Contract Card */}
              <div className="bg-white rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 border-t-4 border-primary-dark">
                <div className="p-8">
                  <div className="w-20 h-20 bg-primary-dark rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                      className="w-10 h-10 text-white"
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
                  </div>
                  <h3 className="text-2xl font-bold text-primary-dark text-center mb-3">
                    {t.fclContract.title}
                  </h3>
                  <p className="text-gray-600 text-center mb-6 leading-relaxed">
                    {t.fclContract.description}
                  </p>
                  <div className="text-center mb-6">
                    <span className="inline-block bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm font-medium">
                      📄 PDF • {t.fclContract.size}
                    </span>
                  </div>
                  <button
                    onClick={handleDownloadFCL}
                    className="w-full bg-primary-dark text-white px-6 py-4 rounded-lg font-bold text-lg hover:bg-opacity-90 transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                  >
                    <svg
                      className="w-6 h-6"
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
                    {t.fclContract.button}
                  </button>
                </div>
              </div>
            </div>

            {/* Warning & Note */}
            <div className="mt-12 space-y-4">
              <div className="bg-yellow-50 border-r-4 border-yellow-500 p-6 rounded-lg shadow-md">
                <p className="text-yellow-800 text-center font-medium text-lg">
                  {t.warning}
                </p>
              </div>
              <div className="bg-blue-50 border-r-4 border-blue-500 p-6 rounded-lg shadow-md">
                <p className="text-blue-800 text-center font-medium">
                  {t.note}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
