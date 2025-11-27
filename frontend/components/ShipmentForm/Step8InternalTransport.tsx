"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShippingDirection } from '@/types/shipment';
import apiService from '@/lib/api';

interface ShippingMethod {
  id: number;
  name: string;
  carrier: string;
  price: number;
  currency: string;
  delivery_days: string;
}

interface Step8InternalTransportProps {
  direction: ShippingDirection;
  euPickupAddress: string;
  euPickupWeight: number;
  euPickupCity: string;
  euPickupPostalCode: string;
  euPickupCountry: string;
  selectedEUShippingMethod: number | null;
  onEUPickupAddressChange: (address: string) => void;
  onEUPickupWeightChange: (weight: number) => void;
  onEUPickupCityChange: (city: string) => void;
  onEUPickupPostalCodeChange: (postalCode: string) => void;
  onEUPickupCountryChange: (country: string) => void;
  onEUShippingMethodChange: (methodId: number | null) => void;
  syriaProvince: string;
  syriaWeight: number;
  onSyriaProvinceChange: (province: string) => void;
  onSyriaWeightChange: (weight: number) => void;
  language: 'ar' | 'en';
}

// EU countries
const euCountries = [
  { code: 'AT', name: 'النمسا', nameEn: 'Austria' },
  { code: 'BE', name: 'بلجيكا', nameEn: 'Belgium' },
  { code: 'BG', name: 'بلغاريا', nameEn: 'Bulgaria' },
  { code: 'HR', name: 'كرواتيا', nameEn: 'Croatia' },
  { code: 'CY', name: 'قبرص', nameEn: 'Cyprus' },
  { code: 'CZ', name: 'التشيك', nameEn: 'Czech Republic' },
  { code: 'DK', name: 'الدنمارك', nameEn: 'Denmark' },
  { code: 'EE', name: 'إستونيا', nameEn: 'Estonia' },
  { code: 'FI', name: 'فنلندا', nameEn: 'Finland' },
  { code: 'FR', name: 'فرنسا', nameEn: 'France' },
  { code: 'DE', name: 'ألمانيا', nameEn: 'Germany' },
  { code: 'GR', name: 'اليونان', nameEn: 'Greece' },
  { code: 'HU', name: 'هنغاريا', nameEn: 'Hungary' },
  { code: 'IE', name: 'أيرلندا', nameEn: 'Ireland' },
  { code: 'IT', name: 'إيطاليا', nameEn: 'Italy' },
  { code: 'LV', name: 'لاتفيا', nameEn: 'Latvia' },
  { code: 'LT', name: 'ليتوانيا', nameEn: 'Lithuania' },
  { code: 'LU', name: 'لوكسمبورغ', nameEn: 'Luxembourg' },
  { code: 'MT', name: 'مالطا', nameEn: 'Malta' },
  { code: 'NL', name: 'هولندا', nameEn: 'Netherlands' },
  { code: 'PL', name: 'بولندا', nameEn: 'Poland' },
  { code: 'PT', name: 'البرتغال', nameEn: 'Portugal' },
  { code: 'RO', name: 'رومانيا', nameEn: 'Romania' },
  { code: 'SK', name: 'سلوفاكيا', nameEn: 'Slovakia' },
  { code: 'SI', name: 'سلوفينيا', nameEn: 'Slovenia' },
  { code: 'ES', name: 'إسبانيا', nameEn: 'Spain' },
  { code: 'SE', name: 'السويد', nameEn: 'Sweden' },
  { code: 'NO', name: 'النرويج', nameEn: 'Norway' },
  { code: 'CH', name: 'سويسرا', nameEn: 'Switzerland' },
  { code: 'GB', name: 'المملكة المتحدة', nameEn: 'United Kingdom' },
];

