'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/hooks/useLanguage';

export default function ContractsPage() {
  const { language, isRTL } = useLanguage();

  const translations = {
    ar: {
      title: 'العقود والمستندات',
      description: 'جميع العقود والنماذج والملاحق متاحة للتحميل',
      subtitle: 'تحميل المستندات الرسمية',
      contract: {
        title: 'العقد الكامل',
        description: 'عقد الشحن الدولي الكامل مع جميع الملاحق (أ-ح)',
        size: '~1.5 ميجابايت',
        button: 'تحميل العقد',
      },
      annexes: {
        title: 'الملاحق',
        description: 'الملاحق الرسمية من (أ) إلى (ح) - المواد المحظورة، الأسعار، والتخليص',
        size: '~0.8 ميجابايت',
        button: 'تحميل الملاحق',
      },
      form: {
        title: 'نموذج طلب الشحن',
        description: 'نموذج تفاعلي لطلب خدمات الشحن مع جميع البيانات المطلوبة',
        size: '~0.5 ميجابايت',
        button: 'تحميل النموذج',
      },
      warning: '⚠️ يُرجى قراءة جميع المستندات بعناية قبل التوقيع',
      note: 'جميع المستندات متوفرة بصيغة PDF ويمكن طباعتها',
    },
    en: {
      title: 'Contracts & Documents',
      description: 'All contracts, forms and annexes available for download',
      subtitle: 'Download Official Documents',
      contract: {
        title: 'Full Contract',
        description: 'Complete international shipping contract with all annexes (A-H)',
        size: '~1.5 MB',
        button: 'Download Contract',
      },
      annexes: {
        title: 'Annexes',
        description: 'Official annexes from (A) to (H) - Prohibited goods, prices, and clearance',
        size: '~0.8 MB',
        button: 'Download Annexes',
      },
      form: {
        title: 'Shipping Request Form',
        description: 'Interactive form for shipping services with all required data',
        size: '~0.5 MB',
        button: 'Download Form',
      },
      warning: '⚠️ Please read all documents carefully before signing',
      note: 'All documents are available in PDF format and can be printed',
    },
  };

  const t = translations[language];

  const handleDownloadContract = () => {
    window.open('/documents/shipping-contract-full.pdf', '_blank');
  };

  const handleDownloadAnnexes = () => {
    window.open('/documents/shipping-annexes.pdf', '_blank');
  };

  const handleDownloadForm = () => {
    window.open('/documents/shipping-request-form.pdf', '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
      <Header />
      
      <main className="flex-grow" role="main">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary-dark to-blue-900 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <svg className="w-20 h-20 mx-auto mb-6 text-primary-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t.title}</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">{t.description}</p>
          </div>
        </div>

        {/* Download Cards Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-primary-dark mb-12">
              {t.subtitle}
            </h2>

            {/* Cards Grid */}
            <div className="grid md:grid-cols-3 gap-8">
              {/* Contract Card */}
              <div className="bg-white rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 border-t-4 border-primary-yellow">
                <div className="p-8">
                  <div className="w-20 h-20 bg-primary-yellow rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-primary-dark text-center mb-3">
                    {t.contract.title}
                  </h3>
                  <p className="text-gray-600 text-center mb-6 leading-relaxed">
                    {t.contract.description}
                  </p>
                  <div className="text-center mb-6">
                    <span className="inline-block bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm font-medium">
                      📄 PDF • {t.contract.size}
                    </span>
                  </div>
                  <button
                    onClick={handleDownloadContract}
                    className="w-full bg-primary-dark text-white px-6 py-4 rounded-lg font-bold text-lg hover:bg-opacity-90 transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {t.contract.button}
                  </button>
                </div>
              </div>

              {/* Annexes Card */}
              <div className="bg-white rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 border-t-4 border-primary-dark">
                <div className="p-8">
                  <div className="w-20 h-20 bg-primary-dark rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-primary-dark text-center mb-3">
                    {t.annexes.title}
                  </h3>
                  <p className="text-gray-600 text-center mb-6 leading-relaxed">
                    {t.annexes.description}
                  </p>
                  <div className="text-center mb-6">
                    <span className="inline-block bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm font-medium">
                      📎 PDF • {t.annexes.size}
                    </span>
                  </div>
                  <button
                    onClick={handleDownloadAnnexes}
                    className="w-full bg-primary-dark text-white px-6 py-4 rounded-lg font-bold text-lg hover:bg-opacity-90 transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {t.annexes.button}
                  </button>
                </div>
              </div>

              {/* Form Card */}
              <div className="bg-white rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 border-t-4 border-primary-yellow">
                <div className="p-8">
                  <div className="w-20 h-20 bg-primary-yellow rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-primary-dark text-center mb-3">
                    {t.form.title}
                  </h3>
                  <p className="text-gray-600 text-center mb-6 leading-relaxed">
                    {t.form.description}
                  </p>
                  <div className="text-center mb-6">
                    <span className="inline-block bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm font-medium">
                      📝 PDF • {t.form.size}
                    </span>
                  </div>
                  <button
                    onClick={handleDownloadForm}
                    className="w-full bg-primary-dark text-white px-6 py-4 rounded-lg font-bold text-lg hover:bg-opacity-90 transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {t.form.button}
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

      <Footer language={language} />
    </div>
  );
}

