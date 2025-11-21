"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShippingDirection } from '@/types/shipment';

interface Step9PaymentProps {
  direction: ShippingDirection;
  paymentMethod: 'mollie' | 'cash' | 'internal-transfer' | null;
  onPaymentMethodChange: (method: 'mollie' | 'cash' | 'internal-transfer' | null) => void;
  transferSenderName: string;
  transferReference: string;
  transferSlip: File | null;
  onTransferSenderNameChange: (name: string) => void;
  onTransferReferenceChange: (reference: string) => void;
  onTransferSlipChange: (file: File | null) => void;
  language: 'ar' | 'en';
}

export default function Step9Payment({
  direction,
  paymentMethod,
  onPaymentMethodChange,
  transferSenderName,
  transferReference,
  transferSlip,
  onTransferSenderNameChange,
  onTransferReferenceChange,
  onTransferSlipChange,
  language,
}: Step9PaymentProps) {
  const translations = {
    ar: {
      title: 'طريقة الدفع',
      molliePayment: 'الدفع عبر Mollie',
      mollieDesc: 'ادفع بأمان عبر Mollie - جميع طرق الدفع متاحة',
      paymentMethods: 'طرق الدفع المتاحة',
      cashPayment: 'الدفع نقداً في مركز حلب',
      cashDesc: 'دفع كامل قيمة الشحن نقداً عند تسليم الطرود في مركزنا في حلب',
      transferPayment: 'الدفع عبر تحويل داخلي',
      transferDesc: 'يمكنك الدفع عبر حوالة محلية (بنك / صرّاف) إلى حسابنا داخل سورية',
      transferInfo: 'معلومات التحويل',
      transferSenderName: 'اسم المرسل في الحوالة',
      transferReference: 'رقم أو كود الحوالة',
      transferSlip: 'رفع صورة إيصال الحوالة',
      transferSlipRequired: 'مطلوب: JPEG / PNG / PDF',
      transferNote: 'يُرجى كتابة رقم الشحنة في خانة الملاحظة عند التحويل',
      selectPayment: 'اختر طريقة الدفع',
      beneficiaryName: 'اسم المستفيد',
      accountInfo: 'معلومات الحساب',
      phone: 'رقم الهاتف',
      note: 'ملاحظة',
    },
    en: {
      title: 'Payment Method',
      molliePayment: 'Pay via Mollie',
      mollieDesc: 'Pay securely via Mollie - all payment methods available',
      paymentMethods: 'Available Payment Methods',
      cashPayment: 'Cash Payment at Aleppo Center',
      cashDesc: 'Pay full shipping amount in cash when delivering parcels at our center in Aleppo',
      transferPayment: 'Payment via Internal Transfer',
      transferDesc: 'You can pay via local transfer (bank / exchange) to our account in Syria',
      transferInfo: 'Transfer Information',
      transferSenderName: 'Sender Name in Transfer',
      transferReference: 'Transfer Number or Code',
      transferSlip: 'Upload Transfer Slip',
      transferSlipRequired: 'Required: JPEG / PNG / PDF',
      transferNote: 'Please write shipment number in notes field when transferring',
      selectPayment: 'Select Payment Method',
      beneficiaryName: 'Beneficiary Name',
      accountInfo: 'Account Information',
      phone: 'Phone Number',
      note: 'Note',
    },
  };

  const t = translations[language];
  const isEUtoSY = direction === 'eu-sy';

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onTransferSlipChange(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Europe Payment (Mollie) */}
      {isEUtoSY && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100"
        >
          <div className="mb-4">
            <h3 className="text-xl font-bold text-primary-dark mb-2">
              {t.molliePayment}
            </h3>
            <p className="text-sm text-gray-600 mb-2">{t.mollieDesc}</p>
          </div>

          <div className="space-y-3">
            <motion.button
              onClick={() => onPaymentMethodChange('mollie')}
              className={`w-full p-4 rounded-xl border-2 transition-all ${
                paymentMethod === 'mollie'
                  ? 'border-primary-yellow bg-primary-yellow/10'
                  : 'border-gray-300 hover:border-primary-yellow/50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'mollie' ? 'border-primary-yellow bg-primary-yellow' : 'border-gray-300'
                  }`}>
                    {paymentMethod === 'mollie' && (
                      <div className="w-3 h-3 rounded-full bg-primary-dark" />
                    )}
                  </div>
                  <span className="font-semibold text-gray-800">{t.molliePayment}</span>
                </div>
              </div>
            </motion.button>

            {paymentMethod === 'mollie' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200 mt-4"
              >
                <p className="text-sm font-semibold text-blue-900 mb-2">{t.paymentMethods}:</p>
                <div className="flex flex-wrap gap-2">
                  {['Visa', 'MasterCard', 'iDEAL', 'SEPA', 'PayPal', 'Apple Pay', 'Google Pay', 'Klarna'].map(method => (
                    <span key={method} className="px-3 py-1 bg-white text-blue-900 text-xs rounded-full border border-blue-300">
                      {method}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-blue-700 mt-3">
                  {language === 'ar' 
                    ? 'سيتم توجيهك إلى صفحة الدفع الآمنة من Mollie' 
                    : 'You will be redirected to Mollie secure payment page'}
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* Syria Payment */}
      {!isEUtoSY && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100"
        >
          <div className="mb-4">
            <h3 className="text-xl font-bold text-primary-dark mb-2">
              {language === 'ar' ? 'الدفع في سورية' : 'Payment in Syria'}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              {language === 'ar' 
                ? 'لا يوجد حالياً دفع إلكتروني داخل سورية. يمكنك اختيار إحدى الطريقتين التاليتين:'
                : 'Currently no electronic payment in Syria. You can choose one of the following methods:'}
            </p>
          </div>

          <div className="space-y-4">
            {/* Cash Payment */}
            <motion.button
              onClick={() => onPaymentMethodChange('cash')}
              className={`w-full p-4 rounded-xl border-2 transition-all text-right ${
                paymentMethod === 'cash'
                  ? 'border-primary-yellow bg-primary-yellow/10'
                  : 'border-gray-300 hover:border-primary-yellow/50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'cash' ? 'border-primary-yellow bg-primary-yellow' : 'border-gray-300'
                  }`}>
                    {paymentMethod === 'cash' && (
                      <div className="w-3 h-3 rounded-full bg-primary-dark" />
                    )}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800 block">{t.cashPayment}</span>
                    <span className="text-xs text-gray-600">{t.cashDesc}</span>
                  </div>
                </div>
              </div>
            </motion.button>

            {/* Internal Transfer */}
            <motion.button
              onClick={() => onPaymentMethodChange('internal-transfer')}
              className={`w-full p-4 rounded-xl border-2 transition-all text-right ${
                paymentMethod === 'internal-transfer'
                  ? 'border-primary-yellow bg-primary-yellow/10'
                  : 'border-gray-300 hover:border-primary-yellow/50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'internal-transfer' ? 'border-primary-yellow bg-primary-yellow' : 'border-gray-300'
                  }`}>
                    {paymentMethod === 'internal-transfer' && (
                      <div className="w-3 h-3 rounded-full bg-primary-dark" />
                    )}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800 block">{t.transferPayment}</span>
                    <span className="text-xs text-gray-600">{t.transferDesc}</span>
                  </div>
                </div>
              </div>
            </motion.button>

            {/* Transfer Details */}
            {paymentMethod === 'internal-transfer' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200 mt-4 space-y-4"
              >
                <h4 className="font-bold text-purple-900">{t.transferInfo}</h4>
                
                {/* Account Information */}
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <p className="text-sm font-semibold text-gray-700 mb-2">{t.beneficiaryName}:</p>
                  <p className="text-gray-900 font-bold">شركة الإكرام التجارية</p>
                  <p className="text-sm text-gray-600 mt-2">{t.accountInfo}:</p>
                  <p className="text-gray-700">{language === 'ar' ? 'سيتم إضافتها لاحقاً' : 'Will be added later'}</p>
                  <p className="text-sm text-gray-600 mt-2">{t.phone}:</p>
                  <p className="text-gray-700">+963 995 477 8188</p>
                </div>

                <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-300">
                  <p className="text-xs text-yellow-800">{t.transferNote}</p>
                </div>

                {/* Transfer Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.transferSenderName} *
                    </label>
                    <input
                      type="text"
                      value={transferSenderName}
                      onChange={(e) => onTransferSenderNameChange(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                      placeholder={language === 'ar' ? 'الاسم كما يظهر في إيصال الحوالة' : 'Name as appears on transfer receipt'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.transferReference}
                    </label>
                    <input
                      type="text"
                      value={transferReference}
                      onChange={(e) => onTransferReferenceChange(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                      placeholder={language === 'ar' ? 'رقم أو كود الحوالة (إن وجد)' : 'Transfer number or code (if available)'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.transferSlip} * ({t.transferSlipRequired})
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                    />
                    {transferSlip && (
                      <p className="mt-2 text-sm text-green-600">
                        {language === 'ar' ? 'تم رفع الملف: ' : 'File uploaded: '}
                        {transferSlip.name}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* Europe Payment for SY→EU */}
      {!isEUtoSY && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100"
        >
          <div className="mb-4">
            <h3 className="text-xl font-bold text-primary-dark mb-2">
              {t.molliePayment}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              {language === 'ar' 
                ? 'يمكنك الدفع في أوروبا عبر Mollie'
                : 'You can pay in Europe via Mollie'}
            </p>
          </div>

          <div className="space-y-3">
            <motion.button
              onClick={() => onPaymentMethodChange('mollie')}
              className={`w-full p-4 rounded-xl border-2 transition-all ${
                paymentMethod === 'mollie'
                  ? 'border-primary-yellow bg-primary-yellow/10'
                  : 'border-gray-300 hover:border-primary-yellow/50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'mollie' ? 'border-primary-yellow bg-primary-yellow' : 'border-gray-300'
                  }`}>
                    {paymentMethod === 'mollie' && (
                      <div className="w-3 h-3 rounded-full bg-primary-dark" />
                    )}
                  </div>
                  <span className="font-semibold text-gray-800">{t.molliePayment}</span>
                </div>
              </div>
            </motion.button>

            {paymentMethod === 'mollie' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200 mt-4"
              >
                <p className="text-sm font-semibold text-blue-900 mb-2">{t.paymentMethods}:</p>
                <div className="flex flex-wrap gap-2">
                  {['Visa', 'MasterCard', 'iDEAL', 'SEPA', 'PayPal', 'Apple Pay', 'Google Pay', 'Klarna'].map(method => (
                    <span key={method} className="px-3 py-1 bg-white text-blue-900 text-xs rounded-full border border-blue-300">
                      {method}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