// Syrian provinces with pricing
const syrianProvinces = [
  { code: 'ALEPPO', name: 'حلب', nameEn: 'Aleppo', minPrice: 0, ratePerKg: 0 }, // Center location
  { code: 'LATAKIA', name: 'اللاذقية', nameEn: 'Latakia', minPrice: 6, ratePerKg: 0.05 },
  { code: 'TARTOUS', name: 'طرطوس', nameEn: 'Tartous', minPrice: 7, ratePerKg: 0.05 },
  { code: 'DAMASCUS', name: 'دمشق', nameEn: 'Damascus', minPrice: 10, ratePerKg: 0.07 },
  { code: 'RIF_DIMASHQ', name: 'ريف دمشق', nameEn: 'Rif Dimashq', minPrice: 10, ratePerKg: 0.07 },
  { code: 'HOMS', name: 'حمص', nameEn: 'Homs', minPrice: 9, ratePerKg: 0.06 },
  { code: 'HAMA', name: 'حماة', nameEn: 'Hama', minPrice: 8, ratePerKg: 0.06 },
  { code: 'IDLIB', name: 'إدلب', nameEn: 'Idlib', minPrice: 7, ratePerKg: 0.06 },
  { code: 'SUWEIDA', name: 'السويداء', nameEn: 'Suweida', minPrice: 12, ratePerKg: 0.08 },
  { code: 'DARAA', name: 'درعا', nameEn: 'Daraa', minPrice: 11, ratePerKg: 0.07 },
  { code: 'QUNEITRA', name: 'القنيطرة', nameEn: 'Quneitra', minPrice: 10, ratePerKg: 0.07 },
  { code: 'RAQQA', name: 'الرقة', nameEn: 'Raqqa', minPrice: 13, ratePerKg: 0.08 },
  { code: 'DER_EZZOR', name: 'دير الزور', nameEn: 'Deir ez-Zor', minPrice: 14, ratePerKg: 0.09 },
  { code: 'HASAKA', name: 'الحسكة', nameEn: 'Hasaka', minPrice: 18, ratePerKg: 0.10 },
];

