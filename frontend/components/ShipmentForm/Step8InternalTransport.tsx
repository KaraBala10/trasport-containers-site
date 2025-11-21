"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShippingDirection } from '@/types/shipment';

interface Step8InternalTransportProps {
  direction: ShippingDirection;
  euPickupAddress: string;
  euPickupWeight: number;
  onEUPickupAddressChange: (address: string) => void;
  onEUPickupWeightChange: (weight: number) => void;
  syriaProvince: string;
  syriaWeight: number;
  onSyriaProvinceChange: (province: string) => void;
  onSyriaWeightChange: (weight: number) => void;
  language: 'ar' | 'en';
}

// Syrian provinces with pricing
const syrianProvinces = [
  { code: 'LATAKIA', name: 'اللاذقية', nameEn: 'Latakia', minPrice: 6, ratePerKg: 0.05 },
  { code: 'TARTOUS', name: 'طرطوس', nameEn: 'Tartous', minPrice: 7, ratePerKg: 0.05 },
  { code: 'DAMASCUS', name: 'دمشق', nameEn: 'Damascus', minPrice: 10, ratePerKg: 0.07 },
  { code: 'HOMS', name: 'حمص', nameEn: 'Homs', minPrice: 9, ratePerKg: 0.06 },
  { code: 'HAMA', name: 'حماة', nameEn: 'Hama', minPrice: 8, ratePerKg: 0.06 },
  { code: 'IDLIB', name: 'إدلب', nameEn: 'Idlib', minPrice: 7, ratePerKg: 0.06 },
  { code: 'SUWEIDA', name: 'السويداء', nameEn: 'Suweida', minPrice: 12, ratePerKg: 0.08 },
  { code: 'RAQQA', name: 'الرقة', nameEn: 'Raqqa', minPrice: 13, ratePerKg: 0.08 },
  { code: 'DER_EZZOR', name: 'دير الزور', nameEn: 'Deir ez-Zor', minPrice: 14, ratePerKg: 0.09 },
  { code: 'HASAKA', name: 'الحسكة', nameEn: 'Hasaka', minPrice: 18, ratePerKg: 0.10 },
];

