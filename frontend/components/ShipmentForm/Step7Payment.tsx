"use client";

import { motion } from 'framer-motion';
import { ShipmentData } from '@/types/shipment';
import FormContainer from './FormContainer';

interface Step7PaymentProps {
  data: ShipmentData;
  onChange: (field: keyof ShipmentData, value: any) => void;
  pricing: { total: number };
  language: 'ar' | 'en';
}

export default function Step7Payment({ data, onChange, pricing, language }: Step7PaymentProps) {
  const translations = {
    ar: {
      title: 'الدفع',
      description: 'اختر طريقة الدفع المناسبة',
      syriaPayment: 'الدفع في سورية',
      syriaPaymentDesc: 'كاش أو تحويل داخلي',
      europePayment: 'الدفع في أوروبا',
      europePaymentDesc: 'Mollie أو تحويل بنكي',
      cash: 'الدفع نقدًا في مركز حلب',
      cashDesc: 'تدفع كامل مبلغ الشحن نقدًا عند تسليم الطرود في مركزنا في حلب',
      internalTransfer: 'الدفع عبر تحويل داخلي',
      internalTransferDesc: 'يمكنك الدفع عبر حوالة محلية (بنك / صرّاف / شركات تحويل)',
      molliePayment: 'الدفع عبر Mollie',
      molliePaymentDesc: 'iDeal, Credit Card, Bancontact, SEPA, PayPal',
      bankTransfer: 'تحويل بنكي أوروبي',
      bankTransferDesc: 'تحويل SEPA إلى حسابنا في هولندا',
      transferInfo: 'معلومات التحويل',
      beneficiaryName: 'اسم المستفيد',
      referenceNote: 'ملاحظة مهمة',
      referenceNoteDesc: 'يُرجى كتابة رقم الشحنة في خانة الملاحظة عند التحويل',
      transferType: 'نوع التحويل',
      selectType: 'اختر النوع',
      exchangeOffice: 'حوالة صراف',
      bank: 'بنك',
      transferCompany: 'شركات تحويل',
      senderName: 'اسم المرسل في الحوالة',
      senderNamePlaceholder: 'الاسم كما يظهر في إيصال الحوالة',
      transferCode: 'رقم أو كود الحوالة',
      transferCodePlaceholder: 'إن وجد',
      amount: 'مبلغ الحوالة',
      uploadSlip: 'رفع صورة إيصال الحوالة',
      uploadSlipDesc: 'إجباري',
      totalAmount: 'المبلغ الإجمالي',
    },
    en: {
      title: 'Payment',
      description: 'Choose your preferred payment method',
      syriaPayment: 'Payment in Syria',
      syriaPaymentDesc: 'Cash or internal transfer',
      europePayment: 'Payment in Europe',
      europePaymentDesc: 'Mollie or bank transfer',
      cash: 'Cash Payment at Aleppo Center',
      cashDesc: 'Pay the full shipment amount in cash when delivering parcels at our Aleppo center',
      internalTransfer: 'Internal Transfer Payment',
      internalTransferDesc: 'You can pay via local transfer (bank / exchange / transfer companies)',
      molliePayment: 'Pay via Mollie',
      molliePaymentDesc: 'iDeal, Credit Card, Bancontact, SEPA, PayPal',
      bankTransfer: 'European Bank Transfer',
      bankTransferDesc: 'SEPA transfer to our account in Netherlands',
      transferInfo: 'Transfer Information',
      beneficiaryName: 'Beneficiary Name',
      referenceNote: 'Important Note',
      referenceNoteDesc: 'Please write the shipment number in the note field when transferring',
      transferType: 'Transfer Type',
      selectType: 'Select Type',
      exchangeOffice: 'Exchange Office',
      bank: 'Bank',
      transferCompany: 'Transfer Company',
      senderName: 'Sender Name on Transfer',
      senderNamePlaceholder: 'Name as shown on transfer receipt',
      transferCode: 'Transfer Number or Code',
      transferCodePlaceholder: 'If available',
      amount: 'Transfer Amount',
      uploadSlip: 'Upload Transfer Receipt',
      uploadSlipDesc: 'Required',
      totalAmount: 'Total Amount',
    },
  };

  const t = translations[language];

  const showSyriaPayment = data.direction === 'sy-eu' || (data.syriaDeliveryProvince && data.syriaDeliveryProvince !== 'aleppo');
  const showEuropePayment = data.direction === 'eu-sy';

  const PaymentCard = ({ id, title, description, icon, selected, onClick }: any) => (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        w-full text-right p-8 rounded-3xl transition-all duration-300 shadow-xl
        ${selected
          ? 'bg-gradient-to-br from-primary-dark to-blue-700 text-white ring-4 ring-primary-yellow'
          : 'bg-white text-gray-800 hover:shadow-2xl border-2 border-gray-200'
        }
      `}
    >
      <div className="flex items-center gap-6">
        <div className={`
          w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-lg
          ${selected ? 'bg-primary-yellow' : 'bg-gray-100'}
        `}>
          {icon}
        </div>
        <div className="flex-1 text-right">
          <div className="text-2xl font-black mb-2">{title}</div>
          <div className={`text-sm ${selected ? 'opacity-90' : 'text-gray-600'}`}>
            {description}
          </div>
        </div>
        {selected && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            className="w-12 h-12 bg-primary-yellow rounded-full flex items-center justify-center text-primary-dark text-2xl font-black"
          >
            ✓
          </motion.div>
        )}
      </div>
    </motion.button>
  );

  return (
    <FormContainer>
      <div className="space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.3, 1] }}
            transition={{ duration: 0.6 }}
            className="inline-block text-7xl"
          >
            💳
          </motion.div>
          
          <h2 className="text-5xl font-black text-primary-dark">
            {t.title}
          </h2>
          
          <p className="text-xl text-gray-600 font-medium">
            {t.description}
          </p>

          {/* Total Amount Display */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-block bg-gradient-to-r from-green-500 to-emerald-600 text-white px-12 py-6 rounded-3xl shadow-2xl mt-6"
          >
            <div className="text-lg font-bold opacity-90 mb-2">{t.totalAmount}</div>
            <div className="text-5xl font-black">{pricing.total.toFixed(2)} €</div>
          </motion.div>
        </div>

        {/* Syria Payment */}
        {showSyriaPayment && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-3xl p-6 border-2 border-blue-300">
              <div className="flex items-center gap-4">
                <span className="text-4xl">🇸🇾</span>
                <div>
                  <h3 className="text-2xl font-black text-blue-900">{t.syriaPayment}</h3>
                  <p className="text-blue-700 font-medium">{t.syriaPaymentDesc}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <PaymentCard
                id="cash"
                title={t.cash}
                description={t.cashDesc}
                icon="💵"
                selected={data.paymentMethod === 'cash'}
                onClick={() => onChange('paymentMethod', 'cash')}
              />

              <PaymentCard
                id="internal_transfer"
                title={t.internalTransfer}
                description={t.internalTransferDesc}
                icon="🏦"
                selected={data.paymentMethod === 'internal_transfer'}
                onClick={() => onChange('paymentMethod', 'internal_transfer')}
              />
            </div>

            {/* Internal Transfer Details */}
            {data.paymentMethod === 'internal_transfer' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-3xl p-8 shadow-xl border-2 border-yellow-300 space-y-6"
              >
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <h4 className="text-xl font-black text-yellow-900 mb-4">{t.transferInfo}</h4>
                  <div className="space-y-3 text-right">
                    <div>
                      <span className="text-gray-600 font-medium">{t.beneficiaryName}:</span>
                      <span className="font-black text-yellow-900 mr-2">شركة الإكرام التجارية</span>
                    </div>
                    <div className="bg-yellow-100 rounded-lg p-4 mt-4">
                      <span className="text-yellow-900 font-bold text-sm">
                        ⚠️ {t.referenceNote}: {t.referenceNoteDesc}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-lg font-bold text-yellow-900 mb-2">
                      {t.transferType} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={data.transferType || ''}
                      onChange={(e) => onChange('transferType', e.target.value)}
                      className="w-full px-6 py-4 border-3 border-yellow-300 rounded-2xl text-lg focus:ring-4 focus:ring-yellow-500 transition-all shadow-lg bg-white"
                    >
                      <option value="">{t.selectType}</option>
                      <option value="exchange">{t.exchangeOffice}</option>
                      <option value="bank">{t.bank}</option>
                      <option value="transfer_company">{t.transferCompany}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-lg font-bold text-yellow-900 mb-2">
                      {t.senderName} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={data.transferSenderName || ''}
                      onChange={(e) => onChange('transferSenderName', e.target.value)}
                      placeholder={t.senderNamePlaceholder}
                      className="w-full px-6 py-4 border-3 border-yellow-300 rounded-2xl text-lg focus:ring-4 focus:ring-yellow-500 transition-all shadow-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-lg font-bold text-yellow-900 mb-2">
                      {t.transferCode}
                    </label>
                    <input
                      type="text"
                      value={data.transferCode || ''}
                      onChange={(e) => onChange('transferCode', e.target.value)}
                      placeholder={t.transferCodePlaceholder}
                      className="w-full px-6 py-4 border-3 border-yellow-300 rounded-2xl text-lg focus:ring-4 focus:ring-yellow-500 transition-all shadow-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-lg font-bold text-yellow-900 mb-2">
                      {t.amount}
                    </label>
                    <input
                      type="text"
                      value={`${pricing.total.toFixed(2)} €`}
                      disabled
                      className="w-full px-6 py-4 border-3 border-yellow-300 rounded-2xl text-lg bg-gray-100 font-black text-yellow-900 shadow-lg"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-lg font-bold text-yellow-900 mb-2">
                      {t.uploadSlip} <span className="text-red-500">*</span>
                    </label>
                    <p className="text-sm text-yellow-700 mb-3">{t.uploadSlipDesc}</p>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => onChange('transferSlip', e.target.files?.[0])}
                      className="w-full px-6 py-4 border-3 border-yellow-300 rounded-2xl text-lg focus:ring-4 focus:ring-yellow-500 transition-all shadow-lg bg-white"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Europe Payment */}
        {showEuropePayment && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-3xl p-6 border-2 border-purple-300">
              <div className="flex items-center gap-4">
                <span className="text-4xl">🇪🇺</span>
                <div>
                  <h3 className="text-2xl font-black text-purple-900">{t.europePayment}</h3>
                  <p className="text-purple-700 font-medium">{t.europePaymentDesc}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <PaymentCard
                id="mollie"
                title={t.molliePayment}
                description={t.molliePaymentDesc}
                icon="💳"
                selected={data.paymentMethod === 'mollie'}
                onClick={() => onChange('paymentMethod', 'mollie')}
              />

              <PaymentCard
                id="bank_transfer_eu"
                title={t.bankTransfer}
                description={t.bankTransferDesc}
                icon="🏦"
                selected={data.paymentMethod === 'bank_transfer_eu'}
                onClick={() => onChange('paymentMethod', 'bank_transfer_eu')}
              />
            </div>

            {/* Mollie Integration Note */}
            {data.paymentMethod === 'mollie' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 shadow-xl border-2 border-blue-300"
              >
                <div className="text-center space-y-4">
                  <div className="text-5xl">💳</div>
                  <h4 className="text-2xl font-black text-blue-900">
                    {language === 'ar' ? 'سيتم تحويلك إلى صفحة الدفع' : 'You will be redirected to payment page'}
                  </h4>
                  <p className="text-blue-700">
                    {language === 'ar'
                      ? 'بعد تأكيد الشحنة، سيتم تحويلك إلى صفحة Mollie الآمنة لإتمام الدفع'
                      : 'After confirming the shipment, you will be redirected to Mollie\'s secure payment page'}
                  </p>
                  <div className="flex justify-center gap-4 pt-4">
                    <div className="bg-white rounded-xl p-3 shadow-lg">iDeal</div>
                    <div className="bg-white rounded-xl p-3 shadow-lg">Visa</div>
                    <div className="bg-white rounded-xl p-3 shadow-lg">Mastercard</div>
                    <div className="bg-white rounded-xl p-3 shadow-lg">PayPal</div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </FormContainer>
  );
}

