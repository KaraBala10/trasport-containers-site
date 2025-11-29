"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShippingDirection, PersonInfo } from '@/types/shipment';

interface Step3SenderReceiverProps {
  direction: ShippingDirection;
  sender: PersonInfo | null;
  receiver: PersonInfo | null;
  onSenderChange: (sender: PersonInfo) => void;
  onReceiverChange: (receiver: PersonInfo) => void;
  language: 'ar' | 'en';
}

// European countries - Complete list
const europeanCountries = [
  { code: 'AT', name: 'Austria', nameAr: 'النمسا' },
  { code: 'BE', name: 'Belgium', nameAr: 'بلجيكا' },
  { code: 'BG', name: 'Bulgaria', nameAr: 'بلغاريا' },
  { code: 'HR', name: 'Croatia', nameAr: 'كرواتيا' },
  { code: 'CY', name: 'Cyprus', nameAr: 'قبرص' },
  { code: 'CZ', name: 'Czech Republic', nameAr: 'جمهورية التشيك' },
  { code: 'DK', name: 'Denmark', nameAr: 'الدنمارك' },
  { code: 'EE', name: 'Estonia', nameAr: 'إستونيا' },
  { code: 'FI', name: 'Finland', nameAr: 'فنلندا' },
  { code: 'FR', name: 'France', nameAr: 'فرنسا' },
  { code: 'DE', name: 'Germany', nameAr: 'ألمانيا' },
  { code: 'GR', name: 'Greece', nameAr: 'اليونان' },
  { code: 'HU', name: 'Hungary', nameAr: 'هنغاريا' },
  { code: 'IE', name: 'Ireland', nameAr: 'أيرلندا' },
  { code: 'IT', name: 'Italy', nameAr: 'إيطاليا' },
  { code: 'LV', name: 'Latvia', nameAr: 'لاتفيا' },
  { code: 'LT', name: 'Lithuania', nameAr: 'ليتوانيا' },
  { code: 'LU', name: 'Luxembourg', nameAr: 'لوكسمبورغ' },
  { code: 'MT', name: 'Malta', nameAr: 'مالطا' },
  { code: 'NL', name: 'Netherlands', nameAr: 'هولندا' },
  { code: 'NO', name: 'Norway', nameAr: 'النرويج' },
  { code: 'PL', name: 'Poland', nameAr: 'بولندا' },
  { code: 'PT', name: 'Portugal', nameAr: 'البرتغال' },
  { code: 'RO', name: 'Romania', nameAr: 'رومانيا' },
  { code: 'SK', name: 'Slovakia', nameAr: 'سلوفاكيا' },
  { code: 'SI', name: 'Slovenia', nameAr: 'سلوفينيا' },
  { code: 'ES', name: 'Spain', nameAr: 'إسبانيا' },
  { code: 'SE', name: 'Sweden', nameAr: 'السويد' },
  { code: 'CH', name: 'Switzerland', nameAr: 'سويسرا' },
  { code: 'GB', name: 'United Kingdom', nameAr: 'المملكة المتحدة' },
];

// Syrian provinces - Complete list (all 14 governorates)
const syrianProvinces = [
  { code: 'ALEPPO', name: 'Aleppo', nameAr: 'حلب' },
  { code: 'DAMASCUS', name: 'Damascus', nameAr: 'دمشق' },
  { code: 'RIF_DIMASHQ', name: 'Rif Dimashq', nameAr: 'ريف دمشق' },
  { code: 'LATAKIA', name: 'Latakia', nameAr: 'اللاذقية' },
  { code: 'TARTOUS', name: 'Tartous', nameAr: 'طرطوس' },
  { code: 'HOMS', name: 'Homs', nameAr: 'حمص' },
  { code: 'HAMA', name: 'Hama', nameAr: 'حماة' },
  { code: 'IDLIB', name: 'Idlib', nameAr: 'إدلب' },
  { code: 'SUWEIDA', name: 'Suweida', nameAr: 'السويداء' },
  { code: 'DER_EZZOR', name: 'Deir ez-Zor', nameAr: 'دير الزور' },
  { code: 'HASAKA', name: 'Hasaka', nameAr: 'الحسكة' },
  { code: 'RAQQA', name: 'Raqqa', nameAr: 'الرقة' },
  { code: 'DARA', name: 'Daraa', nameAr: 'درعا' },
  { code: 'QUNEITRA', name: 'Quneitra', nameAr: 'القنيطرة' },
];

