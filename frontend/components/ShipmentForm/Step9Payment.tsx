"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ShippingDirection } from "@/types/shipment";
import { useReCaptcha } from "@/components/ReCaptchaWrapper";

interface Step9PaymentProps {
  direction: ShippingDirection;
  paymentMethod: "stripe" | "cash" | "internal-transfer" | null;
  onPaymentMethodChange: (
    method: "stripe" | "cash" | "internal-transfer" | null
  ) => void;
  transferSenderName: string;
  transferReference: string;
  transferSlip: File | null;
  onTransferSenderNameChange: (name: string) => void;
  onTransferReferenceChange: (reference: string) => void;
  onTransferSlipChange: (file: File | null) => void;
  language: "ar" | "en";
  grandTotal?: number;
  onStripePayment?: () => Promise<void>;
  isProcessingPayment?: boolean;
  hasInternalTransport?: boolean; // If Internal Transport in Europe is selected
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
  grandTotal = 0,
  onStripePayment,
  isProcessingPayment = false,
  hasInternalTransport = false,
}: Step9PaymentProps) {
  const { executeRecaptcha } = useReCaptcha();
  const [recaptchaError, setRecaptchaError] = useState<string>("");

  // Check if reCAPTCHA is available
  const recaptchaSiteKey =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""
      : "";
  const isDevelopment = process.env.NODE_ENV === "development";
  const isRecaptchaRequired = !!recaptchaSiteKey && !isDevelopment;
  const isRecaptchaReady = !isRecaptchaRequired || !!executeRecaptcha;
  const isRecaptchaValid =
    !isRecaptchaRequired || (isRecaptchaReady && !recaptchaError);

  const handleStripePaymentClick = async () => {
    if (!onStripePayment) return;

    // Clear previous errors
    setRecaptchaError("");

    // Execute reCAPTCHA before payment
    if (isRecaptchaRequired && executeRecaptcha) {
      try {
        await executeRecaptcha("stripe_payment");
        // reCAPTCHA successful, proceed with payment
        await onStripePayment();
      } catch (error) {
        console.error("reCAPTCHA verification failed:", error);
        setRecaptchaError(
          language === "ar"
            ? "فشل التحقق من reCAPTCHA. يرجى المحاولة مرة أخرى."
            : "reCAPTCHA verification failed. Please try again."
        );
        return;
      }
    } else if (isRecaptchaRequired && !executeRecaptcha) {
      // reCAPTCHA is required but not available
      setRecaptchaError(
        language === "ar"
          ? "التحقق من reCAPTCHA مطلوب. يرجى الانتظار..."
          : "reCAPTCHA verification is required. Please wait..."
      );
      return;
    } else {
      // reCAPTCHA not required, proceed directly
      await onStripePayment();
    }
  };

  const translations = {
    ar: {
      title: "طريقة الدفع",
      stripePayment: "الدفع عبر Stripe",
      stripeDesc:
        "ادفع بأمان عبر Stripe - جميع طرق الدفع متاحة (بطاقات بنكية، Apple Pay، Google Pay)",
      paymentMethods: "طرق الدفع المتاحة",
      cashPayment: "الدفع نقداً في المركز",
      cashDesc: "دفع كامل قيمة الشحن نقداً عند تسليم الطرود في المركز",
      transferPayment: "الدفع عبر تحويل داخلي",
      transferDesc:
        "يمكنك الدفع عبر حوالة محلية (بنك / صرّاف) إلى حسابنا داخل سورية",
      transferInfo: "معلومات التحويل",
      transferSenderName: "اسم المرسل في الحوالة",
      transferReference: "رقم أو كود الحوالة",
      transferSlip: "رفع صورة إيصال الحوالة",
      transferSlipRequired: "مطلوب: JPEG / PNG / PDF",
      transferNote: "يُرجى كتابة رقم الشحنة في خانة الملاحظة عند التحويل",
      selectPayment: "اختر طريقة الدفع",
      beneficiaryName: "اسم المستفيد",
      accountInfo: "معلومات الحساب",
      phone: "رقم الهاتف",
      note: "ملاحظة",
    },
    en: {
      title: "Payment Method",
      stripePayment: "Pay via Stripe",
      stripeDesc:
        "Pay securely via Stripe - all payment methods available (Credit Cards, Apple Pay, Google Pay)",
      paymentMethods: "Available Payment Methods",
      cashPayment: "Cash Payment at Middle East Center",
      cashDesc:
        "Pay full shipping amount in cash when delivering parcels at our center in the Middle East",
      transferPayment: "Payment via Internal Transfer",
      transferDesc:
        "You can pay via local transfer (bank / exchange) to our account in the Middle East",
      transferInfo: "Transfer Information",
      transferSenderName: "Sender Name in Transfer",
      transferReference: "Transfer Number or Code",
      transferSlip: "Upload Transfer Slip",
      transferSlipRequired: "Required: JPEG / PNG / PDF",
      transferNote:
        "Please write shipment number in notes field when transferring",
      selectPayment: "Select Payment Method",
      beneficiaryName: "Beneficiary Name",
      accountInfo: "Account Information",
      phone: "Phone Number",
      note: "Note",
    },
  };

  const t = translations[language];
  const isEUtoSY = direction === "eu-sy";

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onTransferSlipChange(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Stripe Payment (Europe) */}
      {isEUtoSY && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100"
        >
          <div className="mb-4">
            <h3 className="text-xl font-bold text-primary-dark mb-2">
              {t.stripePayment}
            </h3>
            <p className="text-sm text-gray-600 mb-2">{t.stripeDesc}</p>
          </div>

          <div className="space-y-3">
            <motion.button
              onClick={() => onPaymentMethodChange("stripe")}
              className={`w-full p-4 rounded-xl border-2 transition-all ${
                paymentMethod === "stripe"
                  ? "border-primary-yellow bg-primary-yellow/10"
                  : "border-gray-300 hover:border-primary-yellow/50"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === "stripe"
                        ? "border-primary-yellow bg-primary-yellow"
                        : "border-gray-300"
                    }`}
                  >
                    {paymentMethod === "stripe" && (
                      <div className="w-3 h-3 rounded-full bg-primary-dark" />
                    )}
                  </div>
                  <span className="font-semibold text-gray-800">
                    {t.stripePayment}
                  </span>
                </div>
              </div>
            </motion.button>

            {paymentMethod === "stripe" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200 mt-4 space-y-4"
              >
                <p className="text-sm font-semibold text-blue-900 mb-2">
                  {t.paymentMethods}:
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Visa",
                    "MasterCard",
                    "American Express",
                    "Apple Pay",
                    "Google Pay",
                    "Link",
                  ].map((method) => (
                    <span
                      key={method}
                      className="px-3 py-1 bg-white text-blue-900 text-xs rounded-full border border-blue-300"
                    >
                      {method}
                    </span>
                  ))}
                </div>
                {grandTotal > 0 && (
                  <div className="bg-white rounded-lg p-3 border border-blue-300">
                    <p className="text-sm font-semibold text-blue-900 mb-1">
                      {language === "ar" ? "المبلغ الإجمالي:" : "Total Amount:"}
                    </p>
                    <p className="text-xl font-bold text-blue-900">
                      €{Number(grandTotal || 0).toFixed(2)}
                    </p>
                  </div>
                )}
                {onStripePayment && (
                  <>
                    {recaptchaError && (
                      <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r-lg mb-4">
                        <p className="text-sm font-medium">{recaptchaError}</p>
                      </div>
                    )}
                    <motion.button
                      onClick={handleStripePaymentClick}
                      disabled={
                        isProcessingPayment ||
                        grandTotal <= 0 ||
                        !isRecaptchaValid ||
                        !isRecaptchaReady
                      }
                      className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all ${
                        isProcessingPayment ||
                        grandTotal <= 0 ||
                        !isRecaptchaValid ||
                        !isRecaptchaReady
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl"
                      }`}
                      whileHover={
                        !isProcessingPayment &&
                        grandTotal > 0 &&
                        isRecaptchaValid &&
                        isRecaptchaReady
                          ? { scale: 1.02 }
                          : {}
                      }
                      whileTap={
                        !isProcessingPayment &&
                        grandTotal > 0 &&
                        isRecaptchaValid &&
                        isRecaptchaReady
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
                  </>
                )}
                <p className="text-xs text-blue-700">
                  {language === "ar"
                    ? "سيتم توجيهك إلى صفحة الدفع الآمنة من Stripe"
                    : "You will be redirected to Stripe secure payment page"}
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* Syria Payment for EU→SY - Hide if Internal Transport is selected */}
      {isEUtoSY && !hasInternalTransport && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100"
        >
          <div className="mb-4">
            <h3 className="text-xl font-bold text-primary-dark mb-2">
              {language === "ar"
                ? "الدفع في الشرق الأوسط"
                : "Payment in the Middle East"}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              {language === "ar"
                ? "يمكنك اختيار الدفع في الشرق الأوسط عند استلام الطرود"
                : "You can choose to pay in the Middle East when receiving parcels"}
            </p>
          </div>

          <div className="space-y-4">
            {/* Cash Payment */}
            <motion.button
              onClick={() => onPaymentMethodChange("cash")}
              className={`w-full p-4 rounded-xl border-2 transition-all text-right ${
                paymentMethod === "cash"
                  ? "border-primary-yellow bg-primary-yellow/10"
                  : "border-gray-300 hover:border-primary-yellow/50"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === "cash"
                        ? "border-primary-yellow bg-primary-yellow"
                        : "border-gray-300"
                    }`}
                  >
                    {paymentMethod === "cash" && (
                      <div className="w-3 h-3 rounded-full bg-primary-dark" />
                    )}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800 block">
                      {t.cashPayment}
                    </span>
                    <span className="text-xs text-gray-600">{t.cashDesc}</span>
                  </div>
                </div>
              </div>
            </motion.button>

            {/* Internal Transfer */}
            <motion.button
              onClick={() => onPaymentMethodChange("internal-transfer")}
              className={`w-full p-4 rounded-xl border-2 transition-all text-right ${
                paymentMethod === "internal-transfer"
                  ? "border-primary-yellow bg-primary-yellow/10"
                  : "border-gray-300 hover:border-primary-yellow/50"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === "internal-transfer"
                        ? "border-primary-yellow bg-primary-yellow"
                        : "border-gray-300"
                    }`}
                  >
                    {paymentMethod === "internal-transfer" && (
                      <div className="w-3 h-3 rounded-full bg-primary-dark" />
                    )}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800 block">
                      {t.transferPayment}
                    </span>
                    <span className="text-xs text-gray-600">
                      {t.transferDesc}
                    </span>
                  </div>
                </div>
              </div>
            </motion.button>

            {/* Transfer Details */}
            {paymentMethod === "internal-transfer" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200 mt-4 space-y-4"
              >
                <h4 className="font-bold text-purple-900">{t.transferInfo}</h4>

                {/* Account Information */}
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    {t.beneficiaryName}:
                  </p>
                  <p className="text-gray-900 font-bold">
                    شركة الإكرام التجارية
                  </p>
                  <p className="text-sm text-gray-600 mt-2">{t.accountInfo}:</p>
                  <p className="text-gray-700">
                    {language === "ar"
                      ? "سيتم إضافتها لاحقاً"
                      : "Will be added later"}
                  </p>
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
                      onChange={(e) =>
                        onTransferSenderNameChange(e.target.value)
                      }
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                      placeholder={
                        language === "ar"
                          ? "الاسم كما يظهر في إيصال الحوالة"
                          : "Name as appears on transfer receipt"
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.transferReference}
                    </label>
                    <input
                      type="text"
                      value={transferReference}
                      onChange={(e) =>
                        onTransferReferenceChange(e.target.value)
                      }
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                      placeholder={
                        language === "ar"
                          ? "رقم أو كود الحوالة (إن وجد)"
                          : "Transfer number or code (if available)"
                      }
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
                        {language === "ar"
                          ? "تم رفع الملف: "
                          : "File uploaded: "}
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

      {/* Syria Payment */}
      {!isEUtoSY && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100"
        >
          <div className="mb-4">
            <h3 className="text-xl font-bold text-primary-dark mb-2">
              {language === "ar"
                ? "الدفع في الشرق الأوسط"
                : "Payment in the Middle East"}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              {language === "ar"
                ? "لا يوجد حالياً دفع إلكتروني داخل الشرق الأوسط. يمكنك اختيار إحدى الطريقتين التاليتين:"
                : "Currently no electronic payment in the Middle East. You can choose one of the following methods:"}
            </p>
          </div>

          <div className="space-y-4">
            {/* Cash Payment */}
            <motion.button
              onClick={() => onPaymentMethodChange("cash")}
              className={`w-full p-4 rounded-xl border-2 transition-all text-right ${
                paymentMethod === "cash"
                  ? "border-primary-yellow bg-primary-yellow/10"
                  : "border-gray-300 hover:border-primary-yellow/50"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === "cash"
                        ? "border-primary-yellow bg-primary-yellow"
                        : "border-gray-300"
                    }`}
                  >
                    {paymentMethod === "cash" && (
                      <div className="w-3 h-3 rounded-full bg-primary-dark" />
                    )}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800 block">
                      {t.cashPayment}
                    </span>
                    <span className="text-xs text-gray-600">{t.cashDesc}</span>
                  </div>
                </div>
              </div>
            </motion.button>

            {/* Internal Transfer */}
            <motion.button
              onClick={() => onPaymentMethodChange("internal-transfer")}
              className={`w-full p-4 rounded-xl border-2 transition-all text-right ${
                paymentMethod === "internal-transfer"
                  ? "border-primary-yellow bg-primary-yellow/10"
                  : "border-gray-300 hover:border-primary-yellow/50"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === "internal-transfer"
                        ? "border-primary-yellow bg-primary-yellow"
                        : "border-gray-300"
                    }`}
                  >
                    {paymentMethod === "internal-transfer" && (
                      <div className="w-3 h-3 rounded-full bg-primary-dark" />
                    )}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800 block">
                      {t.transferPayment}
                    </span>
                    <span className="text-xs text-gray-600">
                      {t.transferDesc}
                    </span>
                  </div>
                </div>
              </div>
            </motion.button>

            {/* Transfer Details */}
            {paymentMethod === "internal-transfer" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200 mt-4 space-y-4"
              >
                <h4 className="font-bold text-purple-900">{t.transferInfo}</h4>

                {/* Account Information */}
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    {t.beneficiaryName}:
                  </p>
                  <p className="text-gray-900 font-bold">
                    شركة الإكرام التجارية
                  </p>
                  <p className="text-sm text-gray-600 mt-2">{t.accountInfo}:</p>
                  <p className="text-gray-700">
                    {language === "ar"
                      ? "سيتم إضافتها لاحقاً"
                      : "Will be added later"}
                  </p>
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
                      onChange={(e) =>
                        onTransferSenderNameChange(e.target.value)
                      }
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                      placeholder={
                        language === "ar"
                          ? "الاسم كما يظهر في إيصال الحوالة"
                          : "Name as appears on transfer receipt"
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.transferReference}
                    </label>
                    <input
                      type="text"
                      value={transferReference}
                      onChange={(e) =>
                        onTransferReferenceChange(e.target.value)
                      }
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                      placeholder={
                        language === "ar"
                          ? "رقم أو كود الحوالة (إن وجد)"
                          : "Transfer number or code (if available)"
                      }
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
                        {language === "ar"
                          ? "تم رفع الملف: "
                          : "File uploaded: "}
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

      {/* Stripe Payment for SY→EU */}
      {!isEUtoSY && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100"
        >
          <div className="mb-4">
            <h3 className="text-xl font-bold text-primary-dark mb-2">
              {t.stripePayment}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              {language === "ar"
                ? "يمكنك الدفع في أوروبا عبر Stripe"
                : "You can pay in Europe via Stripe"}
            </p>
          </div>

          <div className="space-y-3">
            <motion.button
              onClick={() => onPaymentMethodChange("stripe")}
              className={`w-full p-4 rounded-xl border-2 transition-all ${
                paymentMethod === "stripe"
                  ? "border-primary-yellow bg-primary-yellow/10"
                  : "border-gray-300 hover:border-primary-yellow/50"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === "stripe"
                        ? "border-primary-yellow bg-primary-yellow"
                        : "border-gray-300"
                    }`}
                  >
                    {paymentMethod === "stripe" && (
                      <div className="w-3 h-3 rounded-full bg-primary-dark" />
                    )}
                  </div>
                  <span className="font-semibold text-gray-800">
                    {t.stripePayment}
                  </span>
                </div>
              </div>
            </motion.button>

            {paymentMethod === "stripe" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200 mt-4 space-y-4"
              >
                <p className="text-sm font-semibold text-blue-900 mb-2">
                  {t.paymentMethods}:
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Visa",
                    "MasterCard",
                    "American Express",
                    "Apple Pay",
                    "Google Pay",
                    "Link",
                  ].map((method) => (
                    <span
                      key={method}
                      className="px-3 py-1 bg-white text-blue-900 text-xs rounded-full border border-blue-300"
                    >
                      {method}
                    </span>
                  ))}
                </div>
                {grandTotal > 0 && (
                  <div className="bg-white rounded-lg p-3 border border-blue-300">
                    <p className="text-sm font-semibold text-blue-900 mb-1">
                      {language === "ar" ? "المبلغ الإجمالي:" : "Total Amount:"}
                    </p>
                    <p className="text-xl font-bold text-blue-900">
                      €{Number(grandTotal || 0).toFixed(2)}
                    </p>
                  </div>
                )}
                {onStripePayment && (
                  <>
                    {recaptchaError && (
                      <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r-lg mb-4">
                        <p className="text-sm font-medium">{recaptchaError}</p>
                      </div>
                    )}
                    <motion.button
                      onClick={handleStripePaymentClick}
                      disabled={
                        isProcessingPayment ||
                        grandTotal <= 0 ||
                        !isRecaptchaValid ||
                        !isRecaptchaReady
                      }
                      className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all ${
                        isProcessingPayment ||
                        grandTotal <= 0 ||
                        !isRecaptchaValid ||
                        !isRecaptchaReady
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl"
                      }`}
                      whileHover={
                        !isProcessingPayment &&
                        grandTotal > 0 &&
                        isRecaptchaValid &&
                        isRecaptchaReady
                          ? { scale: 1.02 }
                          : {}
                      }
                      whileTap={
                        !isProcessingPayment &&
                        grandTotal > 0 &&
                        isRecaptchaValid &&
                        isRecaptchaReady
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
                  </>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
