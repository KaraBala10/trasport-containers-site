"use client";

import { motion } from 'framer-motion';
import { ShipmentData } from '@/types/shipment';
import FormContainer from './FormContainer';
import { useMemo } from 'react';

interface Step5PricingProps {
  data: ShipmentData;
  language: 'ar' | 'en';
}

export default function Step5Pricing({ data, language }: Step5PricingProps) {
  const translations = {
    ar: {
      title: 'حساب التكلفة',
      description: 'ملخص تفصيلي للأسعار',
      basePrice: 'السعر الأساسي',
      byWeight: 'حسب الوزن',
      byVolume: 'حسب الحجم',
      minimum: 'الحد الأدنى',
      finalBase: 'الأساسي النهائي',
      additionalServices: 'الخدمات الإضافية',
      packaging: 'التغليف',
      syriaDelivery: 'التوصيل في سورية',
      euTransport: 'النقل الأوروبي',
      insurance: 'التأمين',
      subtotal: 'المجموع الفرعي',
      total: 'الإجمالي النهائي',
      vat: 'ضريبة القيمة المضافة',
      perKg: 'كغ',
      perCBM: 'm³',
    },
    en: {
      title: 'Price Calculation',
      description: 'Detailed pricing summary',
      basePrice: 'Base Price',
      byWeight: 'By Weight',
      byVolume: 'By Volume',
      minimum: 'Minimum',
      finalBase: 'Final Base',
      additionalServices: 'Additional Services',
      packaging: 'Packaging',
      syriaDelivery: 'Syria Delivery',
      euTransport: 'EU Transport',
      insurance: 'Insurance',
      subtotal: 'Subtotal',
      total: 'Grand Total',
      vat: 'VAT',
      perKg: 'kg',
      perCBM: 'm³',
    },
  };

  const t = translations[language];

  const pricing = useMemo(() => {
    // Calculate totals
    const totalWeight = (data.parcels || []).reduce((sum, p) => sum + (Number(p.weight) || 0), 0);
    const totalCBM = (data.parcels || []).reduce((sum, p) => sum + (Number(p.cbm) || 0), 0);

    // Base pricing
    const baseByWeight = totalWeight * 3;
    const baseByVolume = totalCBM * 300;
    const minimum = 60;
    const basePrice = Math.max(baseByWeight, baseByVolume, minimum);

    // Packaging cost
    const packagingOptions = {
      'small-box': 1.5,
      'medium-box': 2.5,
      'large-box': 3.5,
      'bubble-wrap': 2,
      'foam': 3,
      'pallet': 25,
      'wooden-crate': 75,
      'pallet-box': 29,
    };

    let packagingCost = 0;
    Object.entries(data.packagingOptions || {}).forEach(([id, quantity]) => {
      packagingCost += (packagingOptions[id as keyof typeof packagingOptions] || 0) * quantity;
    });

    // Syria delivery
    const syrianProvinces: { [key: string]: { basePrice: number; pricePerKg: number } } = {
      'aleppo': { basePrice: 0, pricePerKg: 0 },
      'latakia': { basePrice: 6, pricePerKg: 0.05 },
      'tartus': { basePrice: 7, pricePerKg: 0.05 },
      'damascus': { basePrice: 10, pricePerKg: 0.07 },
      'homs': { basePrice: 9, pricePerKg: 0.06 },
      'hama': { basePrice: 8, pricePerKg: 0.06 },
      'idlib': { basePrice: 7, pricePerKg: 0.06 },
      'sweida': { basePrice: 12, pricePerKg: 0.08 },
      'deir': { basePrice: 14, pricePerKg: 0.09 },
      'hasaka': { basePrice: 18, pricePerKg: 0.10 },
      'raqqa': { basePrice: 13, pricePerKg: 0.08 },
    };

    let syriaDeliveryCost = 0;
    if (data.syriaDeliveryProvince && data.syriaDeliveryProvince !== 'aleppo') {
      const province = syrianProvinces[data.syriaDeliveryProvince];
      if (province) {
        syriaDeliveryCost = Math.max(province.basePrice, totalWeight * province.pricePerKg);
      }
    }

    // EU transport
    const euZones: { [key: string]: { basePrice: number; pricePerKg: number } } = {
      'netherlands': { basePrice: 30, pricePerKg: 0.18 },
      'nearby': { basePrice: 55, pricePerKg: 0.23 },
      'other': { basePrice: 75, pricePerKg: 0.28 },
    };

    let euTransportCost = 0;
    if (data.euTransportZone) {
      const zone = euZones[data.euTransportZone];
      if (zone) {
        euTransportCost = Math.max(zone.basePrice, totalWeight * zone.pricePerKg);
      }
    }

    // Subtotal before insurance
    const subtotal = basePrice + packagingCost + syriaDeliveryCost + euTransportCost;

    // Insurance (on total price)
    let insuranceCost = 0;
    if (data.insuranceEnabled && data.goodsValue) {
      insuranceCost = Math.max(data.goodsValue * 0.015, 5);
    }

    // Grand total
    const total = subtotal + insuranceCost;

    return {
      totalWeight,
      totalCBM,
      baseByWeight,
      baseByVolume,
      minimum,
      basePrice,
      packagingCost,
      syriaDeliveryCost,
      euTransportCost,
      subtotal,
      insuranceCost,
      total,
    };
  }, [data]);

  const PriceRow = ({ label, value, highlight = false, icon = '' }: any) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`
        flex justify-between items-center p-4 rounded-xl
        ${highlight ? 'bg-primary-yellow text-primary-dark font-black text-2xl' : 'bg-white text-gray-800'}
      `}
    >
      <span className="flex items-center gap-2">
        {icon && <span className="text-2xl">{icon}</span>}
        {label}
      </span>
      <span className={highlight ? 'text-3xl' : 'text-xl font-bold'}>
        {value.toFixed(2)} €
      </span>
    </motion.div>
  );

  return (
    <FormContainer>
      <div className="space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.5 }}
            className="inline-block text-7xl"
          >
            💰
          </motion.div>
          
          <h2 className="text-5xl font-black text-primary-dark">
            {t.title}
          </h2>
          
          <p className="text-xl text-gray-600 font-medium">
            {t.description}
          </p>
        </div>

        {/* Base Price Breakdown */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 shadow-xl border-2 border-blue-200 space-y-4">
          <h3 className="text-3xl font-black text-blue-900 mb-6 flex items-center gap-3">
            <span className="text-4xl">📊</span> {t.basePrice}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
              <div className="text-sm text-gray-600 mb-2">{t.byWeight}</div>
              <div className="text-3xl font-black text-blue-600">{pricing.baseByWeight.toFixed(2)} €</div>
              <div className="text-xs text-gray-500 mt-1">
                {pricing.totalWeight.toFixed(2)} {t.perKg} × 3€
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
              <div className="text-sm text-gray-600 mb-2">{t.byVolume}</div>
              <div className="text-3xl font-black text-purple-600">{pricing.baseByVolume.toFixed(2)} €</div>
              <div className="text-xs text-gray-500 mt-1">
                {pricing.totalCBM.toFixed(4)} {t.perCBM} × 300€
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
              <div className="text-sm text-gray-600 mb-2">{t.minimum}</div>
              <div className="text-3xl font-black text-green-600">{pricing.minimum.toFixed(2)} €</div>
              <div className="text-xs text-gray-500 mt-1">Fixed Minimum</div>
            </div>
          </div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-6 shadow-2xl"
          >
            <div className="flex justify-between items-center">
              <span className="text-2xl font-black">{t.finalBase}</span>
              <span className="text-4xl font-black">{pricing.basePrice.toFixed(2)} €</span>
            </div>
          </motion.div>
        </div>

        {/* Additional Services */}
        {(pricing.packagingCost > 0 || pricing.syriaDeliveryCost > 0 || pricing.euTransportCost > 0 || pricing.insuranceCost > 0) && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 shadow-xl border-2 border-green-200 space-y-3">
            <h3 className="text-3xl font-black text-green-900 mb-6 flex items-center gap-3">
              <span className="text-4xl">⚙️</span> {t.additionalServices}
            </h3>

            {pricing.packagingCost > 0 && (
              <PriceRow label={t.packaging} value={pricing.packagingCost} icon="📦" />
            )}
            {pricing.syriaDeliveryCost > 0 && (
              <PriceRow label={t.syriaDelivery} value={pricing.syriaDeliveryCost} icon="🚚" />
            )}
            {pricing.euTransportCost > 0 && (
              <PriceRow label={t.euTransport} value={pricing.euTransportCost} icon="🚛" />
            )}
            {pricing.insuranceCost > 0 && (
              <PriceRow label={t.insurance} value={pricing.insuranceCost} icon="🛡️" />
            )}
          </div>
        )}

        {/* Grand Total */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-primary-dark via-blue-700 to-indigo-800 text-white rounded-3xl p-10 shadow-2xl relative overflow-hidden"
        >
          {/* Animated Background */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 bg-primary-yellow rounded-full blur-3xl"
          />

          <div className="relative z-10 text-center space-y-4">
            <div className="text-2xl font-bold opacity-90">{t.total}</div>
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-7xl font-black"
            >
              {pricing.total.toFixed(2)} €
            </motion.div>
            <div className="text-lg opacity-75">
              {language === 'ar' ? 'شامل جميع الخدمات' : 'Including all services'}
            </div>
          </div>
        </motion.div>

        {/* Info Note */}
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-6 shadow-lg">
          <div className="flex items-start gap-4">
            <span className="text-3xl">ℹ️</span>
            <div className="text-yellow-900">
              <p className="font-bold text-lg mb-2">
                {language === 'ar' ? 'ملاحظة هامة:' : 'Important Note:'}
              </p>
              <p className="text-sm">
                {language === 'ar'
                  ? 'السعر النهائي قابل للتغيير بناءً على الفحص الفعلي للطرود في مركزنا. سيتم إعلامك بأي تغييرات قبل الشحن.'
                  : 'Final price subject to change based on actual inspection at our center. You will be notified of any changes before shipping.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </FormContainer>
  );
}