export default function Step3SenderReceiver({
  direction,
  sender,
  receiver,
  onSenderChange,
  onReceiverChange,
  language,
}: Step3SenderReceiverProps) {
  const translations = {
    ar: {
      senderInfo: 'معلومات المرسل',
      receiverInfo: 'معلومات المستلم',
      fullName: 'الاسم الكامل',
      phone: 'رقم الهاتف / واتساب',
      email: 'البريد الإلكتروني',
      street: 'اسم الشارع',
      streetNumber: 'رقم المنزل',
      city: 'المدينة',
      postalCode: 'الرمز البريدي',
      country: 'الدولة',
      province: 'المحافظة',
      idNumber: 'رقم الهوية / الجواز',
      required: 'مطلوب',
      inEurope: 'في أوروبا',
      inSyria: 'في سورية',
    },
    en: {
      senderInfo: 'Sender Information',
      receiverInfo: 'Receiver Information',
      fullName: 'Full Name',
      phone: 'Phone / WhatsApp',
      email: 'Email',
      street: 'Street Name',
      streetNumber: 'House Number',
      city: 'City',
      postalCode: 'Postal Code',
      country: 'Country',
      province: 'Province',
      idNumber: 'ID / Passport Number',
      required: 'Required',
      inEurope: 'in Europe',
      inSyria: 'in Syria',
    },
  };

  const t = translations[language];
  const isEUtoSY = direction === 'eu-sy';

  // Initialize sender and receiver if null
  const senderData: PersonInfo = sender || {
    fullName: '',
    phone: '',
    email: '',
    street: '',
    streetNumber: '',
    city: '',
    postalCode: '',
    country: isEUtoSY ? '' : undefined,
    province: isEUtoSY ? undefined : '',
    idNumber: '',
  };

  const receiverData: PersonInfo = receiver || {
    fullName: '',
    phone: '',
    email: '',
    street: '',
    streetNumber: '',
    city: '',
    postalCode: '',
    country: isEUtoSY ? undefined : '',
    province: isEUtoSY ? '' : undefined,
    idNumber: '',
  };

  const updateSender = (field: keyof PersonInfo, value: any) => {
    onSenderChange({
      ...senderData,
      [field]: value,
    });
  };

  const updateReceiver = (field: keyof PersonInfo, value: any) => {
    onReceiverChange({
      ...receiverData,
      [field]: value,
    });
  };

  return (
    <div className="space-y-8">
      {/* Sender Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100"
      >
        <h3 className="text-xl font-bold text-primary-dark mb-6 flex items-center gap-2">
          <span className="w-10 h-10 bg-primary-yellow rounded-full flex items-center justify-center text-primary-dark font-bold">
            1
          </span>
          {t.senderInfo} {isEUtoSY ? `(${t.inEurope})` : `(${t.inSyria})`}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Full Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.fullName} *
            </label>
            <input
              type="text"
              value={senderData.fullName}
              onChange={(e) => updateSender('fullName', e.target.value)}
              placeholder={language === "ar" ? "مثال: محمد أحمد" : "e.g., John Doe"}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.phone} *
            </label>
            <input
              type="tel"
              value={senderData.phone}
              onChange={(e) => updateSender('phone', e.target.value)}
              placeholder={language === "ar" ? "مثال: +31612345678" : "e.g., +31612345678"}
              pattern="[+]?[0-9\s\-()]+"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.email} *
            </label>
            <input
              type="email"
              value={senderData.email}
              onChange={(e) => updateSender('email', e.target.value)}
              placeholder={language === "ar" ? "مثال: example@email.com" : "e.g., example@email.com"}
              pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
              required
            />
          </div>

          {/* Street */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.street} *
            </label>
            <input
              type="text"
              value={senderData.street}
              onChange={(e) => updateSender('street', e.target.value)}
              placeholder={language === "ar" ? "مثال: شارع السلام" : "e.g., Main Street"}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
              required
            />
          </div>

          {/* Street Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.streetNumber} *
            </label>
            <input
              type="text"
              value={senderData.streetNumber}
              onChange={(e) => updateSender('streetNumber', e.target.value)}
              placeholder={language === "ar" ? "مثال: 123" : "e.g., 123"}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
              required
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.city} *
            </label>
            <input
              type="text"
              value={senderData.city}
              onChange={(e) => updateSender('city', e.target.value)}
              placeholder={language === "ar" ? "مثال: أمستردام" : "e.g., Amsterdam"}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
              required
            />
          </div>

          {/* Postal Code */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.postalCode} *
            </label>
            <input
              type="text"
              value={senderData.postalCode}
              onChange={(e) => updateSender('postalCode', e.target.value)}
              placeholder={language === "ar" ? "مثال: 1012AB" : "e.g., 1012AB"}
              pattern="[A-Za-z0-9\s-]+"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
              required
            />
          </div>

          {/* Country (for EU) */}
          {isEUtoSY && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.country} *
              </label>
              <select
                value={senderData.country || ''}
                onChange={(e) => updateSender('country', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow bg-white"
                required
              >
                <option value="">{language === 'ar' ? 'اختر...' : 'Select...'}</option>
                {europeanCountries.map(country => (
                  <option key={country.code} value={country.code}>
                    {language === 'ar' ? country.nameAr : country.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Province (for Syria) */}
          {!isEUtoSY && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.province} *
              </label>
              <select
                value={senderData.province || ''}
                onChange={(e) => updateSender('province', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow bg-white"
                required
              >
                <option value="">{language === 'ar' ? 'اختر...' : 'Select...'}</option>
                {syrianProvinces.map(province => (
                  <option key={province.code} value={province.code}>
                    {language === 'ar' ? province.nameAr : province.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* ID Number */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.idNumber} {isEUtoSY ? '' : '*'}
            </label>
            <input
              type="text"
              value={senderData.idNumber || ''}
              onChange={(e) => updateSender('idNumber', e.target.value)}
              placeholder={language === "ar" ? "مثال: 123456789" : "e.g., 123456789"}
              pattern="[A-Za-z0-9]+"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
              required={!isEUtoSY}
            />
            {isEUtoSY && (
              <p className="mt-1 text-xs text-gray-500">
                {language === 'ar' 
                  ? 'اختياري (متوافق مع GDPR - لا نطلب صور وثائق رسمية)' 
                  : 'Optional (GDPR compliant - we do not request official document photos)'}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Receiver Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100"
      >
        <h3 className="text-xl font-bold text-primary-dark mb-6 flex items-center gap-2">
          <span className="w-10 h-10 bg-primary-yellow rounded-full flex items-center justify-center text-primary-dark font-bold">
            2
          </span>
          {t.receiverInfo} {isEUtoSY ? `(${t.inSyria})` : `(${t.inEurope})`}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Full Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.fullName} *
            </label>
            <input
              type="text"
              value={receiverData.fullName}
              onChange={(e) => updateReceiver('fullName', e.target.value)}
              placeholder={language === "ar" ? "مثال: أحمد محمد" : "e.g., Jane Smith"}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.phone} *
            </label>
            <input
              type="tel"
              value={receiverData.phone}
              onChange={(e) => updateReceiver('phone', e.target.value)}
              placeholder={language === "ar" ? "مثال: +963991234567" : "e.g., +963991234567"}
              pattern="[+]?[0-9\s\-()]+"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.email} *
            </label>
            <input
              type="email"
              value={receiverData.email}
              onChange={(e) => updateReceiver('email', e.target.value)}
              placeholder={language === "ar" ? "مثال: receiver@email.com" : "e.g., receiver@email.com"}
              pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
              required
            />
          </div>

          {/* Street */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.street} *
            </label>
            <input
              type="text"
              value={receiverData.street}
              onChange={(e) => updateReceiver('street', e.target.value)}
              placeholder={language === "ar" ? "مثال: شارع الجمهورية" : "e.g., Republic Street"}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
              required
            />
          </div>

          {/* Street Number */}
          {!isEUtoSY && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.streetNumber} *
              </label>
              <input
                type="text"
                value={receiverData.streetNumber}
                onChange={(e) => updateReceiver('streetNumber', e.target.value)}
                placeholder={language === "ar" ? "مثال: 45" : "e.g., 45"}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                required
              />
            </div>
          )}

          {/* City */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.city} *
            </label>
            <input
              type="text"
              value={receiverData.city}
              onChange={(e) => updateReceiver('city', e.target.value)}
              placeholder={language === "ar" ? "مثال: حلب" : "e.g., Aleppo"}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
              required
            />
          </div>

          {/* Postal Code */}
          {!isEUtoSY && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.postalCode} *
              </label>
              <input
                type="text"
                value={receiverData.postalCode}
                onChange={(e) => updateReceiver('postalCode', e.target.value)}
                placeholder={language === "ar" ? "مثال: 12345" : "e.g., 12345"}
                pattern="[A-Za-z0-9\s-]+"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                required
              />
            </div>
          )}

          {/* Country (for EU) */}
          {!isEUtoSY && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.country} *
              </label>
              <select
                value={receiverData.country || ''}
                onChange={(e) => updateReceiver('country', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow bg-white"
                required
              >
                <option value="">{language === 'ar' ? 'اختر...' : 'Select...'}</option>
                {europeanCountries.map(country => (
                  <option key={country.code} value={country.code}>
                    {language === 'ar' ? country.nameAr : country.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Province (for Syria) */}
          {isEUtoSY && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.province} *
              </label>
              <select
                value={receiverData.province || ''}
                onChange={(e) => updateReceiver('province', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow bg-white"
                required
              >
                <option value="">{language === 'ar' ? 'اختر...' : 'Select...'}</option>
                {syrianProvinces.map(province => (
                  <option key={province.code} value={province.code}>
                    {language === 'ar' ? province.nameAr : province.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* ID Number */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.idNumber} {isEUtoSY ? '*' : ''}
            </label>
            <input
              type="text"
              value={receiverData.idNumber || ''}
              onChange={(e) => updateReceiver('idNumber', e.target.value)}
              placeholder={language === "ar" ? "مثال: 987654321" : "e.g., 987654321"}
              pattern="[A-Za-z0-9]+"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
              required={isEUtoSY}
            />
            {!isEUtoSY && (
              <p className="mt-1 text-xs text-gray-500">
                {language === 'ar' 
                  ? 'اختياري (متوافق مع GDPR - لا نطلب صور وثائق رسمية)' 
                  : 'Optional (GDPR compliant - we do not request official document photos)'}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

