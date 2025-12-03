"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShippingDirection } from "@/types/shipment";
import { PricingResult } from "@/types/pricing";
import Link from "next/link";
import { apiService } from "@/lib/api";

interface Step11ConfirmationProps {
  shipmentId: string;
  direction: ShippingDirection;
  pricing: PricingResult | null;
  language: "ar" | "en";
  grandTotalWithTransport?: number;
  hasInternalTransport?: boolean; // If Internal Transport in Europe is selected
  onStripePayment?: () => Promise<void>; // Stripe payment handler
  isProcessingPayment?: boolean; // Payment processing state
}

interface ShipmentData {
  sendcloud_label_url?: string;
  tracking_number?: string;
}

export default function Step11Confirmation({
  shipmentId,
  direction,
  pricing,
  language,
  grandTotalWithTransport,
  hasInternalTransport = false,
  onStripePayment,
  isProcessingPayment = false,
}: Step11ConfirmationProps) {
  const translations = {
    ar: {
      title: "تم إنشاء الشحنة بنجاح",
      shipmentId: "رقم الشحنة",
      successMessage: "تم إنشاء شحنتك بنجاح!",
      emailSent: "تم إرسال بريد تأكيد إلى بريدك الإلكتروني",
      documentsNote: "ستجد الوثائق في ملفك الشخصي ضمن تفاصيل شحنتك",
      nextSteps: "الخطوات التالية",
      nextStepsDesc: "سيتم التواصل معك قريباً لتأكيد تفاصيل الشحنة",
      backToHome: "العودة إلى الصفحة الرئيسية",
      totalPrice: "السعر الإجمالي",
      downloadLabel: "تحميل Label",
      shippingLabel: "Label الشحن",
      labelAvailable: "Label الشحن متاح للتحميل",
    },
    en: {
      title: "Shipment Created Successfully",
      shipmentId: "Shipment ID",
      successMessage: "Your shipment has been created successfully!",
      emailSent: "Confirmation email has been sent to your email",
      documentsNote:
        "You will find the documents in your profile within your shipment details",
      nextSteps: "Next Steps",
      nextStepsDesc: "We will contact you soon to confirm shipment details",
      backToHome: "Back to Home",
      totalPrice: "Total Price",
      downloadLabel: "Download Label",
      shippingLabel: "Shipping Label",
      labelAvailable: "Shipping label is available for download",
    },
  };

  const t = translations[language];
  const isEUtoSY = direction === "eu-sy";
  const [shipmentData, setShipmentData] = useState<ShipmentData | null>(null);
  const [loadingShipment, setLoadingShipment] = useState(false);

  // Fetch shipment data to check for label
  useEffect(() => {
    const fetchShipmentData = async () => {
      if (!shipmentId) return;

      try {
        setLoadingShipment(true);
        // Try to parse shipmentId as number
        const id = parseInt(shipmentId);
        if (isNaN(id)) {
          console.error("Invalid shipment ID:", shipmentId);
          return;
        }

        const response = await apiService.getShipment(id);
        if (response.data) {
          setShipmentData({
            sendcloud_label_url: response.data.sendcloud_label_url,
            tracking_number: response.data.tracking_number,
          });
        }
      } catch (error) {
        console.error("Error fetching shipment data:", error);
        // Don't show error to user, just silently fail
      } finally {
        setLoadingShipment(false);
      }
    };

    fetchShipmentData();

    // Poll for label if not available yet (check every 3 seconds, max 10 times)
    let pollCount = 0;
    const maxPolls = 10;
    const pollInterval = setInterval(async () => {
      if (pollCount >= maxPolls || shipmentData?.sendcloud_label_url) {
        clearInterval(pollInterval);
        return;
      }

      pollCount++;
      try {
        const id = parseInt(shipmentId);
        if (isNaN(id)) return;

        const response = await apiService.getShipment(id);
        if (response.data?.sendcloud_label_url) {
          setShipmentData({
            sendcloud_label_url: response.data.sendcloud_label_url,
            tracking_number: response.data.tracking_number,
          });
          clearInterval(pollInterval);
        }
      } catch (error) {
        // Silently fail
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [shipmentId]);

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
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
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
        <p className="text-sm font-semibold text-primary-dark mb-2">
          {t.shipmentId}
        </p>
        <p className="text-4xl font-black text-primary-dark">{shipmentId}</p>
      </motion.div>

      {/* Total Price */}
      {(pricing || grandTotalWithTransport) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100"
        >
          <p className="text-sm font-semibold text-gray-700 mb-2">
            {t.totalPrice}
          </p>
          <p className="text-3xl font-bold text-primary-dark">
            {Number(
              grandTotalWithTransport || pricing?.grandTotal || 0
            ).toFixed(2)}{" "}
            €
          </p>
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

      {/* Shipping Label (if available) */}
      {shipmentData?.sendcloud_label_url && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
          className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-200"
        >
          <h3 className="text-xl font-bold text-primary-dark mb-2">
            {t.shippingLabel}
          </h3>
          <p className="text-sm text-gray-600 mb-4">{t.labelAvailable}</p>
          {shipmentData.tracking_number && (
            <p className="text-sm text-gray-700 mb-4">
              <span className="font-semibold">
                {language === "ar" ? "رقم التتبع:" : "Tracking Number:"}
              </span>{" "}
              {shipmentData.tracking_number}
            </p>
          )}
          <div className="flex justify-center">
            <motion.a
              href={shipmentData.sendcloud_label_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              {t.downloadLabel}
            </motion.a>
          </div>
        </motion.div>
      )}

      {/* Documents Note (All directions) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-blue-50 rounded-2xl p-6 shadow-lg border-2 border-blue-200"
      >
        <div className="flex items-center justify-center gap-3 mb-2">
          <svg
            className="w-6 h-6 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-base font-semibold text-blue-900">
            {t.documentsNote}
          </p>
        </div>
      </motion.div>

      {/* Stripe Payment - Only show if Internal Transport is selected */}
      {hasInternalTransport && isEUtoSY && onStripePayment && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95 }}
          className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-200"
        >
          <h3 className="text-xl font-bold text-primary-dark mb-2">
            {language === "ar" ? "الدفع عبر Stripe" : "Pay via Stripe"}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {language === "ar"
              ? "يمكنك الدفع الآن عبر Stripe لاستكمال عملية الشحن"
              : "You can pay now via Stripe to complete the shipping process"}
          </p>
          {grandTotalWithTransport && grandTotalWithTransport > 0 && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-300 mb-4">
              <p className="text-sm font-semibold text-blue-900 mb-1">
                {language === "ar" ? "المبلغ الإجمالي:" : "Total Amount:"}
              </p>
              <p className="text-2xl font-bold text-blue-900">
                €{Number(grandTotalWithTransport || 0).toFixed(2)}
              </p>
            </div>
          )}
          <motion.button
            onClick={onStripePayment}
            disabled={
              isProcessingPayment ||
              !grandTotalWithTransport ||
              grandTotalWithTransport <= 0
            }
            className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all ${
              isProcessingPayment ||
              !grandTotalWithTransport ||
              grandTotalWithTransport <= 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl"
            }`}
            whileHover={
              !isProcessingPayment &&
              grandTotalWithTransport &&
              grandTotalWithTransport > 0
                ? { scale: 1.02 }
                : {}
            }
            whileTap={
              !isProcessingPayment &&
              grandTotalWithTransport &&
              grandTotalWithTransport > 0
                ? { scale: 0.98 }
                : {}
            }
          >
            {isProcessingPayment
              ? language === "ar"
                ? "جاري التوجيه..."
                : "Redirecting..."
              : language === "ar"
              ? "الدفع الآن عبر Stripe"
              : "Pay Now via Stripe"}
          </motion.button>
          <p className="text-xs text-blue-700 mt-3">
            {language === "ar"
              ? "سيتم توجيهك إلى صفحة الدفع الآمنة من Stripe"
              : "You will be redirected to Stripe secure payment page"}
          </p>
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
