"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMemo } from 'react';
import Step1Direction from '@/components/ShipmentForm/Step1Direction';
import Step2ShipmentType from '@/components/ShipmentForm/Step2ShipmentType';
import Step3SenderReceiver from '@/components/ShipmentForm/Step3SenderReceiver';
import Step4ParcelDetails from '@/components/ShipmentForm/Step4ParcelDetails';
import Step5Pricing from '@/components/ShipmentForm/Step5Pricing';
import Step6Packaging from '@/components/ShipmentForm/Step6Packaging';
import Step7Insurance from '@/components/ShipmentForm/Step7Insurance';
import Step8InternalTransport from '@/components/ShipmentForm/Step8InternalTransport';
import Step9Payment from '@/components/ShipmentForm/Step9Payment';
import Step10Review from '@/components/ShipmentForm/Step10Review';
import Step11Confirmation from '@/components/ShipmentForm/Step11Confirmation';
import ProgressBar from '@/components/ShipmentForm/ProgressBar';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { ShippingDirection, ShipmentType, Parcel, PersonInfo } from '@/types/shipment';
import { calculateTotalPricing } from '@/lib/pricing';
import { PricingResult } from '@/types/pricing';

const TOTAL_STEPS = 11;

export default function CreateShipmentPage() {
  const { language, setLanguage } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState<ShippingDirection | null>(null);
  const [shipmentTypes, setShipmentTypes] = useState<ShipmentType[]>([]);
  const [sender, setSender] = useState<PersonInfo | null>(null);
  const [receiver, setReceiver] = useState<PersonInfo | null>(null);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [initialPackaging, setInitialPackaging] = useState<{ key: string; quantity: number }[]>([]);
  const [finalPackaging, setFinalPackaging] = useState<{ key: string; quantity: number }[]>([]);
  const [optionalInsuranceValue, setOptionalInsuranceValue] = useState<number>(0);
  const [euPickupAddress, setEUPickupAddress] = useState<string>('');
  const [euPickupWeight, setEUPickupWeight] = useState<number>(0);
  const [syriaProvince, setSyriaProvince] = useState<string>('');
  const [syriaWeight, setSyriaWeight] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'mollie' | 'cash' | 'internal-transfer' | null>(null);
  const [transferSenderName, setTransferSenderName] = useState<string>('');
  const [transferReference, setTransferReference] = useState<string>('');
  const [transferSlip, setTransferSlip] = useState<File | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);
  const [acceptedPolicies, setAcceptedPolicies] = useState<boolean>(false);
  const [shipmentId, setShipmentId] = useState<string | null>(null);
  
  // Generate shipment ID
  const generateShipmentId = (): string => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    const prefix = direction === 'eu-sy' ? 'MF-EU' : 'MF-SY';
    return `${prefix}-${year}-${randomNum}`;
  };
  
  // Calculate pricing
  const pricing: PricingResult | null = useMemo(() => {
    if (parcels.length === 0) return null;
    
    // Separate parcels by type based on shipment types selected
    // Parcel LCL: all parcels that are not electronics or large items
    const regularParcels = parcels.filter(p => {
      // If electronics is selected, exclude electronics products
      if (shipmentTypes.includes('electronics')) {
        const isElectronics = p.productCategory === 'MOBILE_PHONE' || 
                              p.productCategory === 'LAPTOP' || 
                              p.productCategory === 'LARGE_MIRROR';
        if (isElectronics) return false;
      }
      // If large items is selected, exclude large items (they have itemType)
      if (shipmentTypes.includes('large-items') && p.itemType) {
        return false;
      }
      return true;
    });
    
    // Electronics: parcels with electronics product categories
    const electronicsParcels = parcels.filter(p => 
      shipmentTypes.includes('electronics') && 
      (p.productCategory === 'MOBILE_PHONE' || 
       p.productCategory === 'LAPTOP' || 
       p.productCategory === 'LARGE_MIRROR')
    );
    
    // Large Items: parcels with itemType field
    const largeItemsParcels = parcels.filter(p => 
      shipmentTypes.includes('large-items') && p.itemType
    );
    
    return calculateTotalPricing(
      regularParcels,
      electronicsParcels,
      largeItemsParcels,
      initialPackaging,
      finalPackaging,
      optionalInsuranceValue
    );
  }, [parcels, shipmentTypes, initialPackaging, finalPackaging, optionalInsuranceValue]);
  
  // Calculate electronics declared value for insurance
  const electronicsDeclaredValue = useMemo(() => {
    if (!shipmentTypes.includes('electronics')) return 0;
    const electronicsParcels = parcels.filter(p => 
      p.productCategory === 'MOBILE_PHONE' || 
      p.productCategory === 'LAPTOP' || 
      p.productCategory === 'LARGE_MIRROR'
    );
    return electronicsParcels.reduce((sum, p) => sum + (p.declaredValue || 0), 0);
  }, [parcels, shipmentTypes]);

  const translations = {
    ar: {
      title: 'إنشاء شحنة جديدة',
      subtitle: 'اختر اتجاه الشحن لبدء رحلتك',
      step1Title: 'اختر اتجاه الشحن',
      step2Title: 'اختر نوع الشحنة',
      step3Title: 'بيانات المرسل والمستلم',
      step4Title: 'تفاصيل الطرود',
      step5Title: 'ملخص التسعير',
      step6Title: 'خيارات التغليف',
      step7Title: 'التأمين',
      step8Title: 'النقل الداخلي',
      step9Title: 'طريقة الدفع',
      step10Title: 'مراجعة وتأكيد',
      step11Title: 'تم إنشاء الشحنة',
      back: 'رجوع',
      continue: 'متابعة',
      contactInfo: 'معلومات الاتصال',
      europeCenter: 'مركز أوروبا – هولندا (Axel)',
      syriaCenter: 'مركز سورية – حلب',
      email: 'البريد الإلكتروني',
      phone: 'الهاتف',
    },
    en: {
      title: 'Create New Shipment',
      subtitle: 'Select shipping direction to begin your journey',
      step1Title: 'Select Shipping Direction',
      step2Title: 'Select Shipment Type',
      step3Title: 'Sender & Receiver Information',
      step4Title: 'Parcel Details',
      step5Title: 'Pricing Summary',
      step6Title: 'Packaging Options',
      step7Title: 'Insurance',
      step8Title: 'Internal Transport',
      step9Title: 'Payment Method',
      step10Title: 'Review & Confirm',
      step11Title: 'Shipment Created',
      back: 'Back',
      continue: 'Continue',
      contactInfo: 'Contact Information',
      europeCenter: 'Europe Center – Netherlands (Axel)',
      syriaCenter: 'Syria Center – Aleppo',
      email: 'Email',
      phone: 'Phone',
    },
  };

  const t = translations[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 py-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Language Switcher */}
        <div className="flex justify-end mb-6">
          <LanguageSwitcher language={language} setLanguage={setLanguage} />
        </div>

        {/* Header */}
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
        <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} language={language} />

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
                      whileHover={{ x: language === 'ar' ? -5 : 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d={language === 'ar' ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
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
            key="step2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-primary-dark mb-6 text-center">
              {t.step2Title}
            </h2>
            <Step2ShipmentType
              selectedTypes={shipmentTypes}
              onTypesChange={setShipmentTypes}
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
                    whileHover={{ x: language === 'ar' ? 3 : -3 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d={language === 'ar' ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
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
                      whileHover={{ x: language === 'ar' ? -5 : 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d={language === 'ar' ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
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
                {language === 'ar' 
                  ? 'يرجى اختيار اتجاه الشحن أولاً' 
                  : 'Please select shipping direction first'}
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
                    whileHover={{ x: language === 'ar' ? 3 : -3 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d={language === 'ar' ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
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
                      whileHover={{ x: language === 'ar' ? -5 : 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d={language === 'ar' ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
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
                    whileHover={{ x: language === 'ar' ? 3 : -3 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d={language === 'ar' ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
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
                      whileHover={{ x: language === 'ar' ? -5 : 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d={language === 'ar' ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
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
              {t.step6Title}
            </h2>
            <Step6Packaging
              initialPackaging={initialPackaging}
              finalPackaging={finalPackaging}
              onInitialPackagingChange={setInitialPackaging}
              onFinalPackagingChange={setFinalPackaging}
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
                    whileHover={{ x: language === 'ar' ? 3 : -3 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d={language === 'ar' ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
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
                    whileHover={{ x: language === 'ar' ? -5 : 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d={language === 'ar' ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
                    />
                  </motion.svg>
                </span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {/* Step 7 Content */}
        {currentStep === 7 && (
          <motion.div
            key="step7"
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
              hasElectronics={shipmentTypes.includes('electronics')}
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
                    whileHover={{ x: language === 'ar' ? 3 : -3 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d={language === 'ar' ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
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
                    whileHover={{ x: language === 'ar' ? -5 : 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d={language === 'ar' ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
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
                    whileHover={{ x: language === 'ar' ? 3 : -3 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d={language === 'ar' ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
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
                    whileHover={{ x: language === 'ar' ? -5 : 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d={language === 'ar' ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
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
              {t.step9Title}
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
                    whileHover={{ x: language === 'ar' ? 3 : -3 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d={language === 'ar' ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
                    />
                  </motion.svg>
                  {t.back}
                </span>
              </motion.button>

              {/* Continue Button */}
              <motion.button
                onClick={() => setCurrentStep(10)}
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
                    whileHover={{ x: language === 'ar' ? -5 : 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d={language === 'ar' ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
                    />
                  </motion.svg>
                </span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {/* Step 10 Content */}
        {currentStep === 10 && direction && (
          <motion.div
            key="step10"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-primary-dark mb-6 text-center">
              {t.step10Title}
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
                if (!direction) {
                  console.error('Direction is required to create shipment');
                  return;
                }
                
                // Generate shipment ID
                const newShipmentId = generateShipmentId();
                setShipmentId(newShipmentId);
                
                // TODO: Send data to backend API
                // This will be implemented with backend integration
                console.log('Creating shipment with ID:', newShipmentId);
                
                // Move to confirmation step
                setCurrentStep(11);
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
                onClick={() => setCurrentStep(9)}
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
                    whileHover={{ x: language === 'ar' ? 3 : -3 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d={language === 'ar' ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
                    />
                  </motion.svg>
                  {t.back}
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
            {pricing ? (
              <Step5Pricing
                pricing={pricing}
                language={language}
              />
            ) : (
              <div className="text-center py-12 text-gray-500">
                {language === 'ar' 
                  ? 'يرجى إضافة الطرود أولاً في الخطوة السابقة' 
                  : 'Please add parcels first in the previous step'}
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
                    whileHover={{ x: language === 'ar' ? 3 : -3 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d={language === 'ar' ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
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
                    whileHover={{ x: language === 'ar' ? -5 : 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d={language === 'ar' ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
                    />
                  </motion.svg>
                </span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {/* Step 11 Content - Confirmation */}
        {currentStep === 11 && direction && shipmentId && (
          <motion.div
            key="step11"
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
                <p>Meekrapweg 2</p>
                <p>4571 RX Axel</p>
                <p>Zeeland – Netherlands</p>
                <div className="pt-3 border-t border-gray-200 mt-3">
                  <p className="flex items-center gap-2">
                    <span className="text-primary-dark font-semibold">{t.email}:</span>
                    <a href="mailto:contact@medo-freight.eu" className="text-primary-dark hover:text-primary-yellow transition-colors">
                      contact@medo-freight.eu
                    </a>
                  </p>
                  <p className="flex items-center gap-2 mt-2">
                    <span className="text-primary-dark font-semibold">{t.phone}:</span>
                    <a href="tel:+31683083916" className="text-primary-dark hover:text-primary-yellow transition-colors">
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
                    <span className="text-primary-dark font-semibold">{t.email}:</span>
                    <a href="mailto:alikramtrading.co@gmail.com" className="text-primary-dark hover:text-primary-yellow transition-colors">
                      alikramtrading.co@gmail.com
                    </a>
                  </p>
                  <p className="flex items-center gap-2 mt-2">
                    <span className="text-primary-dark font-semibold">{t.phone}:</span>
                    <a href="tel:+9639954778188" className="text-primary-dark hover:text-primary-yellow transition-colors">
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
  );
}
