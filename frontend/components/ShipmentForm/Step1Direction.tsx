"use client";

import { ShipmentDirection } from '@/types/shipment';
import DirectionCard from './DirectionCard';

interface Step1DirectionProps {
  selectedDirection: ShipmentDirection | null;
  onDirectionChange: (direction: ShipmentDirection) => void;
  language: 'ar' | 'en';
}

export default function Step1Direction({
  selectedDirection,
  onDirectionChange,
  language,
}: Step1DirectionProps) {
  const translations = {
    ar: {
      title: 'اختر اتجاه الشحنة',
      description: 'حدد مسار الشحن المناسب لك',
      euToSy: {
        title: 'من أوروبا إلى سورية',
        subtitle: 'شحن موثوق من قلب أوروبا',
        features: [
          'تجميع الطرود من جميع دول أوروبا → Axel (هولندا)',
          'شحن شهري مضمون إلى سورية',
          'تخليص جمركي شامل ومضمون 100%',
          'تسليم سريع في حلب + توزيع لجميع المحافظات',
        ],
      },
      syToEu: {
        title: 'من سورية إلى أوروبا',
        subtitle: 'شحن سريع وآمن إلى أوروبا',
        features: [
          'تجميع من جميع المحافظات → مركز حلب',
          'شحن مباشر إلى Axel (هولندا) ثم توزيع أوروبي',
          'تخليص جمركي شامل ومضمون 100%',
          'دفع مرن: كاش أو حوالة محلية',
          'معالجة سريعة وخدمة متميزة',
        ],
      },
    },
    en: {
      title: 'Choose Your Shipment Direction',
      description: 'Select the route that suits you best',
      euToSy: {
        title: 'From Europe to Syria',
        subtitle: 'Reliable shipping from the heart of Europe',
        features: [
          'Collection from all European countries → Axel (Netherlands)',
          'Guaranteed monthly shipping to Syria',
          'Full customs clearance 100% included',
          'Fast delivery to Aleppo + distribution to all governorates',
        ],
      },
      syToEu: {
        title: 'From Syria to Europe',
        subtitle: 'Fast and secure shipping to Europe',
        features: [
          'Collection from all governorates → Aleppo center',
          'Direct shipping to Axel (Netherlands) then European distribution',
          'Full customs clearance 100% included',
          'Flexible payment: Cash or local transfer',
          'Fast processing and excellent service',
        ],
      },
    },
  };

  const t = translations[language];

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-block">
          <div className="bg-gradient-to-r from-primary-dark to-blue-900 text-white px-8 py-3 rounded-full shadow-lg">
            <span className="text-sm font-bold uppercase tracking-wider">
              {language === 'ar' ? 'الخطوة 1 من 7' : 'Step 1 of 7'}
            </span>
          </div>
        </div>
        
        <h2 className="text-5xl md:text-6xl font-black text-primary-dark">
          <span className="inline-block animate-bounce">🔄</span> {t.title}
        </h2>
        
        <p className="text-xl text-gray-600 font-medium max-w-2xl mx-auto">
          {t.description}
        </p>
      </div>

      {/* Direction Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        <DirectionCard
          direction="eu-sy"
          icon="🇪🇺 ✈️ 🇸🇾"
          title={t.euToSy.title}
          subtitle={t.euToSy.subtitle}
          features={t.euToSy.features}
          isSelected={selectedDirection === 'eu-sy'}
          onClick={() => onDirectionChange('eu-sy')}
          language={language}
        />

        <DirectionCard
          direction="sy-eu"
          icon="🇸🇾 ✈️ 🇪🇺"
          title={t.syToEu.title}
          subtitle={t.syToEu.subtitle}
          features={t.syToEu.features}
          isSelected={selectedDirection === 'sy-eu'}
          onClick={() => onDirectionChange('sy-eu')}
          language={language}
        />
      </div>

      {/* Info Banner */}
      {selectedDirection && (
        <div className="max-w-4xl mx-auto animate-fadeIn">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl">
                ✓
              </div>
              <div>
                <p className="text-lg font-bold text-green-900">
                  {language === 'ar' ? 'تم الاختيار بنجاح!' : 'Selected Successfully!'}
                </p>
                <p className="text-green-700">
                  {language === 'ar' 
                    ? 'اضغط "متابعة" للانتقال إلى الخطوة التالية'
                    : 'Click "Continue" to proceed to the next step'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
