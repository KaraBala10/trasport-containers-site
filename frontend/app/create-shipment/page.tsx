"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMemo } from "react";
import Step1Direction from "@/components/ShipmentForm/Step1Direction";
import Step3SenderReceiver from "@/components/ShipmentForm/Step3SenderReceiver";
import Step4ParcelDetails from "@/components/ShipmentForm/Step4ParcelDetails";
import Step5Pricing from "@/components/ShipmentForm/Step5Pricing";
import Step6Packaging from "@/components/ShipmentForm/Step6Packaging";
import Step7Insurance from "@/components/ShipmentForm/Step7Insurance";
import Step8InternalTransport from "@/components/ShipmentForm/Step8InternalTransport";
import Step9Payment from "@/components/ShipmentForm/Step9Payment";
import Step10Review from "@/components/ShipmentForm/Step10Review";
import Step11Confirmation from "@/components/ShipmentForm/Step11Confirmation";
import ProgressBar from "@/components/ShipmentForm/ProgressBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  ShippingDirection,
  ShipmentType,
  Parcel,
  PersonInfo,
} from "@/types/shipment";
import { calculateTotalPricing } from "@/lib/pricing";
import { PricingResult } from "@/types/pricing";
import { apiService } from "@/lib/api";

const TOTAL_STEPS = 10;