export default function Step8InternalTransport({
  direction,
  euPickupAddress,
  euPickupWeight,
  onEUPickupAddressChange,
  onEUPickupWeightChange,
  syriaProvince,
  syriaWeight,
  onSyriaProvinceChange,
  onSyriaWeightChange,
  language,
}: Step8InternalTransportProps) {
  const translations = {
    ar: {
      title: 'النقل الداخلي',
      euTransport: 'النقل الداخلي في أوروبا',
      euTransportDesc: 'استلام من عنوانك في أوروبا إلى مركز Axel (هولندا)',
      pickupAddress: 'عنوان الاستلام',
      approximateWeight: 'الوزن التقريبي (كغ)',
      sendcloudNote: 'سيتم حساب السعر عبر Sendcloud API',
      comingSoon: 'قريباً',
      syriaTransport: 'النقل الداخلي في سورية',
      syriaTransportDesc: 'توصيل من مركز حلب إلى المحافظة المحددة',
      selectProvince: 'اختر المحافظة',
      weight: 'الوزن (كغ)',
      minPrice: 'الحد الأدنى',
      ratePerKg: 'السعر لكل كغ',
      calculatedPrice: 'السعر المحسوب',
      optional: 'اختياري',
    },
    en: {
      title: 'Internal Transport',
      euTransport: 'Internal Transport in Europe',
      euTransportDesc: 'Pickup from your address in Europe to Axel center (Netherlands)',
      pickupAddress: 'Pickup Address',
      approximateWeight: 'Approximate Weight (kg)',
      sendcloudNote: 'Price will be calculated via Sendcloud API',
      comingSoon: 'Coming Soon',
      syriaTransport: 'Internal Transport in Syria',
      syriaTransportDesc: 'Delivery from Aleppo center to selected province',
      selectProvince: 'Select Province',
      weight: 'Weight (kg)',
      minPrice: 'Minimum Price',
      ratePerKg: 'Rate per kg',
      calculatedPrice: 'Calculated Price',
      optional: 'Optional',
    },
  };

  const t = translations[language];
  const isEUtoSY = direction === 'eu-sy';

  // Calculate Syria transport price
  const calculateSyriaPrice = () => {
    if (!syriaProvince || syriaWeight <= 0) return 0;
    const province = syrianProvinces.find(p => p.code === syriaProvince);
    if (!province) return 0;
    return Math.max(syriaWeight * province.ratePerKg, province.minPrice);
  };

  const syriaPrice = calculateSyriaPrice();
  const selectedProvince = syrianProvinces.find(p => p.code === syriaProvince);

  return (
    <div className="space-y-8">
      {/* EU Internal Transport */}
      {isEUtoSY && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100"
        >
          <div className="mb-4">
            <h3 className="text-xl font-bold text-primary-dark mb-2">
              {t.euTransport}
            </h3>
            <p className="text-sm text-gray-600 mb-2">{t.euTransportDesc}</p>
            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
              {t.optional}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.pickupAddress}
              </label>
              <input
                type="text"
                value={euPickupAddress}
                onChange={(e) => onEUPickupAddressChange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                placeholder={language === 'ar' ? 'أدخل عنوان الاستلام...' : 'Enter pickup address...'}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.approximateWeight}
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={euPickupWeight || ''}
                onChange={(e) => onEUPickupWeightChange(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                placeholder={language === 'ar' ? 'أدخل الوزن...' : 'Enter weight...'}
              />
            </div>

            <div className="bg-yellow-50 rounded-xl p-4 border-2 border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-yellow-800 font-semibold">{t.sendcloudNote}</span>
                <span className="px-3 py-1 bg-yellow-200 text-yellow-900 text-xs rounded-full font-bold">
                  {t.comingSoon}
                </span>
              </div>
              <p className="text-sm text-yellow-700">
                {language === 'ar' 
                  ? 'سيتم دمج Sendcloud API قريباً لحساب السعر الحقيقي وحجز السائق تلقائياً'
                  : 'Sendcloud API integration coming soon for real-time pricing and automatic driver booking'}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Syria Internal Transport */}
      {isEUtoSY && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100"
        >
          <div className="mb-4">
            <h3 className="text-xl font-bold text-primary-dark mb-2">
              {t.syriaTransport}
            </h3>
            <p className="text-sm text-gray-600 mb-2">{t.syriaTransportDesc}</p>
            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
              {t.optional}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.selectProvince}
              </label>
              <select
                value={syriaProvince}
                onChange={(e) => onSyriaProvinceChange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow bg-white"
              >
                <option value="">{language === 'ar' ? 'اختر...' : 'Select...'}</option>
                {syrianProvinces.map(province => (
                  <option key={province.code} value={province.code}>
                    {language === 'ar' ? province.name : province.nameEn}
                  </option>
                ))}
              </select>
            </div>

            {syriaProvince && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.weight}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={syriaWeight || ''}
                    onChange={(e) => onSyriaWeightChange(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                  />
                </div>

                {selectedProvince && (
                  <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">{t.minPrice}</span>
                        <span className="font-semibold text-blue-900">
                          {selectedProvince.minPrice.toFixed(2)} €
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">{t.ratePerKg}</span>
                        <span className="font-semibold text-blue-900">
                          {selectedProvince.ratePerKg.toFixed(2)} €/kg
                        </span>
                      </div>
                      {syriaWeight > 0 && (
                        <>
                          <div className="pt-2 border-t border-blue-300">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-700 font-semibold">
                                {syriaWeight} kg × {selectedProvince.ratePerKg.toFixed(2)} € = {(syriaWeight * selectedProvince.ratePerKg).toFixed(2)} €
                              </span>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-blue-300 flex justify-between items-center">
                            <span className="font-bold text-blue-900">{t.calculatedPrice}</span>
                            <span className="text-xl font-bold text-blue-900">
                              {syriaPrice.toFixed(2)} €
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* Syria to EU - Only Syria Pickup */}
      {!isEUtoSY && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100"
        >
          <div className="mb-4">
            <h3 className="text-xl font-bold text-primary-dark mb-2">
              {t.syriaTransport}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              {language === 'ar' 
                ? 'استلام من عنوانك في سورية إلى مركز حلب'
                : 'Pickup from your address in Syria to Aleppo center'}
            </p>
            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
              {t.optional}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.selectProvince}
              </label>
              <select
                value={syriaProvince}
                onChange={(e) => onSyriaProvinceChange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow bg-white"
              >
                <option value="">{language === 'ar' ? 'اختر...' : 'Select...'}</option>
                {syrianProvinces.map(province => (
                  <option key={province.code} value={province.code}>
                    {language === 'ar' ? province.name : province.nameEn}
                  </option>
                ))}
              </select>
            </div>

            {syriaProvince && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.weight}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={syriaWeight || ''}
                    onChange={(e) => onSyriaWeightChange(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                  />
                </div>

                {selectedProvince && (
                  <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">{t.minPrice}</span>
                        <span className="font-semibold text-blue-900">
                          {selectedProvince.minPrice.toFixed(2)} €
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">{t.ratePerKg}</span>
                        <span className="font-semibold text-blue-900">
                          {selectedProvince.ratePerKg.toFixed(2)} €/kg
                        </span>
                      </div>
                      {syriaWeight > 0 && (
                        <>
                          <div className="pt-2 border-t border-blue-300">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-700 font-semibold">
                                {syriaWeight} kg × {selectedProvince.ratePerKg.toFixed(2)} € = {(syriaWeight * selectedProvince.ratePerKg).toFixed(2)} €
                              </span>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-blue-300 flex justify-between items-center">
                            <span className="font-bold text-blue-900">{t.calculatedPrice}</span>
                            <span className="text-xl font-bold text-blue-900">
                              {syriaPrice.toFixed(2)} €
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

