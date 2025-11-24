"use client";

import { motion } from 'framer-motion';
import { FINAL_PACKAGING, PackagingOption } from '@/types/pricing';
import { ShippingDirection } from '@/types/shipment';

interface Step6PackagingProps {
  finalPackaging: { key: string; quantity: number }[];
  onFinalPackagingChange: (packaging: { key: string; quantity: number }[]) => void;
  language: 'ar' | 'en';
  direction: ShippingDirection | null;
}

export default function Step6Packaging({
  finalPackaging,
  onFinalPackagingChange,
  language,
  direction,
}: Step6PackagingProps) {
  const translations = {
    ar: {
      title: 'خيارات التغليف',
      finalPackaging: 'التغليف النهائي',
      finalPackagingDescEu: 'التغليف النهائي في أوروبا - Bergen op Zoom',
      finalPackagingDescSy: 'التغليف النهائي في سورية - حلب',
      selectPackaging: 'اختر نوع التغليف',
      quantity: 'الكمية',
      add: 'إضافة',
      remove: 'حذف',
      total: 'الإجمالي',
      optional: 'اختياري',
    },
    en: {
      title: 'Packaging Options',
      finalPackaging: 'Final Packaging',
      finalPackagingDescEu: 'Final packaging in Europe - Bergen op Zoom',
      finalPackagingDescSy: 'Final packaging in Syria - Aleppo',
      selectPackaging: 'Select Packaging Type',
      quantity: 'Quantity',
      add: 'Add',
      remove: 'Remove',
      total: 'Total',
      optional: 'Optional',
    },
  };

  const t = translations[language];
  
  // تحديد النص حسب الاتجاه
  const finalPackagingDesc = direction === 'eu-sy' 
    ? t.finalPackagingDescEu 
    : direction === 'sy-eu' 
    ? t.finalPackagingDescSy 
    : language === 'ar' ? 'التغليف في مكان الانطلاق' : 'Packaging at departure location';

  const addFinalPackaging = () => {
    onFinalPackagingChange([
      ...finalPackaging,
      { key: '', quantity: 1 },
    ]);
  };

  const removeFinalPackaging = (index: number) => {
    onFinalPackagingChange(finalPackaging.filter((_, i) => i !== index));
  };

  const updateFinalPackaging = (index: number, field: 'key' | 'quantity', value: string | number) => {
    const updated = [...finalPackaging];
    updated[index] = { ...updated[index], [field]: value };
    onFinalPackagingChange(updated);
  };

  const calculateTotal = (packaging: { key: string; quantity: number }[], options: PackagingOption[]) => {
    return packaging.reduce((sum, item) => {
      const option = options.find(o => o.key === item.key);
      return sum + (option?.price || 0) * item.quantity;
    }, 0);
  };

  const finalTotal = calculateTotal(finalPackaging, FINAL_PACKAGING);

  return (
    <div className="space-y-8">
      {/* Final Packaging */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100"
      >
        <div className="mb-4">
          <h3 className="text-xl font-bold text-primary-dark mb-2">
            {t.finalPackaging}
          </h3>
          <p className="text-sm text-gray-600">{finalPackagingDesc}</p>
          <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
            {t.optional}
          </span>
        </div>

        <div className="space-y-4">
          {finalPackaging.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-4 items-end"
            >
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.selectPackaging}
                </label>
                <select
                  value={item.key}
                  onChange={(e) => updateFinalPackaging(index, 'key', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow bg-white"
                >
                  <option value="">{language === 'ar' ? 'اختر...' : 'Select...'}</option>
                  {FINAL_PACKAGING.map(option => (
                    <option key={option.key} value={option.key}>
                      {language === 'ar' ? option.name : option.nameEn}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-32">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.quantity}
                </label>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateFinalPackaging(index, 'quantity', parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                />
              </div>
              <motion.button
                onClick={() => removeFinalPackaging(index)}
                className="px-4 py-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t.remove}
              </motion.button>
            </motion.div>
          ))}

          <motion.button
            onClick={addFinalPackaging}
            className="w-full px-6 py-3 bg-primary-yellow text-primary-dark font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            + {t.add} {t.finalPackaging}
          </motion.button>

          {finalTotal > 0 && (
            <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
              <span className="font-bold text-gray-800">{t.total}</span>
              <span className="text-xl font-bold text-primary-dark">
                {finalTotal.toFixed(2)} €
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Grand Total */}
      {finalTotal > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-primary-yellow to-primary-yellow/90 rounded-2xl p-6 shadow-2xl border-4 border-primary-dark"
        >
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-primary-dark">{t.total}</span>
            <span className="text-3xl font-black text-primary-dark">
              {finalTotal.toFixed(2)} €
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}

