"use client";

import { motion } from 'framer-motion';
import { ShipmentData } from '@/types/shipment';
import FormContainer from './FormContainer';

interface Step6ReviewProps {
  data: ShipmentData;
  onChange: (field: keyof ShipmentData, value: any) => void;
  pricing: {
    basePrice: number;
    total: number;
    packagingCost: number;
    syriaDeliveryCost: number;
    euTransportCost: number;
    insuranceCost: number;
  };
  language: 'ar' | 'en';
}

export default function Step6Review({ data, onChange, pricing, language }: Step6ReviewProps) {
  const translations = {
    ar: {
      title: 'مراجعة الشحنة',
      description: 'تأكد من صحة جميع البيانات قبل المتابعة',
      direction: 'الاتجاه',
      euToSy: 'من أوروبا إلى سورية',
      syToEu: 'من سورية إلى أوروبا',
      sender: 'المرسل',
      receiver: 'المستلم',
      shipmentType: 'نوع الشحنة',
      commercial: 'تجاري',
      personal: 'شخصي',
      parcels: 'الطرود',
      parcel: 'طرد',
      totalWeight: 'الوزن الإجمالي',
      totalCBM: 'الحجم الإجمالي',
      services: 'الخدمات الإضافية',
      packaging: 'التغليف',
      syriaDelivery: 'التوصيل في سورية',
      euTransport: 'النقل الأوروبي',
      insurance: 'التأمين',
      pricing: 'التسعير',
      basePrice: 'السعر الأساسي',
      totalPrice: 'السعر الإجمالي',
      terms: 'الشروط والأحكام',
      acceptTerms: 'أوافق على',
      termsLink: 'الشروط والأحكام',
      viewContract: '(اقرأ العقد كاملاً)',
      termsDescription: 'بالموافقة، أنت توافق على الشروط والأحكام الخاصة بخدمة الشحن، بما في ذلك سياسة التسعير والتأمين والمسؤولية.',
      whatsapp: 'تواصل معنا عبر واتساب',
      whatsappDesc: 'لأي استفسار أو مساعدة فورية',
    },
    en: {
      title: 'Review Shipment',
      description: 'Verify all details before proceeding',
      direction: 'Direction',
      euToSy: 'Europe to Syria',
      syToEu: 'Syria to Europe',
      sender: 'Sender',
      receiver: 'Receiver',
      shipmentType: 'Shipment Type',
      commercial: 'Commercial',
      personal: 'Personal',
      parcels: 'Parcels',
      parcel: 'Parcel',
      totalWeight: 'Total Weight',
      totalCBM: 'Total CBM',
      services: 'Additional Services',
      packaging: 'Packaging',
      syriaDelivery: 'Syria Delivery',
      euTransport: 'EU Transport',
      insurance: 'Insurance',
      pricing: 'Pricing',
      basePrice: 'Base Price',
      totalPrice: 'Total Price',
      terms: 'Terms & Conditions',
      acceptTerms: 'I accept the',
      termsLink: 'Terms & Conditions',
      viewContract: '(Read full contract)',
      termsDescription: 'By accepting, you agree to the shipping service terms and conditions, including pricing policy, insurance, and liability.',
      whatsapp: 'Contact us on WhatsApp',
      whatsappDesc: 'For any questions or immediate assistance',
    },
  };

  const t = translations[language];

  const totalWeight = (data.parcels || []).reduce((sum, p) => sum + (Number(p.weight) || 0), 0);
  const totalCBM = (data.parcels || []).reduce((sum, p) => sum + (Number(p.cbm) || 0), 0);

  const InfoSection = ({ title, icon, children }: any) => (
    <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-200">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 bg-gradient-to-br from-primary-dark to-blue-700 rounded-full flex items-center justify-center text-white text-2xl shadow-lg">
          {icon}
        </div>
        <h3 className="text-2xl font-black text-primary-dark">{title}</h3>
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );

  const InfoRow = ({ label, value }: any) => (
    <div className="flex justify-between items-center py-3 border-b border-gray-200 last:border-0">
      <span className="text-gray-600 font-medium">{label}:</span>
      <span className="text-gray-900 font-bold">{value}</span>
    </div>
  );

  return (
    <FormContainer>
      <div className="space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0, rotate: 180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="inline-block text-7xl"
          >
            ✅
          </motion.div>
          
          <h2 className="text-5xl font-black text-primary-dark">
            {t.title}
          </h2>
          
          <p className="text-xl text-gray-600 font-medium">
            {t.description}
          </p>
        </div>

        {/* Direction */}
        <InfoSection title={t.direction} icon="🔄">
          <InfoRow
            label={t.direction}
            value={data.direction === 'eu-sy' ? t.euToSy : t.syToEu}
          />
        </InfoSection>

        {/* Sender & Receiver */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InfoSection title={t.sender} icon="📤">
            <InfoRow label="Name" value={data.senderName} />
            <InfoRow label="Email" value={data.senderEmail} />
            <InfoRow label="Phone" value={data.senderPhone} />
            <InfoRow label="ID/Passport" value={data.senderIdPassport} />
            <InfoRow label="Address" value={data.senderAddress} />
          </InfoSection>

          <InfoSection title={t.receiver} icon="📥">
            <InfoRow label="Name" value={data.receiverName} />
            <InfoRow label="Email" value={data.receiverEmail} />
            <InfoRow label="Phone" value={data.receiverPhone} />
            <InfoRow label="ID/Passport" value={data.receiverIdPassport} />
            <InfoRow label="Address" value={data.receiverAddress} />
          </InfoSection>
        </div>

        {/* Parcels */}
        <InfoSection title={`${t.parcels} (${data.parcels?.length || 0})`} icon="📦">
          <InfoRow label={t.totalWeight} value={`${totalWeight.toFixed(2)} kg`} />
          <InfoRow label={t.totalCBM} value={`${totalCBM.toFixed(4)} m³`} />
          <InfoRow
            label={t.shipmentType}
            value={data.shipmentType === 'commercial' ? t.commercial : t.personal}
          />
        </InfoSection>

        {/* Services */}
        {(pricing.packagingCost > 0 || pricing.syriaDeliveryCost > 0 || pricing.euTransportCost > 0 || pricing.insuranceCost > 0) && (
          <InfoSection title={t.services} icon="⚙️">
            {pricing.packagingCost > 0 && (
              <InfoRow label={t.packaging} value={`${pricing.packagingCost.toFixed(2)} €`} />
            )}
            {pricing.syriaDeliveryCost > 0 && (
              <InfoRow label={t.syriaDelivery} value={`${pricing.syriaDeliveryCost.toFixed(2)} €`} />
            )}
            {pricing.euTransportCost > 0 && (
              <InfoRow label={t.euTransport} value={`${pricing.euTransportCost.toFixed(2)} €`} />
            )}
            {pricing.insuranceCost > 0 && (
              <InfoRow label={t.insurance} value={`${pricing.insuranceCost.toFixed(2)} €`} />
            )}
          </InfoSection>
        )}

        {/* Pricing */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-3xl p-8 shadow-2xl"
        >
          <div className="text-center space-y-4">
            <div className="text-3xl font-black">{t.pricing}</div>
            <div className="flex justify-center items-center gap-8">
              <div>
                <div className="text-sm opacity-80">{t.basePrice}</div>
                <div className="text-3xl font-black">{pricing.basePrice.toFixed(2)} €</div>
              </div>
              <div className="text-4xl">→</div>
              <div>
                <div className="text-sm opacity-80">{t.totalPrice}</div>
                <div className="text-5xl font-black">{pricing.total.toFixed(2)} €</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* WhatsApp Button */}
        <motion.a
          href="https://wa.me/31612345678"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="block bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-3xl p-8 shadow-2xl hover:shadow-green-500/50 transition-all"
        >
          <div className="flex items-center justify-center gap-6">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl">
              <svg className="w-12 h-12 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black">{t.whatsapp}</div>
              <div className="text-lg opacity-90">{t.whatsappDesc}</div>
            </div>
          </div>
        </motion.a>

        {/* Terms */}
        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-3xl p-8 shadow-xl border-2 border-gray-300">
          <label className="flex items-start gap-4 cursor-pointer group">
            <input
              type="checkbox"
              checked={data.termsAccepted || false}
              onChange={(e) => onChange('termsAccepted', e.target.checked)}
              className="w-7 h-7 mt-1 rounded-lg border-3 border-gray-400 text-primary-dark focus:ring-4 focus:ring-primary-yellow cursor-pointer transition-all hover:border-primary-dark"
            />
            <div className="flex-1">
              <div className="text-lg font-bold text-gray-900 mb-3">
                {t.acceptTerms}{' '}
                <a
                  href="/documents/shipping-contract-full.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-primary-dark hover:text-blue-700 underline decoration-2 underline-offset-4 transition-colors"
                >
                  {t.termsLink}
                </a>
                {' '}<span className="text-red-500">*</span>
              </div>
              
              <a
                href="/documents/shipping-contract-full.pdf"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 mb-3 transition-colors group/link"
              >
                <span className="text-xl group-hover/link:scale-110 transition-transform">📄</span>
                {t.viewContract}
              </a>

              <p className="text-sm text-gray-600 leading-relaxed">
                {t.termsDescription}
              </p>

              {/* Visual indicator when checked */}
              {data.termsAccepted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 bg-green-100 border-2 border-green-500 rounded-xl p-3 flex items-center gap-3"
                >
                  <span className="text-2xl">✅</span>
                  <span className="text-green-800 font-bold">
                    {language === 'ar' ? 'شكراً! تم قبول الشروط' : 'Thank you! Terms accepted'}
                  </span>
                </motion.div>
              )}
            </div>
          </label>
        </div>
      </div>
    </FormContainer>
  );
}

