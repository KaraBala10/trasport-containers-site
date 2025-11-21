"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShippingDirection } from '@/types/shipment';
import { PricingResult } from '@/types/pricing';
import Link from 'next/link';
import { apiService } from '@/lib/api';

interface Step11ConfirmationProps {
  shipmentId: string;
  direction: ShippingDirection;
  pricing: PricingResult | null;
  language: 'ar' | 'en';
}

export default function Step11Confirmation({
  shipmentId,
  direction,
  pricing,
  language,
}: Step11ConfirmationProps) {
  const translations = {
    ar: {
      title: 'تم إنشاء الشحنة بنجاح',
      shipmentId: 'رقم الشحنة',
      successMessage: 'تم إنشاء شحنتك بنجاح!',
      emailSent: 'تم إرسال بريد تأكيد إلى بريدك الإلكتروني',
      documents: 'المستندات',
      packingList: 'Packing List',
      commercialInvoice: 'Commercial Invoice',
      downloadPackingList: 'تحميل Packing List',
      downloadInvoice: 'تحميل الفاتورة',
      documentsNote: 'المستندات متاحة للتحميل (EU→SY فقط)',
      nextSteps: 'الخطوات التالية',
      nextStepsDesc: 'سيتم التواصل معك قريباً لتأكيد تفاصيل الشحنة',
      backToHome: 'العودة إلى الصفحة الرئيسية',
      totalPrice: 'السعر الإجمالي',
    },
    en: {
      title: 'Shipment Created Successfully',
      shipmentId: 'Shipment ID',
      successMessage: 'Your shipment has been created successfully!',
      emailSent: 'Confirmation email has been sent to your email',
      documents: 'Documents',
      packingList: 'Packing List',
      commercialInvoice: 'Commercial Invoice',
      downloadPackingList: 'Download Packing List',
      downloadInvoice: 'Download Invoice',
      documentsNote: 'Documents available for download (EU→SY only)',
      nextSteps: 'Next Steps',
      nextStepsDesc: 'We will contact you soon to confirm shipment details',
      backToHome: 'Back to Home',
      totalPrice: 'Total Price',
    },
  };

  const t = translations[language];
  const isEUtoSY = direction === 'eu-sy';
  const [downloadingPackingList, setDownloadingPackingList] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  const handleDownloadPackingList = async () => {
    try {
      setDownloadingPackingList(true);
      const response = await apiService.downloadPackingList(shipmentId);
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Packing-List-${shipmentId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading Packing List:', error);
      alert(language === 'ar' 
        ? 'حدث خطأ أثناء تحميل Packing List. يرجى المحاولة لاحقاً.' 
        : 'Error downloading Packing List. Please try again later.');
    } finally {
      setDownloadingPackingList(false);
    }
  };

  const handleDownloadCommercialInvoice = async () => {
    try {
      setDownloadingInvoice(true);
      const response = await apiService.downloadCommercialInvoice(shipmentId);
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Commercial-Invoice-${shipmentId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading Commercial Invoice:', error);
      alert(language === 'ar' 
        ? 'حدث خطأ أثناء تحميل الفاتورة التجارية. يرجى المحاولة لاحقاً.' 
        : 'Error downloading Commercial Invoice. Please try again later.');
    } finally {
      setDownloadingInvoice(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-8"
    >
      {/* Success Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="flex justify-center"
      >
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
          <motion.svg
            className="w-16 h-16 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </motion.svg>
        </div>
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-4xl font-bold text-primary-dark"
      >
        {t.title}
      </motion.h2>

      {/* Success Message */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-lg text-gray-700"
      >
        {t.successMessage}
      </motion.p>

      {/* Shipment ID */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-primary-yellow to-primary-yellow/90 rounded-2xl p-8 shadow-2xl border-4 border-primary-dark"
      >
        <p className="text-sm font-semibold text-primary-dark mb-2">{t.shipmentId}</p>
        <p className="text-4xl font-black text-primary-dark">{shipmentId}</p>
      </motion.div>

      {/* Total Price */}
      {pricing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100"
        >
          <p className="text-sm font-semibold text-gray-700 mb-2">{t.totalPrice}</p>
          <p className="text-3xl font-bold text-primary-dark">{pricing.grandTotal.toFixed(2)} €</p>
        </motion.div>
      )}

      {/* Email Sent Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200"
      >
        <p className="text-sm text-blue-800">{t.emailSent}</p>
      </motion.div>

      {/* Documents (EU→SY only) */}
      {isEUtoSY && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100"
        >
          <h3 className="text-xl font-bold text-primary-dark mb-4">{t.documents}</h3>
          <p className="text-sm text-gray-600 mb-4">{t.documentsNote}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              className="px-6 py-3 bg-primary-dark text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={!downloadingPackingList ? { scale: 1.05 } : {}}
              whileTap={!downloadingPackingList ? { scale: 0.95 } : {}}
              onClick={handleDownloadPackingList}
              disabled={downloadingPackingList}
            >
              {downloadingPackingList 
                ? (language === 'ar' ? 'جاري التحميل...' : 'Downloading...')
                : t.downloadPackingList}
            </motion.button>
            <motion.button
              className="px-6 py-3 bg-primary-dark text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={!downloadingInvoice ? { scale: 1.05 } : {}}
              whileTap={!downloadingInvoice ? { scale: 0.95 } : {}}
              onClick={handleDownloadCommercialInvoice}
              disabled={downloadingInvoice}
            >
              {downloadingInvoice 
                ? (language === 'ar' ? 'جاري التحميل...' : 'Downloading...')
                : t.downloadInvoice}
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Next Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200"
      >
        <h3 className="text-lg font-bold text-gray-800 mb-2">{t.nextSteps}</h3>
        <p className="text-sm text-gray-600">{t.nextStepsDesc}</p>
      </motion.div>

      {/* Back to Home Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
      >
        <Link href="/">
          <motion.button
            className="px-12 py-4 bg-primary-yellow text-primary-dark font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {t.backToHome}
          </motion.button>
        </Link>
      </motion.div>
    </motion.div>
  );
}

