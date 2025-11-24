"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShippingDirection, ShipmentType, PersonInfo, Parcel } from '@/types/shipment';
import { PricingResult } from '@/types/pricing';
import Link from 'next/link';

interface Step10ReviewProps {
  direction: ShippingDirection;
  shipmentTypes: ShipmentType[];
  sender: PersonInfo | null;
  receiver: PersonInfo | null;
  parcels: Parcel[];
  pricing: PricingResult | null;
  acceptedTerms: boolean;
  acceptedPolicies: boolean;
  onAcceptedTermsChange: (accepted: boolean) => void;
  onAcceptedPoliciesChange: (accepted: boolean) => void;
  onCreateShipment: () => void;
  language: 'ar' | 'en';
}

export default function Step10Review({
  direction,
  shipmentTypes,
  sender,
  receiver,
  parcels,
  pricing,
  acceptedTerms,
  acceptedPolicies,
  onAcceptedTermsChange,
  onAcceptedPoliciesChange,
  onCreateShipment,
  language,
}: Step10ReviewProps) {
  const translations = {
    ar: {
      title: 'مراجعة وتأكيد الشحنة',
      shipmentSummary: 'ملخص الشحنة',
      direction: 'الاتجاه',
      shipmentTypes: 'أنواع الشحنة',
      senderInfo: 'معلومات المرسل',
      receiverInfo: 'معلومات المستلم',
      parcelsCount: 'عدد الطرود',
      totalWeight: 'الوزن الإجمالي',
      totalCBM: 'الحجم الإجمالي (CBM)',
      pricingSummary: 'ملخص التسعير',
      operationalPolicies: 'السياسات التشغيلية',
      policyRejection: 'سياسة رفض الشحنات',
      policyRejectionDesc: 'إذا رفض العميل دفع السعر النهائي بعد القياس: إرجاع الشحنة على حسابه، أو تخزين 30 يوم ثم التخلص منها، أو بيع المحتوى لتغطية التكاليف',
      policyStorage: 'سياسة التخزين',
      policyStorageDesc: '3 أيام مجانية، 1€ لكل طرد يومياً بعد ذلك، بعد 30 يوم → شحنة مهملة',
      policyKYC: 'سياسة الهوية – EU KYC Light',
      policyKYCDesc: 'مسموح: رقم هوية/جواز فقط – بدون تحميل صورة. مسموح: صور الطرود إلزامية. ممنوع: أي صورة وثائق رسمية. حذف البيانات بعد 6 أشهر كحد أقصى.',
      policyLiability: 'سياسة المسؤولية',
      policyLiabilityDesc: 'بدون تأمين → لا تعويض. التأمين يغطي القيمة المصرّح بها فقط. لا تعويض عن: التأخير، الجمارك، الطقس، الحرب، تلف التغليف الخارجي',
      policyLargeItems: 'سياسة القطع الكبيرة',
      policyLargeItemsDesc: 'السعر في الموقع تقديري. السعر النهائي بعد الوزن الحقيقي. يجوز فرض تغليف إجباري. لا تسليم قبل دفع الفاتورة المعدلة',
      termsAndConditions: 'الشروط والأحكام',
      acceptTerms: 'أوافق على الشروط والأحكام',
      acceptPolicies: 'أوافق على السياسات التشغيلية',
      readTerms: 'قراءة الشروط',
      readPolicies: 'قراءة السياسات',
      createShipment: 'إنشاء الشحنة',
      creating: 'جاري الإنشاء...',
      euToSy: 'من أوروبا إلى سورية',
      syToEu: 'من سورية إلى أوروبا',
      parcelLCL: 'طرود LCL',
      electronics: 'إلكترونيات',
      largeItems: 'قطع كبيرة',
      businessLCL: 'شحن تجاري LCL',
    },
    en: {
      title: 'Review & Confirm Shipment',
      shipmentSummary: 'Shipment Summary',
      direction: 'Direction',
      shipmentTypes: 'Shipment Types',
      senderInfo: 'Sender Information',
      receiverInfo: 'Receiver Information',
      parcelsCount: 'Number of Parcels',
      totalWeight: 'Total Weight',
      totalCBM: 'Total Volume (CBM)',
      pricingSummary: 'Pricing Summary',
      operationalPolicies: 'Operational Policies',
      policyRejection: 'Shipment Rejection Policy',
      policyRejectionDesc: 'If customer refuses to pay final price after measurement: return shipment at customer expense, or store for 30 days then dispose, or sell contents to cover costs',
      policyStorage: 'Storage Policy',
      policyStorageDesc: '3 days free, 1€ per parcel daily after that, after 30 days → abandoned shipment',
      policyKYC: 'Identity Policy – EU KYC Light',
      policyKYCDesc: 'Allowed: ID/Passport number only – no photo upload. Allowed: Parcel photos mandatory. Prohibited: Any official document photos. Data deletion after 6 months maximum.',
      policyLiability: 'Liability Policy',
      policyLiabilityDesc: 'Without insurance → no compensation. Insurance covers declared value only. No compensation for: delays, customs, weather, war, external packaging damage',
      policyLargeItems: 'Large Items Policy',
      policyLargeItemsDesc: 'Website price is approximate. Final price after actual weight. Mandatory packaging may be imposed. No delivery before paying adjusted invoice',
      termsAndConditions: 'Terms and Conditions',
      acceptTerms: 'I agree to the Terms and Conditions',
      acceptPolicies: 'I agree to the Operational Policies',
      readTerms: 'Read Terms',
      readPolicies: 'Read Policies',
      createShipment: 'Create Shipment',
      creating: 'Creating...',
      euToSy: 'Europe to Syria',
      syToEu: 'Syria to Europe',
      parcelLCL: 'Parcel LCL',
      electronics: 'Electronics',
      largeItems: 'Large Items',
      businessLCL: 'Business LCL',
    },
  };

  const t = translations[language];
  const isEUtoSY = direction === 'eu-sy';

  const totalWeight = parcels.reduce((sum, p) => sum + (p.weight || 0), 0);
  const totalCBM = parcels.reduce((sum, p) => sum + (p.cbm || 0), 0);

  return (
    <div className="space-y-8">
      {/* Shipment Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100"
      >
        <h3 className="text-xl font-bold text-primary-dark mb-4">{t.shipmentSummary}</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-semibold text-gray-700">{t.direction}:</span>
              <p className="text-gray-900 font-bold">{isEUtoSY ? t.euToSy : t.syToEu}</p>
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-700">{t.parcelsCount}:</span>
              <p className="text-gray-900 font-bold">{parcels.length}</p>
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-700">{t.totalWeight}:</span>
              <p className="text-gray-900 font-bold">{totalWeight.toFixed(2)} kg</p>
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-700">{t.totalCBM}:</span>
              <p className="text-gray-900 font-bold">{totalCBM.toFixed(4)} m³</p>
            </div>
          </div>

          {sender && (
            <div className="pt-4 border-t border-gray-200">
              <span className="text-sm font-semibold text-gray-700">{t.senderInfo}:</span>
              <p className="text-gray-900">{sender.fullName}</p>
              <p className="text-gray-600 text-sm">{sender.city}, {sender.country || sender.province}</p>
            </div>
          )}

          {receiver && (
            <div className="pt-4 border-t border-gray-200">
              <span className="text-sm font-semibold text-gray-700">{t.receiverInfo}:</span>
              <p className="text-gray-900">{receiver.fullName}</p>
              <p className="text-gray-600 text-sm">{receiver.city}, {receiver.country || receiver.province}</p>
            </div>
          )}

          {pricing && (
            <div className="pt-4 border-t border-gray-200">
              <span className="text-sm font-semibold text-gray-700">{t.pricingSummary}:</span>
              <p className="text-2xl font-bold text-primary-dark mt-2">
                {pricing.grandTotal.toFixed(2)} €
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Operational Policies */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100"
      >
        <h3 className="text-xl font-bold text-primary-dark mb-4">{t.operationalPolicies}</h3>
        
        <div className="space-y-4">
          {/* Policy 1: Rejection */}
          <div className="bg-red-50 rounded-xl p-4 border-2 border-red-200">
            <h4 className="font-bold text-red-900 mb-2">{t.policyRejection}</h4>
            <p className="text-sm text-red-800">{t.policyRejectionDesc}</p>
          </div>

          {/* Policy 2: Storage */}
          <div className="bg-orange-50 rounded-xl p-4 border-2 border-orange-200">
            <h4 className="font-bold text-orange-900 mb-2">{t.policyStorage}</h4>
            <p className="text-sm text-orange-800">{t.policyStorageDesc}</p>
          </div>

          {/* Policy 3: KYC */}
          <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
            <h4 className="font-bold text-blue-900 mb-2">{t.policyKYC}</h4>
            <p className="text-sm text-blue-800">{t.policyKYCDesc}</p>
          </div>

          {/* Policy 4: Liability */}
          <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
            <h4 className="font-bold text-purple-900 mb-2">{t.policyLiability}</h4>
            <p className="text-sm text-purple-800">{t.policyLiabilityDesc}</p>
          </div>

          {/* Policy 5: Large Items */}
          <div className="bg-yellow-50 rounded-xl p-4 border-2 border-yellow-200">
            <h4 className="font-bold text-yellow-900 mb-2">{t.policyLargeItems}</h4>
            <p className="text-sm text-yellow-800">{t.policyLargeItemsDesc}</p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={acceptedPolicies}
              onChange={(e) => onAcceptedPoliciesChange(e.target.checked)}
              className="w-5 h-5 mt-1 text-primary-yellow rounded focus:ring-primary-yellow"
              required
            />
            <div className="flex-1">
              <label className="text-sm font-semibold text-gray-800">
                {t.acceptPolicies} *
              </label>
              <Link 
                href="/documents/shipping-contract-full.pdf" 
                target="_blank"
                className="text-primary-dark hover:text-primary-yellow text-sm underline ml-2"
              >
                {t.readPolicies}
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Terms and Conditions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100"
      >
        <h3 className="text-xl font-bold text-primary-dark mb-4">{t.termsAndConditions}</h3>
        
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => onAcceptedTermsChange(e.target.checked)}
            className="w-5 h-5 mt-1 text-primary-yellow rounded focus:ring-primary-yellow"
            required
          />
          <div className="flex-1">
            <label className="text-sm font-semibold text-gray-800">
              {t.acceptTerms} *
            </label>
            <Link 
              href="/documents/shipping-contract-full.pdf" 
              target="_blank"
              className="text-primary-dark hover:text-primary-yellow text-sm underline ml-2"
            >
              {t.readTerms}
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Create Shipment Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex justify-center"
      >
        <motion.button
          onClick={onCreateShipment}
          disabled={!acceptedTerms || !acceptedPolicies}
          className={`relative px-20 py-5 font-bold text-xl rounded-3xl shadow-2xl transition-all duration-500 overflow-hidden group ${
            acceptedTerms && acceptedPolicies
              ? 'bg-gradient-to-r from-primary-yellow to-primary-yellow/90 text-primary-dark hover:shadow-primary-yellow/50'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          whileHover={acceptedTerms && acceptedPolicies ? { scale: 1.08, y: -2 } : {}}
          whileTap={acceptedTerms && acceptedPolicies ? { scale: 0.96 } : {}}
        >
          <span className="relative z-10 flex items-center gap-3">
            {t.createShipment}
            <motion.svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              initial={{ x: 0 }}
              whileHover={acceptedTerms && acceptedPolicies ? { x: language === 'ar' ? -5 : 5 } : {}}
              transition={{ duration: 0.3 }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </motion.svg>
          </span>
        </motion.button>
      </motion.div>
    </div>
  );
}