export default function CreateShipmentPage() {
  const { language, setLanguage } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState<ShippingDirection | null>(null);
  const [shipmentTypes, setShipmentTypes] = useState<ShipmentType[]>(['parcel-lcl']);
  const [sender, setSender] = useState<PersonInfo | null>(null);
  const [receiver, setReceiver] = useState<PersonInfo | null>(null);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [initialPackaging, setInitialPackaging] = useState<
    { key: string; quantity: number }[]
  >([]);
  const [finalPackaging, setFinalPackaging] = useState<
    { key: string; quantity: number }[]
  >([]);
  const [optionalInsuranceValue, setOptionalInsuranceValue] =
    useState<number>(0);
  const [euPickupAddress, setEUPickupAddress] = useState<string>("");
  const [euPickupWeight, setEUPickupWeight] = useState<number>(0);
  const [syriaProvince, setSyriaProvince] = useState<string>("");
  const [syriaWeight, setSyriaWeight] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<
    "mollie" | "cash" | "internal-transfer" | null
  >(null);
  const [transferSenderName, setTransferSenderName] = useState<string>("");
  const [transferReference, setTransferReference] = useState<string>("");
  const [transferSlip, setTransferSlip] = useState<File | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);
  const [acceptedPolicies, setAcceptedPolicies] = useState<boolean>(false);
  const [shipmentId, setShipmentId] = useState<string | null>(null);
  const [pricing, setPricing] = useState<PricingResult | null>(null);
  const [pricingLoading, setPricingLoading] = useState<boolean>(false);
  const [isCreatingShipment, setIsCreatingShipment] = useState<boolean>(false);

  // Calculate pricing using API for base price - only when user reaches Step 4
  useEffect(() => {
    const calculatePricing = async () => {
      // Only calculate when user is on Step 4 (Pricing Summary)
      if (currentStep !== 4) {
        return;
      }

      if (parcels.length === 0) {
        setPricing(null);
        return;
      }

      setPricingLoading(true);

      try {
        // Separate parcels by type based on shipment types selected
        // Parcel LCL: all parcels that are not electronics or large items
        const regularParcels = parcels.filter((p) => {
          // If electronics is selected, exclude electronics products
          if (shipmentTypes.includes("electronics")) {
            const isElectronics =
              p.productCategory === "MOBILE_PHONE" ||
              p.productCategory === "LAPTOP" ||
              p.productCategory === "LARGE_MIRROR";
            if (isElectronics) return false;
          }
          // If large items is selected, exclude large items (they have itemType)
          if (shipmentTypes.includes("large-items") && p.itemType) {
            return false;
          }
          return true;
        });

        // Electronics: parcels with electronics product categories
        const electronicsParcels = parcels.filter(
          (p) =>
            shipmentTypes.includes("electronics") &&
            (p.productCategory === "MOBILE_PHONE" ||
              p.productCategory === "LAPTOP" ||
              p.productCategory === "LARGE_MIRROR")
        );

        // Large Items: parcels with itemType field
        const largeItemsParcels = parcels.filter(
          (p) => shipmentTypes.includes("large-items") && p.itemType
        );

        // Calculate total weight and CBM for regular parcels (accounting for repeatCount)
        const totalWeight = regularParcels.reduce(
          (sum, p) => sum + (p.weight || 0) * (p.repeatCount || 1),
          0
        );
        const totalCBM = regularParcels.reduce(
          (sum, p) => sum + (p.cbm || 0) * (p.repeatCount || 1),
          0
        );

        // Call API to calculate base price
        let basePrice;
        if (totalWeight > 0 || totalCBM > 0) {
          const apiResponse = await apiService.calculatePricing(
            totalWeight,
            totalCBM
          );
          if (apiResponse.success) {
            basePrice = {
              priceByWeight: apiResponse.priceByWeight,
              priceByCBM: apiResponse.priceByCBM,
              final: apiResponse.basePrice,
            };
          } else {
            // Fallback to local calculation if API fails
            basePrice = {
              priceByWeight: totalWeight * 3,
              priceByCBM: totalCBM * 300,
              final: Math.max(totalWeight * 3, totalCBM * 300, 75),
            };
          }
        } else {
          basePrice = {
            priceByWeight: 0,
            priceByCBM: 0,
            final: 0,
          };
        }

        // Calculate other pricing components (electronics, large items, packaging, insurance)
        // We'll use the existing calculateTotalPricing but replace basePrice
        const fullPricing = calculateTotalPricing(
          regularParcels,
          electronicsParcels,
          largeItemsParcels,
          initialPackaging,
          finalPackaging,
          optionalInsuranceValue
        );

        // Replace the basePrice with API-calculated value
        setPricing({
          ...fullPricing,
          basePrice,
        });
      } catch (error) {
        console.error("Error calculating pricing:", error);
        // Fallback to local calculation on error
        const regularParcels = parcels.filter((p) => {
          if (shipmentTypes.includes("electronics")) {
            const isElectronics =
              p.productCategory === "MOBILE_PHONE" ||
              p.productCategory === "LAPTOP" ||
              p.productCategory === "LARGE_MIRROR";
            if (isElectronics) return false;
          }
          if (shipmentTypes.includes("large-items") && p.itemType) {
            return false;
          }
          return true;
        });

        const electronicsParcels = parcels.filter(
          (p) =>
            shipmentTypes.includes("electronics") &&
            (p.productCategory === "MOBILE_PHONE" ||
              p.productCategory === "LAPTOP" ||
              p.productCategory === "LARGE_MIRROR")
        );

        const largeItemsParcels = parcels.filter(
          (p) => shipmentTypes.includes("large-items") && p.itemType
        );

        setPricing(
          calculateTotalPricing(
            regularParcels,
            electronicsParcels,
            largeItemsParcels,
            initialPackaging,
            finalPackaging,
            optionalInsuranceValue
          )
        );
      } finally {
        setPricingLoading(false);
      }
    };

    calculatePricing();
  }, [
    currentStep, // Trigger when user reaches Step 4
    parcels,
    shipmentTypes,
    initialPackaging,
    finalPackaging,
    optionalInsuranceValue,
  ]);

  // Calculate electronics declared value for insurance
  const electronicsDeclaredValue = useMemo(() => {
    if (!shipmentTypes.includes("electronics")) return 0;
    const electronicsParcels = parcels.filter(
      (p) =>
        p.productCategory === "MOBILE_PHONE" ||
        p.productCategory === "LAPTOP" ||
        p.productCategory === "LARGE_MIRROR"
    );
    return electronicsParcels.reduce(
      (sum, p) => sum + (p.declaredValue || 0),
      0
    );
  }, [parcels, shipmentTypes]);

  const translations = {
    ar: {
      title: "إنشاء شحنة جديدة",
      subtitle: "اختر اتجاه الشحن لبدء رحلتك",
      step1Title: "اختر اتجاه الشحن",
      step2Title: "اختر نوع الشحنة",
      step3Title: "بيانات المرسل والمستلم",
      step4Title: "تفاصيل الطرود",
      step5Title: "ملخص التسعير",
      step6Title: "خيارات التغليف",
      step7Title: "التأمين",
      step8Title: "النقل الداخلي",
      step9Title: "مراجعة وتأكيد",
      step10Title: "طريقة الدفع",
      step11Title: "تم إنشاء الشحنة",
      back: "رجوع",
      continue: "متابعة",
      contactInfo: "معلومات الاتصال",
      europeCenter: "مركز أوروبا – هولندا (Bergen op Zoom)",
      syriaCenter: "مركز سورية – حلب",
      email: "البريد الإلكتروني",
      phone: "الهاتف",
    },
    en: {
      title: "Create New Shipment",
      subtitle: "Select shipping direction to begin your journey",
      step1Title: "Select Shipping Direction",
      step2Title: "Select Shipment Type",
      step3Title: "Sender & Receiver Information",
      step4Title: "Parcel Details",
      step5Title: "Pricing Summary",
      step6Title: "Packaging Options",
      step7Title: "Insurance",
      step8Title: "Internal Transport",
      step9Title: "Review & Confirm",
      step10Title: "Payment Method",
      step11Title: "Shipment Created",
      back: "Back",
      continue: "Continue",
      contactInfo: "Contact Information",
      europeCenter: "Europe Center – Netherlands (Bergen op Zoom)",
      syriaCenter: "Syria Center – Aleppo",
      email: "Email",
      phone: "Phone",
    },
  };

  const t = translations[language];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <Header />
      
      {/* Spacer for fixed header */}
      <div className="h-20" aria-hidden="true" />
      
      <div className="flex-grow py-16 px-4">
        <div className="max-w-5xl mx-auto">

        {/* Title */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl font-bold text-primary-dark mb-4"
          >
            {t.title}
          </motion.h1>
        </div>

        {/* Progress Bar */}
        <ProgressBar
          currentStep={currentStep}
          totalSteps={TOTAL_STEPS}
          language={language}
        />

        {/* Step 1 Content */}
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-primary-dark mb-6 text-center">
              {t.step1Title}
            </h2>
            <Step1Direction
              direction={direction}
              onDirectionChange={(dir) => {
                setDirection(dir);
              }}
              language={language}
            />
            {direction && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex justify-center mt-8"
              >
                <motion.button
                  onClick={() => setCurrentStep(2)}
                  className="relative px-20 py-5 bg-gradient-to-r from-primary-yellow to-primary-yellow/90 text-primary-dark font-bold text-xl rounded-3xl shadow-2xl hover:shadow-primary-yellow/50 transition-all duration-500 overflow-hidden group"
                  whileHover={{ scale: 1.08, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <span className="relative z-10 flex items-center gap-3">
                    {t.continue}
                    <motion.svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      initial={{ x: 0 }}
                      whileHover={{ x: language === "ar" ? -5 : 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d={
                          language === "ar" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"
                        }
                      />
                    </motion.svg>
                  </span>
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Step 2 Content */}
        {currentStep === 2 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-primary-dark mb-6 text-center">
              {t.step3Title}
            </h2>
            {direction ? (
              <Step3SenderReceiver
                direction={direction}
                sender={sender}
                receiver={receiver}
                onSenderChange={setSender}
                onReceiverChange={setReceiver}
                language={language}
              />
            ) : (
              <div className="text-center py-12 text-gray-500">
                {language === "ar"
                  ? "يرجى اختيار اتجاه الشحن أولاً"
                  : "Please select shipping direction first"}
              </div>
            )}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex justify-center items-center gap-4 mt-10"
            >
              {/* Back Button */}
              <motion.button
                onClick={() => setCurrentStep(1)}
                className="relative px-8 py-5 bg-white border-2 border-gray-300 text-gray-700 font-bold text-lg rounded-3xl shadow-lg hover:shadow-xl hover:border-primary-dark/30 transition-all duration-300 overflow-hidden group"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.96 }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <motion.svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    initial={{ x: 0 }}
                    whileHover={{ x: language === "ar" ? 3 : -3 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d={language === "ar" ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
                    />
                  </motion.svg>
                  {t.back}
                </span>
              </motion.button>

              {/* Continue Button */}
              <motion.button
                onClick={() => setCurrentStep(3)}
                className="relative px-20 py-5 bg-gradient-to-r from-primary-yellow to-primary-yellow/90 text-primary-dark font-bold text-xl rounded-3xl shadow-2xl hover:shadow-primary-yellow/50 transition-all duration-500 overflow-hidden group"
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.96 }}
              >
                <span className="relative z-10 flex items-center gap-3">
                  {t.continue}
                  <motion.svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    initial={{ x: 0 }}
                    whileHover={{ x: language === "ar" ? -5 : 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d={language === "ar" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
                    />
                  </motion.svg>
                </span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {/* Step 3 Content */}
        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-primary-dark mb-6 text-center">
              {t.step4Title}
            </h2>
            <Step4ParcelDetails
              shipmentTypes={shipmentTypes}
              parcels={parcels}
              onParcelsChange={setParcels}
              language={language}
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex justify-center items-center gap-4 mt-10"
            >
              {/* Back Button */}
              <motion.button
                onClick={() => setCurrentStep(2)}
                className="relative px-8 py-5 bg-white border-2 border-gray-300 text-gray-700 font-bold text-lg rounded-3xl shadow-lg hover:shadow-xl hover:border-primary-dark/30 transition-all duration-300 overflow-hidden group"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.96 }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <motion.svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    initial={{ x: 0 }}
                    whileHover={{ x: language === "ar" ? 3 : -3 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d={language === "ar" ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
                    />
                  </motion.svg>
                  {t.back}
                </span>
              </motion.button>

              {/* Continue Button */}
              <motion.button
                onClick={() => setCurrentStep(4)}
                className="relative px-20 py-5 bg-gradient-to-r from-primary-yellow to-primary-yellow/90 text-primary-dark font-bold text-xl rounded-3xl shadow-2xl hover:shadow-primary-yellow/50 transition-all duration-500 overflow-hidden group"
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.96 }}
              >
                <span className="relative z-10 flex items-center gap-3">
                  {t.continue}
                  <motion.svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    initial={{ x: 0 }}
                    whileHover={{ x: language === "ar" ? -5 : 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d={language === "ar" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
                    />
                  </motion.svg>
                </span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {/* Step 4 Content */}
        {currentStep === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.4 }}
          >
            {pricingLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-yellow mb-4"></div>
                <p className="text-gray-600 text-lg">
                  {language === "ar"
                    ? "جاري حساب الأسعار..."
                    : "Calculating prices..."}
                </p>
              </div>
            ) : pricing ? (
              <Step5Pricing pricing={pricing} language={language} />
            ) : (
              <div className="text-center py-12 text-gray-500">
                {language === "ar"
                  ? "يرجى إضافة الطرود أولاً في الخطوة السابقة"
                  : "Please add parcels first in the previous step"}
              </div>
            )}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex justify-center items-center gap-4 mt-10"
            >
              {/* Back Button */}
              <motion.button
                onClick={() => setCurrentStep(3)}
                className="relative px-8 py-5 bg-white border-2 border-gray-300 text-gray-700 font-bold text-lg rounded-3xl shadow-lg hover:shadow-xl hover:border-primary-dark/30 transition-all duration-300 overflow-hidden group"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.96 }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <motion.svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    initial={{ x: 0 }}
                    whileHover={{ x: language === "ar" ? 3 : -3 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d={language === "ar" ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
                    />
                  </motion.svg>
                  {t.back}
                </span>
              </motion.button>

              {/* Continue Button */}
              <motion.button
                onClick={() => setCurrentStep(5)}
                className="relative px-20 py-5 bg-gradient-to-r from-primary-yellow to-primary-yellow/90 text-primary-dark font-bold text-xl rounded-3xl shadow-2xl hover:shadow-primary-yellow/50 transition-all duration-500 overflow-hidden group"
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.96 }}
              >
                <span className="relative z-10 flex items-center gap-3">
                  {t.continue}
                  <motion.svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    initial={{ x: 0 }}
                    whileHover={{ x: language === "ar" ? -5 : 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d={language === "ar" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
                    />
                  </motion.svg>
                </span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {/* Step 5 Content */}
        {currentStep === 5 && (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-primary-dark mb-6 text-center">
              {t.step6Title}
            </h2>
            <Step6Packaging
              finalPackaging={finalPackaging}
              onFinalPackagingChange={setFinalPackaging}
              language={language}
              direction={direction}
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex justify-center items-center gap-4 mt-10"
            >
              {/* Back Button */}
              <motion.button
                onClick={() => setCurrentStep(4)}
                className="relative px-8 py-5 bg-white border-2 border-gray-300 text-gray-700 font-bold text-lg rounded-3xl shadow-lg hover:shadow-xl hover:border-primary-dark/30 transition-all duration-300 overflow-hidden group"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.96 }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <motion.svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    initial={{ x: 0 }}
                    whileHover={{ x: language === "ar" ? 3 : -3 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d={language === "ar" ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
                    />
                  </motion.svg>
                  {t.back}
                </span>
              </motion.button>

              {/* Continue Button */}
              <motion.button
                onClick={() => setCurrentStep(6)}
                className="relative px-20 py-5 bg-gradient-to-r from-primary-yellow to-primary-yellow/90 text-primary-dark font-bold text-xl rounded-3xl shadow-2xl hover:shadow-primary-yellow/50 transition-all duration-500 overflow-hidden group"
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.96 }}
              >
                <span className="relative z-10 flex items-center gap-3">
                  {t.continue}
                  <motion.svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    initial={{ x: 0 }}
                    whileHover={{ x: language === "ar" ? -5 : 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d={language === "ar" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
                    />
                  </motion.svg>
                </span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {/* Step 6 Content */}
        {currentStep === 6 && (
          <motion.div
            key="step6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-primary-dark mb-6 text-center">
              {t.step7Title}
            </h2>
            <Step7Insurance
              optionalInsuranceValue={optionalInsuranceValue}
              onOptionalInsuranceChange={setOptionalInsuranceValue}
              language={language}
              hasElectronics={shipmentTypes.includes("electronics")}
              electronicsDeclaredValue={electronicsDeclaredValue}
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex justify-center items-center gap-4 mt-10"
            >
              {/* Back Button */}
              <motion.button
                onClick={() => setCurrentStep(5)}
                className="relative px-8 py-5 bg-white border-2 border-gray-300 text-gray-700 font-bold text-lg rounded-3xl shadow-lg hover:shadow-xl hover:border-primary-dark/30 transition-all duration-300 overflow-hidden group"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.96 }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <motion.svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    initial={{ x: 0 }}
                    whileHover={{ x: language === "ar" ? 3 : -3 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d={language === "ar" ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
                    />
                  </motion.svg>
                  {t.back}
                </span>
              </motion.button>

              {/* Continue Button */}
              <motion.button
                onClick={() => setCurrentStep(7)}
                className="relative px-20 py-5 bg-gradient-to-r from-primary-yellow to-primary-yellow/90 text-primary-dark font-bold text-xl rounded-3xl shadow-2xl hover:shadow-primary-yellow/50 transition-all duration-500 overflow-hidden group"
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.96 }}
              >
                <span className="relative z-10 flex items-center gap-3">
                  {t.continue}
                  <motion.svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    initial={{ x: 0 }}
                    whileHover={{ x: language === "ar" ? -5 : 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d={language === "ar" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
                    />
                  </motion.svg>
                </span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {/* Step 7 Content */}
        {currentStep === 7 && direction && (
          <motion.div
            key="step7"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-primary-dark mb-6 text-center">
              {t.step8Title}
            </h2>
            <Step8InternalTransport
              direction={direction}
              euPickupAddress={euPickupAddress}
              euPickupWeight={euPickupWeight}
              onEUPickupAddressChange={setEUPickupAddress}
              onEUPickupWeightChange={setEUPickupWeight}
              syriaProvince={syriaProvince}
              syriaWeight={syriaWeight}
              onSyriaProvinceChange={setSyriaProvince}
              onSyriaWeightChange={setSyriaWeight}
              language={language}
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex justify-center items-center gap-4 mt-10"
            >
              {/* Back Button */}
              <motion.button
                onClick={() => setCurrentStep(6)}
                className="relative px-8 py-5 bg-white border-2 border-gray-300 text-gray-700 font-bold text-lg rounded-3xl shadow-lg hover:shadow-xl hover:border-primary-dark/30 transition-all duration-300 overflow-hidden group"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.96 }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <motion.svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    initial={{ x: 0 }}
                    whileHover={{ x: language === "ar" ? 3 : -3 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d={language === "ar" ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
                    />
                  </motion.svg>
                  {t.back}
                </span>
              </motion.button>

              {/* Continue Button */}
              <motion.button
                onClick={() => setCurrentStep(8)}
                className="relative px-20 py-5 bg-gradient-to-r from-primary-yellow to-primary-yellow/90 text-primary-dark font-bold text-xl rounded-3xl shadow-2xl hover:shadow-primary-yellow/50 transition-all duration-500 overflow-hidden group"
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.96 }}
              >
                <span className="relative z-10 flex items-center gap-3">
                  {t.continue}
                  <motion.svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    initial={{ x: 0 }}
                    whileHover={{ x: language === "ar" ? -5 : 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d={language === "ar" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
                    />
                  </motion.svg>
                </span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {/* Step 8 Content */}
        {currentStep === 8 && direction && (
          <motion.div
            key="step8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-primary-dark mb-6 text-center">
              {t.step9Title}
            </h2>
            <Step10Review
              direction={direction}
              shipmentTypes={shipmentTypes}
              sender={sender}
              receiver={receiver}
              parcels={parcels}
              pricing={pricing}
              acceptedTerms={acceptedTerms}
              acceptedPolicies={acceptedPolicies}
              onAcceptedTermsChange={setAcceptedTerms}
              onAcceptedPoliciesChange={setAcceptedPolicies}
              onCreateShipment={() => {
                // Move to payment step instead of creating shipment
                setCurrentStep(9);
              }}
              language={language}
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex justify-center items-center gap-4 mt-10"
            >
              {/* Back Button */}
              <motion.button
                onClick={() => setCurrentStep(7)}
                className="relative px-8 py-5 bg-white border-2 border-gray-300 text-gray-700 font-bold text-lg rounded-3xl shadow-lg hover:shadow-xl hover:border-primary-dark/30 transition-all duration-300 overflow-hidden group"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.96 }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <motion.svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    initial={{ x: 0 }}
                    whileHover={{ x: language === "ar" ? 3 : -3 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d={language === "ar" ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
                    />
                  </motion.svg>
                  {t.back}
                </span>
              </motion.button>

              {/* Continue Button */}
              <motion.button
                onClick={() => setCurrentStep(9)}
                className="relative px-20 py-5 bg-gradient-to-r from-primary-yellow to-primary-yellow/90 text-primary-dark font-bold text-xl rounded-3xl shadow-2xl hover:shadow-primary-yellow/50 transition-all duration-500 overflow-hidden group"
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.96 }}
              >
                <span className="relative z-10 flex items-center gap-3">
                  {t.continue}
                  <motion.svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    initial={{ x: 0 }}
                    whileHover={{ x: language === "ar" ? -5 : 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d={language === "ar" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
                    />
                  </motion.svg>
                </span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {/* Step 9 Content */}
        {currentStep === 9 && direction && (
          <motion.div
            key="step9"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-primary-dark mb-6 text-center">
              {t.step10Title}
            </h2>
            <Step9Payment
              direction={direction}
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              transferSenderName={transferSenderName}
              transferReference={transferReference}
              transferSlip={transferSlip}
              onTransferSenderNameChange={setTransferSenderName}
              onTransferReferenceChange={setTransferReference}
              onTransferSlipChange={setTransferSlip}
              language={language}
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex justify-center items-center gap-4 mt-10"
            >
              {/* Back Button */}
              <motion.button
                onClick={() => setCurrentStep(8)}
                className="relative px-8 py-5 bg-white border-2 border-gray-300 text-gray-700 font-bold text-lg rounded-3xl shadow-lg hover:shadow-xl hover:border-primary-dark/30 transition-all duration-300 overflow-hidden group"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.96 }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <motion.svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    initial={{ x: 0 }}
                    whileHover={{ x: language === "ar" ? 3 : -3 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d={language === "ar" ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
                    />
                  </motion.svg>
                  {t.back}
                </span>
              </motion.button>

              {/* Continue/Submit Button */}
              <motion.button
                onClick={async () => {
                  if (!direction) {
                    console.error("Direction is required to create shipment");
                    return;
                  }

                  setIsCreatingShipment(true);
                  try {
                    // Prepare shipment data
                    const shipmentData = {
                      direction: direction,
                      shipment_types: shipmentTypes,
                      sender: sender,
                      receiver: receiver,
                      parcels: parcels,
                      initial_packaging: initialPackaging,
                      final_packaging: finalPackaging,
                      optional_insurance_value: optionalInsuranceValue,
                      eu_pickup_address: euPickupAddress,
                      eu_pickup_weight: euPickupWeight,
                      syria_province: syriaProvince,
                      syria_weight: syriaWeight,
                      payment_method: paymentMethod,
                      transfer_sender_name: transferSenderName,
                      transfer_reference: transferReference,
                      accepted_terms: acceptedTerms,
                      accepted_policies: acceptedPolicies,
                      pricing: pricing,
                    };

                    // Send data to backend API
                    const response = await apiService.createShipment(shipmentData);

                    // Get shipment ID from backend response
                    if (response.data && response.data.shipment_id) {
                      setShipmentId(response.data.shipment_id);
                      // Move to confirmation step
                      setCurrentStep(10);
                    } else if (response.data && response.data.id) {
                      // Fallback: use id if shipment_id not available
                      setShipmentId(response.data.id.toString());
                      setCurrentStep(10);
                    } else {
                      console.error("No shipment ID received from backend");
                      alert(language === "ar" ? "حدث خطأ أثناء إنشاء الشحنة" : "Error creating shipment");
                    }
                  } catch (error: any) {
                    console.error("Error creating shipment:", error);
                    alert(
                      language === "ar"
                        ? "حدث خطأ أثناء إنشاء الشحنة. يرجى المحاولة مرة أخرى."
                        : "Error creating shipment. Please try again."
                    );
                  } finally {
                    setIsCreatingShipment(false);
                  }
                }}
                disabled={isCreatingShipment}
                className={`relative px-20 py-5 font-bold text-xl rounded-3xl shadow-2xl transition-all duration-500 overflow-hidden group ${
                  isCreatingShipment
                    ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-primary-yellow to-primary-yellow/90 text-primary-dark hover:shadow-primary-yellow/50"
                }`}
                whileHover={!isCreatingShipment ? { scale: 1.08, y: -2 } : {}}
                whileTap={!isCreatingShipment ? { scale: 0.96 } : {}}
              >
                <span className="relative z-10 flex items-center gap-3">
                  {isCreatingShipment
                    ? language === "ar"
                      ? "جاري الإنشاء..."
                      : "Creating..."
                    : language === "ar"
                    ? "إتمام الطلب"
                    : "Complete Order"}
                  <motion.svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    initial={{ x: 0 }}
                    whileHover={{ x: language === "ar" ? -5 : 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d={language === "ar" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
                    />
                  </motion.svg>
                </span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {/* Step 10 Content - Confirmation */}
        {currentStep === 10 && direction && shipmentId && (
          <motion.div
            key="step10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-primary-dark mb-6 text-center">
              {t.step11Title}
            </h2>
            <Step11Confirmation
              shipmentId={shipmentId}
              direction={direction}
              pricing={pricing}
              language={language}
            />
          </motion.div>
        )}

        {/* Contact Information - Only in Step 1 */}
        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Europe Center */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-primary-dark mb-4">
                {t.europeCenter}
              </h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p className="font-semibold">Medo-Freight EU</p>
                <p>Wattweg 5</p>
                <p>4622RA Bergen op Zoom</p>
                <p>Nederland</p>
                <div className="pt-3 border-t border-gray-200 mt-3">
                  <p className="flex items-center gap-2">
                    <span className="text-primary-dark font-semibold">
                      {t.email}:
                    </span>
                    <a
                      href="mailto:contact@medo-freight.eu"
                      className="text-primary-dark hover:text-primary-yellow transition-colors"
                    >
                      contact@medo-freight.eu
                    </a>
                  </p>
                  <p className="flex items-center gap-2 mt-2">
                    <span className="text-primary-dark font-semibold">
                      {t.phone}:
                    </span>
                    <a
                      href="tel:+31683083916"
                      className="text-primary-dark hover:text-primary-yellow transition-colors"
                    >
                      +31 683083916
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Syria Center */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-primary-dark mb-4">
                {t.syriaCenter}
              </h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p className="font-semibold">شركة الإكرام التجارية</p>
                <p>الراموسة – بجانب كراج البولمان</p>
                <p>المدينة الصناعية – الشيخ نجار</p>
                <div className="pt-3 border-t border-gray-200 mt-3">
                  <p className="flex items-center gap-2">
                    <span className="text-primary-dark font-semibold">
                      {t.email}:
                    </span>
                    <a
                      href="mailto:alikramtrading.co@gmail.com"
                      className="text-primary-dark hover:text-primary-yellow transition-colors"
                    >
                      alikramtrading.co@gmail.com
                    </a>
                  </p>
                  <p className="flex items-center gap-2 mt-2">
                    <span className="text-primary-dark font-semibold">
                      {t.phone}:
                    </span>
                    <a
                      href="tel:+9639954778188"
                      className="text-primary-dark hover:text-primary-yellow transition-colors"
                    >
                      +963 995 477 8188
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        </div>
      </div>
      
      <Footer language={language} />
    </div>
  );
}