export default function Step8InternalTransport({
  direction,
  euPickupAddress,
  euPickupWeight,
  euPickupCity,
  euPickupPostalCode,
  euPickupCountry,
  selectedEUShippingMethod,
  onEUPickupAddressChange,
  onEUPickupWeightChange,
  onEUPickupCityChange,
  onEUPickupPostalCodeChange,
  onEUPickupCountryChange,
  onEUShippingMethodChange,
  syriaProvince,
  syriaWeight,
  onSyriaProvinceChange,
  onSyriaWeightChange,
  language,
}: Step8InternalTransportProps) {
  // ✅ States for Sendcloud shipping methods
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [canCalculate, setCanCalculate] = useState(false);

  const translations = {
    ar: {
      title: 'النقل الداخلي',
      euTransport: 'النقل الداخلي في أوروبا',
      euTransportDesc: 'استلام من عنوانك في أوروبا إلى مركز Bergen op Zoom (هولندا)',
      pickupAddress: 'عنوان الاستلام',
      approximateWeight: 'الوزن (كغ)',
      city: 'المدينة',
      postalCode: 'الرمز البريدي',
      country: 'الدولة',
      selectCountry: 'اختر الدولة',
      sendcloudNote: 'سيتم حساب السعر عبر Sendcloud API',
      comingSoon: 'قريباً',
      calculateRates: 'احسب الأسعار',
      calculating: 'جاري الحساب...',
      availableShipping: 'خيارات الشحن المتاحة',
      selectShipping: 'اختر طريقة الشحن',
      carrier: 'الناقل',
      deliveryDays: 'أيام التوصيل',
      selected: 'محدد',
      fillAllFields: 'يرجى ملء جميع الحقول لحساب الأسعار',
      syriaTransport: 'النقل الداخلي في سورية',
      syriaTransportDesc: 'توصيل من مركز حلب إلى المحافظة المحددة',
      selectProvince: 'اختر المحافظة',
      weight: 'الوزن (كغ)',
      minPrice: 'الحد الأدنى',
      ratePerKg: 'السعر لكل كغ',
      calculatedPrice: 'السعر المحسوب',
      optional: 'اختياري',
      noMethods: 'لا توجد طرق شحن متاحة',
      error: 'خطأ',
    },
    en: {
      title: 'Internal Transport',
      euTransport: 'Internal Transport in Europe',
      euTransportDesc: 'Pickup from your address in Europe to Bergen op Zoom center (Netherlands)',
      pickupAddress: 'Pickup Address',
      approximateWeight: 'Weight (kg)',
      city: 'City',
      postalCode: 'Postal Code',
      country: 'Country',
      selectCountry: 'Select Country',
      sendcloudNote: 'Price will be calculated via Sendcloud API',
      comingSoon: 'Coming Soon',
      calculateRates: 'Calculate Rates',
      calculating: 'Calculating...',
      availableShipping: 'Available Shipping Options',
      selectShipping: 'Select Shipping Method',
      carrier: 'Carrier',
      deliveryDays: 'Delivery Days',
      selected: 'Selected',
      fillAllFields: 'Please fill all fields to calculate rates',
      syriaTransport: 'Internal Transport in Syria',
      syriaTransportDesc: 'Delivery from Aleppo center to selected province',
      selectProvince: 'Select Province',
      weight: 'Weight (kg)',
      minPrice: 'Minimum Price',
      ratePerKg: 'Rate per kg',
      calculatedPrice: 'Calculated Price',
      optional: 'Optional',
      noMethods: 'No shipping methods available',
      error: 'Error',
    },
  };

  const t = translations[language];
  const isEUtoSY = direction === 'eu-sy';

  // ✅ Check if all required fields are filled for EU shipping calculation
  useEffect(() => {
    const allFieldsFilled = 
      euPickupAddress.trim().length > 0 &&
      euPickupCity.trim().length > 0 &&
      euPickupPostalCode.trim().length > 0 &&
      euPickupCountry.trim().length > 0 &&
      euPickupWeight > 0;
    
    setCanCalculate(allFieldsFilled);
    
    // Reset shipping methods when fields change
    if (!allFieldsFilled) {
      setShippingMethods([]);
      setShippingError(null);
      onEUShippingMethodChange(null);
    }
  }, [euPickupAddress, euPickupCity, euPickupPostalCode, euPickupCountry, euPickupWeight]);

  // ✅ Calculate EU shipping rates from Sendcloud
  const calculateEUShipping = async () => {
    if (!canCalculate) {
      setShippingError(t.fillAllFields);
      return;
    }

    setLoadingShipping(true);
    setShippingError(null);
    setShippingMethods([]);
    onEUShippingMethodChange(null);

    try {
      const response = await apiService.calculateEUShipping({
        sender_address: 'Wattweg 5', // Our center address
        sender_city: 'Bergen op Zoom',
        sender_postal_code: '4622RA',
        sender_country: 'NL',
        receiver_address: euPickupAddress,
        receiver_city: euPickupCity,
        receiver_postal_code: euPickupPostalCode,
        receiver_country: euPickupCountry,
        weight: euPickupWeight,
      });

      if (response.data.success && response.data.shipping_methods) {
        setShippingMethods(response.data.shipping_methods);
        
        if (response.data.shipping_methods.length === 0) {
          setShippingError(t.noMethods);
        }
      } else {
        setShippingError(response.data.error || t.error);
      }
    } catch (error: any) {
      console.error('Error calculating EU shipping:', error);
      const errorMessage = error.response?.data?.error || t.error;
      setShippingError(errorMessage);
    } finally {
      setLoadingShipping(false);
    }
  };

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
            {/* Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.pickupAddress} *
              </label>
              <input
                type="text"
                value={euPickupAddress}
                onChange={(e) => onEUPickupAddressChange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                placeholder={language === 'ar' ? 'مثال: Main Street 123' : 'e.g., Main Street 123'}
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.city} *
              </label>
              <input
                type="text"
                value={euPickupCity}
                onChange={(e) => onEUPickupCityChange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                placeholder={language === 'ar' ? 'مثال: Amsterdam' : 'e.g., Amsterdam'}
              />
            </div>

            {/* Postal Code */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.postalCode} *
              </label>
              <input
                type="text"
                value={euPickupPostalCode}
                onChange={(e) => onEUPickupPostalCodeChange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                placeholder={language === 'ar' ? 'مثال: 1012AB' : 'e.g., 1012AB'}
              />
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.country} *
              </label>
              <select
                value={euPickupCountry}
                onChange={(e) => onEUPickupCountryChange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow bg-white"
              >
                <option value="">{t.selectCountry}</option>
                {euCountries.map(country => (
                  <option key={country.code} value={country.code}>
                    {language === 'ar' ? country.name : country.nameEn} ({country.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Weight */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.approximateWeight} *
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

            {/* Calculate Button */}
            <button
              onClick={calculateEUShipping}
              disabled={!canCalculate || loadingShipping}
              className={`w-full px-6 py-4 rounded-xl font-bold text-white transition-all ${
                canCalculate && !loadingShipping
                  ? 'bg-primary-yellow hover:bg-yellow-600 cursor-pointer'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {loadingShipping ? t.calculating : t.calculateRates}
            </button>

            {/* Error Message */}
            {shippingError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 rounded-xl p-4 border-2 border-red-200"
              >
                <p className="text-red-700 text-sm font-semibold">
                  ⚠️ {shippingError}
                </p>
              </motion.div>
            )}

            {/* Shipping Methods */}
            {shippingMethods.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <h4 className="font-bold text-gray-800">{t.availableShipping}</h4>
                {shippingMethods.map((method) => (
                  <motion.div
                    key={method.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedEUShippingMethod === method.id
                        ? 'border-primary-yellow bg-yellow-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                    onClick={() => onEUShippingMethodChange(method.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-bold text-gray-800">{method.name}</h5>
                          {selectedEUShippingMethod === method.id && (
                            <span className="px-2 py-0.5 bg-primary-yellow text-white text-xs rounded-full font-bold">
                              ✓ {t.selected}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {t.carrier}: {method.carrier}
                        </p>
                        <p className="text-sm text-gray-600">
                          {t.deliveryDays}: {method.delivery_days}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary-dark">
                          {method.price.toFixed(2)} {method.currency}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
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

      {/* Syria to EU - Syria Pickup and EU Delivery */}
      {!isEUtoSY && (
        <>
          {/* Syria Internal Transport */}
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

        {/* EU Internal Transport for Syria to EU */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100 mt-6"
        >
          <div className="mb-4">
            <h3 className="text-xl font-bold text-primary-dark mb-2">
              {t.euTransport}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              {language === 'ar' 
                ? 'توصيل من مركز Bergen op Zoom (هولندا) إلى عنوانك في أوروبا'
                : 'Delivery from Bergen op Zoom center (Netherlands) to your address in Europe'}
            </p>
            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
              {t.optional}
            </span>
          </div>

          <div className="space-y-4">
            {/* Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {language === 'ar' ? 'عنوان التوصيل' : 'Delivery Address'} *
              </label>
              <input
                type="text"
                value={euPickupAddress}
                onChange={(e) => onEUPickupAddressChange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                placeholder={language === 'ar' ? 'مثال: Main Street 123' : 'e.g., Main Street 123'}
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.city} *
              </label>
              <input
                type="text"
                value={euPickupCity}
                onChange={(e) => onEUPickupCityChange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                placeholder={language === 'ar' ? 'مثال: Amsterdam' : 'e.g., Amsterdam'}
              />
            </div>

            {/* Postal Code */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.postalCode} *
              </label>
              <input
                type="text"
                value={euPickupPostalCode}
                onChange={(e) => onEUPickupPostalCodeChange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                placeholder={language === 'ar' ? 'مثال: 1012AB' : 'e.g., 1012AB'}
              />
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.country} *
              </label>
              <select
                value={euPickupCountry}
                onChange={(e) => onEUPickupCountryChange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow bg-white"
              >
                <option value="">{t.selectCountry}</option>
                {euCountries.map(country => (
                  <option key={country.code} value={country.code}>
                    {language === 'ar' ? country.name : country.nameEn} ({country.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Weight */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.approximateWeight} *
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

            {/* Calculate Button */}
            <button
              onClick={calculateEUShipping}
              disabled={!canCalculate || loadingShipping}
              className={`w-full px-6 py-4 rounded-xl font-bold text-white transition-all ${
                canCalculate && !loadingShipping
                  ? 'bg-primary-yellow hover:bg-yellow-600 cursor-pointer'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {loadingShipping ? t.calculating : t.calculateRates}
            </button>

            {/* Error Message */}
            {shippingError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 rounded-xl p-4 border-2 border-red-200"
              >
                <p className="text-red-700 text-sm font-semibold">
                  ⚠️ {shippingError}
                </p>
              </motion.div>
            )}

            {/* Shipping Methods */}
            {shippingMethods.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <h4 className="font-bold text-gray-800">{t.availableShipping}</h4>
                {shippingMethods.map((method) => (
                  <motion.div
                    key={method.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedEUShippingMethod === method.id
                        ? 'border-primary-yellow bg-yellow-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                    onClick={() => onEUShippingMethodChange(method.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-bold text-gray-800">{method.name}</h5>
                          {selectedEUShippingMethod === method.id && (
                            <span className="px-2 py-0.5 bg-primary-yellow text-white text-xs rounded-full font-bold">
                              ✓ {t.selected}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {t.carrier}: {method.carrier}
                        </p>
                        <p className="text-sm text-gray-600">
                          {t.deliveryDays}: {method.delivery_days}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary-dark">
                          {method.price.toFixed(2)} {method.currency}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>
        </>
      )}
    </div>
  );
}

