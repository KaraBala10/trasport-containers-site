"use client";

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShipmentData } from '@/types/shipment';
import StepIndicator from '@/components/ShipmentForm/StepIndicator';
import Step1Direction from '@/components/ShipmentForm/Step1Direction';
import Step2ClientInfo from '@/components/ShipmentForm/Step2ClientInfo';
import Step3PackageDetails from '@/components/ShipmentForm/Step3PackageDetails';
import Step4OptionalServices from '@/components/ShipmentForm/Step4OptionalServices';
import Step5Pricing from '@/components/ShipmentForm/Step5Pricing';
import Step6Review from '@/components/ShipmentForm/Step6Review';
import Step7Payment from '@/components/ShipmentForm/Step7Payment';
import NavigationButtons from '@/components/ShipmentForm/NavigationButtons';

export default function CreateShipmentPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [language] = useState<'ar' | 'en'>('ar');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<ShipmentData>({
    direction: null,
    shipmentType: 'personal',
    senderName: '',
    senderEmail: '',
    senderPhone: '',
    senderIdPassport: '',
    senderCountry: '',
    senderProvince: '',
    senderCity: '',
    senderAddress: '',
    receiverName: '',
    receiverEmail: '',
    receiverPhone: '',
    receiverIdPassport: '',
    receiverCountry: '',
    receiverProvince: '',
    receiverCity: '',
    receiverAddress: '',
    parcels: [{ description: '', weight: 0, length: 0, width: 0, height: 0, fragile: false, cbm: 0 }],
    packagingOptions: {},
    syriaDeliveryProvince: '',
    euTransportZone: '',
    insuranceEnabled: false,
    goodsValue: 0,
    parcelPhotos: [],
    contentPhotos: [],
    notes: '',
    termsAccepted: false,
    paymentMethod: '',
    transferType: '',
    transferSenderName: '',
    transferCode: '',
    transferSlip: null,
  });

  const updateFormData = (field: keyof ShipmentData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Calculate pricing
  const pricing = useMemo(() => {
    const totalWeight = (formData.parcels || []).reduce((sum, p) => sum + (Number(p.weight) || 0), 0);
    const totalCBM = (formData.parcels || []).reduce((sum, p) => sum + (Number(p.cbm) || 0), 0);

    const baseByWeight = totalWeight * 3;
    const baseByVolume = totalCBM * 300;
    const basePrice = Math.max(baseByWeight, baseByVolume, 60);

    const packagingOptions: { [key: string]: number } = {
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
    Object.entries(formData.packagingOptions || {}).forEach(([id, quantity]) => {
      packagingCost += (packagingOptions[id] || 0) * quantity;
    });

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
    if (formData.syriaDeliveryProvince && formData.syriaDeliveryProvince !== 'aleppo') {
      const province = syrianProvinces[formData.syriaDeliveryProvince];
      if (province) {
        syriaDeliveryCost = Math.max(province.basePrice, totalWeight * province.pricePerKg);
      }
    }

    const euZones: { [key: string]: { basePrice: number; pricePerKg: number } } = {
      'netherlands': { basePrice: 30, pricePerKg: 0.18 },
      'nearby': { basePrice: 55, pricePerKg: 0.23 },
      'other': { basePrice: 75, pricePerKg: 0.28 },
    };

    let euTransportCost = 0;
    if (formData.euTransportZone) {
      const zone = euZones[formData.euTransportZone];
      if (zone) {
        euTransportCost = Math.max(zone.basePrice, totalWeight * zone.pricePerKg);
      }
    }

    const subtotal = basePrice + packagingCost + syriaDeliveryCost + euTransportCost;

    let insuranceCost = 0;
    if (formData.insuranceEnabled && formData.goodsValue) {
      insuranceCost = Math.max(formData.goodsValue * 0.015, 5);
    }

    const total = subtotal + insuranceCost;

    return {
      basePrice,
      packagingCost,
      syriaDeliveryCost,
      euTransportCost,
      insuranceCost,
      subtotal,
      total,
    };
  }, [formData]);

  const handleNext = () => {
    if (canProceedToNext()) {
      setCurrentStep((prev) => Math.min(prev + 1, 7));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!canSubmit()) return;

    setIsSubmitting(true);
    try {
      // TODO: Submit to backend
      console.log('Submitting shipment:', formData);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      alert('تم إنشاء الشحنة بنجاح! ✅');
    } catch (error) {
      console.error('Error submitting shipment:', error);
      alert('حدث خطأ. حاول مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedToNext = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!formData.direction;
      case 2:
        return !!(
          formData.senderName &&
          formData.senderEmail &&
          formData.senderPhone &&
          formData.senderIdPassport &&
          formData.senderAddress &&
          formData.receiverName &&
          formData.receiverEmail &&
          formData.receiverPhone &&
          formData.receiverIdPassport &&
          formData.receiverAddress
        );
      case 3:
        return (
          formData.parcels &&
          formData.parcels.length > 0 &&
          formData.parcels.every((p) => p.description && p.weight > 0)
        );
      case 4:
        return (
          formData.parcelPhotos &&
          formData.parcelPhotos.length >= 5 &&
          formData.contentPhotos &&
          formData.contentPhotos.length >= 3
        );
      case 5:
        return true;
      case 6:
        return formData.termsAccepted === true;
      case 7:
        return false;
      default:
        return true;
    }
  };

  const canSubmit = (): boolean => {
    return (
      !!formData.paymentMethod &&
      (formData.paymentMethod !== 'internal_transfer' ||
        (!!formData.transferType && !!formData.transferSenderName && !!formData.transferSlip))
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-12">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-6xl font-black text-primary-dark mb-4">
            {language === 'ar' ? '🚀 إنشاء شحنة جديدة' : '🚀 Create New Shipment'}
          </h1>
          <p className="text-xl text-gray-600 font-medium">
            {language === 'ar'
              ? 'أكمل النموذج بدقة لضمان شحن سريع وآمن'
              : 'Complete the form accurately for fast and secure shipping'}
          </p>
        </motion.div>

        {/* Step Indicator */}
        <StepIndicator currentStep={currentStep} totalSteps={7} language={language} />

        {/* Form Steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 1 && (
              <Step1Direction
                selectedDirection={formData.direction}
                onDirectionChange={(direction) => updateFormData('direction', direction)}
                language={language}
              />
            )}

            {currentStep === 2 && (
              <Step2ClientInfo data={formData} onChange={updateFormData} language={language} />
            )}

            {currentStep === 3 && (
              <Step3PackageDetails data={formData} onChange={updateFormData} language={language} />
            )}

            {currentStep === 4 && (
              <Step4OptionalServices data={formData} onChange={updateFormData} language={language} />
            )}

            {currentStep === 5 && <Step5Pricing data={formData} language={language} />}

            {currentStep === 6 && (
              <Step6Review data={formData} onChange={updateFormData} pricing={pricing} language={language} />
            )}

            {currentStep === 7 && (
              <Step7Payment
                data={formData}
                onChange={updateFormData}
                pricing={pricing}
                language={language}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="max-w-7xl mx-auto px-4 mt-12">
          <NavigationButtons
            onPrevious={currentStep > 1 ? handlePrevious : undefined}
            onNext={currentStep < 7 ? handleNext : undefined}
            onSubmit={currentStep === 7 ? handleSubmit : undefined}
            showPrevious={currentStep > 1}
            showNext={currentStep < 7}
            showSubmit={currentStep === 7}
            nextDisabled={!canProceedToNext()}
            submitDisabled={!canSubmit()}
            isLoading={isSubmitting}
            language={language}
          />
        </div>
      </div>
    </div>
  );
}
