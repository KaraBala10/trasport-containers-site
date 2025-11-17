'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Countdown from '@/components/Countdown';
import WhatsAppButton from '@/components/WhatsAppButton';
import PartnerLogos from '@/components/PartnerLogos';
import InteractiveMap from '@/components/InteractiveMap';
import Image from 'next/image';

type Language = 'ar' | 'en';

export default function Home() {
  const [language, setLanguage] = useState<Language>('en');
  const isRTL = language === 'ar';

  // Target date: December 1, 2025
  const targetDate = useMemo(() => new Date('2025-12-01T00:00:00'), []);

  const translations = useMemo(() => ({
    ar: {
      heroTitle: 'MEDO-FREIGHT.EU',
      heroSubtitle: 'Freight · Route · Deliver',
      heroDescription: 'خدمات شحن احترافية عالمية',
      calculatePrice: 'احسب سعرك الآن',
      bookShipment: 'احجز شحنتك',
      monthlyShipping: 'اشترك في الشحن الشهري',
      serviceTitle: 'خدماتنا',
      serviceDescription: 'نقدم خدمات شحن احترافية مع ضمان الجودة والسرعة',
      shippingStages: 'مراحل الشحن',
      stage1: 'التجميع',
      stage2: 'النقل',
      stage3: 'التخزين',
      stage4: 'التوصيل',
      trustTitle: 'الثقة والامتثال',
      fclQuote: 'عرض سعر FCL',
      partnersTitle: 'شركاؤنا',
      videoTitle: 'رحلة الشحنة من أوروبا إلى سورية',
      videoDescription: 'شاهد كيف ننقل شحنتك بأمان وسرعة',
      centersTitle: 'مراكزنا الأوروبية',
      galleryTitle: 'معرض الصور',
    },
    en: {
      heroTitle: 'MEDO-FREIGHT.EU',
      heroSubtitle: 'Freight · Route · Deliver',
      heroDescription: 'Professional Global Freight Services',
      calculatePrice: 'Calculate Your Price Now',
      bookShipment: 'Book Your Shipment',
      monthlyShipping: 'Subscribe to Monthly Shipping',
      serviceTitle: 'Our Services',
      serviceDescription: 'We provide professional shipping services with guaranteed quality and speed',
      shippingStages: 'Shipping Stages',
      stage1: 'Collection',
      stage2: 'Transport',
      stage3: 'Storage',
      stage4: 'Delivery',
      trustTitle: 'Trust & Compliance',
      fclQuote: 'FCL Quote',
      partnersTitle: 'Our Partners',
      videoTitle: 'Shipment Journey from Europe to Syria',
      videoDescription: 'Watch how we transport your shipment safely and quickly',
      centersTitle: 'Our European Centers',
      galleryTitle: 'Photo Gallery',
    },
  }), []);

  const t = translations[language];

  return (
    <div className="min-h-screen flex flex-col">
      <Header language={language} setLanguage={setLanguage} />

      <main className="flex-grow">
        {/* Hero Banner with Countdown */}
        <section className="bg-gradient-to-r from-primary-dark to-primary-dark relative overflow-hidden">
          {/* Background removed for better performance - using CSS gradient only */}
          <div className="container mx-auto px-4 py-20 text-center text-white relative z-10">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">{t.heroTitle}</h1>
            <p className="text-2xl md:text-3xl mb-2 text-primary-yellow">{t.heroSubtitle}</p>
            <p className="text-lg mb-8 opacity-90">{t.heroDescription}</p>
            
            {/* Countdown */}
            <div className="mb-12">
              <p className="text-xl mb-6">{language === 'ar' ? 'العد التنازلي حتى 1 ديسمبر 2025' : 'Countdown to December 1, 2025'}</p>
              <Countdown language={language} targetDate={targetDate} />
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/quote"
                className="bg-primary-yellow text-primary-dark px-8 py-3 rounded-md font-bold text-lg hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl"
              >
                {t.calculatePrice}
              </Link>
              <Link
                href="/book"
                className="bg-white text-primary-dark px-8 py-3 rounded-md font-bold text-lg hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl"
              >
                {t.bookShipment}
              </Link>
              <Link
                href="/subscribe"
                className="border-2 border-white text-white px-8 py-3 rounded-md font-bold text-lg hover:bg-white hover:text-primary-dark transition-all"
              >
                {t.monthlyShipping}
              </Link>
            </div>
          </div>
        </section>

        {/* Service Introduction */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-8 text-primary-dark">{t.serviceTitle}</h2>
            <p className="text-lg text-center text-gray-700 max-w-3xl mx-auto mb-12">
              {t.serviceDescription}
            </p>

            {/* Shipping Stages */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-16 h-16 bg-primary-yellow rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary-dark">1</span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-primary-dark">{t.stage1}</h3>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-16 h-16 bg-primary-yellow rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary-dark">2</span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-primary-dark">{t.stage2}</h3>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-16 h-16 bg-primary-yellow rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary-dark">3</span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-primary-dark">{t.stage3}</h3>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-16 h-16 bg-primary-yellow rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary-dark">4</span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-primary-dark">{t.stage4}</h3>
              </div>
            </div>
          </div>
        </section>

        {/* Video Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-4 text-primary-dark">{t.videoTitle}</h2>
            <p className="text-lg text-center text-gray-600 mb-8">{t.videoDescription}</p>
            <div className="max-w-4xl mx-auto">
              <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden relative">
                {/* Video Placeholder - Replace with actual video */}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-dark to-primary-dark">
                  <div className="text-center text-white">
                    <svg className="w-20 h-20 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                    <p className="text-lg">
                      {language === 'ar' ? 'فيديو تعريفي - سيتم إضافة الفيديو الحقيقي' : 'Intro Video - Real video will be added'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Photo Gallery */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-12 text-primary-dark">{t.galleryTitle}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* European Centers Image */}
              <div className="relative h-64 rounded-lg overflow-hidden shadow-lg bg-gradient-to-br from-gray-200 to-gray-300">
                <Image
                  src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=70"
                  alt={language === 'ar' ? 'مراكز أوروبية' : 'European Centers'}
                  fill
                  quality={70}
                  className="object-cover hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//9k="
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                  <p className="text-white font-bold">
                    {language === 'ar' ? 'مراكز أوروبية' : 'European Centers'}
                  </p>
                </div>
              </div>
              
              {/* Containers Image */}
              <div className="relative h-64 rounded-lg overflow-hidden shadow-lg bg-gradient-to-br from-gray-200 to-gray-300">
                <Image
                  src="https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800&q=70"
                  alt={language === 'ar' ? 'حاويات شحن' : 'Shipping Containers'}
                  fill
                  quality={70}
                  className="object-cover hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//9k="
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                  <p className="text-white font-bold">
                    {language === 'ar' ? 'حاويات شحن' : 'Shipping Containers'}
                  </p>
                </div>
              </div>
              
              {/* Logistics Image */}
              <div className="relative h-64 rounded-lg overflow-hidden shadow-lg bg-gradient-to-br from-gray-200 to-gray-300">
                <Image
                  src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=70"
                  alt={language === 'ar' ? 'خدمات لوجستية' : 'Logistics Services'}
                  fill
                  quality={70}
                  className="object-cover hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//9k="
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                  <p className="text-white font-bold">
                    {language === 'ar' ? 'خدمات لوجستية' : 'Logistics Services'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

              {/* Partner Logos */}
              <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                  <h2 className="text-4xl font-bold text-center mb-12 text-primary-dark">{t.partnersTitle}</h2>
                  <PartnerLogos />
                </div>
              </section>

        {/* Interactive Map */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <InteractiveMap language={language} />
          </div>
        </section>

        {/* Trust & Compliance */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-12 text-primary-dark">{t.trustTitle}</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center justify-items-center">
              <div className="bg-white p-6 rounded-lg text-center min-w-[150px] shadow-md">
                <p className="font-bold text-primary-dark">EX-A</p>
              </div>
              <div className="bg-white p-6 rounded-lg text-center min-w-[150px] shadow-md">
                <p className="font-bold text-primary-dark">Insurance</p>
              </div>
              <div className="bg-white p-6 rounded-lg text-center min-w-[150px] shadow-md">
                <p className="font-bold text-primary-dark">FENEX</p>
              </div>
              <div className="bg-white p-6 rounded-lg text-center min-w-[150px] shadow-md">
                <p className="font-bold text-primary-dark">GDPR</p>
              </div>
              <div className="bg-white p-6 rounded-lg text-center min-w-[150px] shadow-md">
                <p className="font-bold text-primary-dark">Legal Compliance</p>
              </div>
            </div>
          </div>
        </section>

        {/* FCL Quote CTA */}
        <section className="py-16 bg-primary-dark text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">{t.fclQuote}</h2>
            <p className="text-lg mb-8 opacity-90">
              {language === 'ar' 
                ? 'احصل على عرض سعر فوري لشحنتك' 
                : 'Get an instant quote for your shipment'}
            </p>
            <Link
              href="/quote"
              className="bg-primary-yellow text-primary-dark px-8 py-3 rounded-md font-bold text-lg hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl inline-block"
            >
              {t.fclQuote}
            </Link>
          </div>
        </section>
      </main>

      <Footer language={language} />
      
      {/* WhatsApp Floating Button */}
      <WhatsAppButton language={language} />
    </div>
  );
} 
