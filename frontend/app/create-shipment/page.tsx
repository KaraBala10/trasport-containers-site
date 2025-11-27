"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useMemo } from "react";
import Step1Direction from "@/components/ShipmentForm/Step1Direction";
import Step3SenderReceiver from "@/components/ShipmentForm/Step3SenderReceiver";
import Step4ParcelDetails from "@/components/ShipmentForm/Step4ParcelDetails";
import Step5Pricing from "@/components/ShipmentForm/Step5Pricing";
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
import { PricingResult } from "@/types/pricing";
import { apiService } from "@/lib/api";

const TOTAL_STEPS = 8;

export default function CreateShipmentPage() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState<ShippingDirection | null>(null);
  const [shipmentTypes, setShipmentTypes] = useState<ShipmentType[]>([
    "parcel-lcl",
  ]);
  const [sender, setSender] = useState<PersonInfo | null>(null);
  const [receiver, setReceiver] = useState<PersonInfo | null>(null);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [wantsInsurance, setWantsInsurance] = useState<boolean>(false);
  const [declaredShipmentValue, setDeclaredShipmentValue] = useState<number>(0);
  const [euPickupAddress, setEUPickupAddress] = useState<string>("");
  const [euPickupWeight, setEUPickupWeight] = useState<number>(0);
  const [euPickupCity, setEUPickupCity] = useState<string>("");
  const [euPickupPostalCode, setEUPickupPostalCode] = useState<string>("");
  const [euPickupCountry, setEUPickupCountry] = useState<string>("");
  const [selectedEUShippingMethod, setSelectedEUShippingMethod] = useState<
    number | null
  >(null);
  const [selectedEUShippingPrice, setSelectedEUShippingPrice] =
    useState<number>(0);
  const [selectedEUShippingName, setSelectedEUShippingName] =
    useState<string>("");
  const [syriaProvince, setSyriaProvince] = useState<string>("");
  const [syriaWeight, setSyriaWeight] = useState<number>(0);
  const [syriaTransportPrice, setSyriaTransportPrice] = useState<number>(0);
  const [syriaTransportDetails, setSyriaTransportDetails] = useState<any>(null);
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
  const [isParcelDetailsValid, setIsParcelDetailsValid] =
    useState<boolean>(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Calculate pricing using API for base price - only when user reaches Step 5
  useEffect(() => {
    const calculatePricing = async () => {
      // Only calculate when user is on Step 5 (Pricing Summary)
      if (currentStep !== 5) {
        return;
      }

      if (parcels.length === 0) {
        setPricing(null);
        return;
      }

      setPricingLoading(true);

      try {
        // Separate parcels by type using isElectronicsShipment flag
        // Electronics Shipments: parcels marked with isElectronicsShipment flag
        const electronicsParcels = parcels.filter(
          (p) => p.isElectronicsShipment === true
        );

        // Large Items: parcels with itemType field
        const largeItemsParcels = parcels.filter((p) => p.itemType);

        // Regular Parcels: all other parcels
        const regularParcels = parcels.filter(
          (p) => !p.isElectronicsShipment && !p.itemType
        );

        // Prepare parcels data for API
        // Include parcels with productCategory OR packagingType (to calculate packaging costs)
        const parcelsForPricing = regularParcels
          .filter((p) => p.productCategory || p.packagingType) // Include if has product OR packaging
          .map((p) => ({
            weight: p.weight || 0,
            cbm: p.cbm || 0,
            repeatCount: p.repeatCount || 1,
            productCategory: p.productCategory || undefined,
            packagingType: p.packagingType || undefined,
          }));

        // Call API to calculate base price using Price table
        let basePrice: {
          priceByWeight: number;
          priceByCBM: number;
          final: number;
          packagingCost?: number;
          insuranceCost?: number;
          totalPrice?: number;
        };
        let packagingCostFromAPI = 0;
        let insuranceCostFromAPI = 0;
        if (parcelsForPricing.length > 0) {
          try {
            // Aggregate insurance values from all parcels
            const totalDeclaredShipmentValue = parcels.reduce((sum, parcel) => {
              if (parcel.wantsInsurance || parcel.isElectronicsShipment) {
                return sum + (parcel.declaredShipmentValue || 0);
              }
              return sum;
            }, 0);

            const apiResponse = await apiService.calculatePricing(
              parcelsForPricing,
              language,
              totalDeclaredShipmentValue
            );
            if (apiResponse.data.success) {
              // Store packaging cost, insurance cost, and total price from API
              packagingCostFromAPI = apiResponse.data.packagingCost || 0;
              insuranceCostFromAPI = apiResponse.data.insuranceCost || 0;
              const totalPriceFromAPI =
                apiResponse.data.totalPrice || apiResponse.data.basePrice;

              basePrice = {
                priceByWeight: apiResponse.data.priceByWeight,
                priceByCBM: apiResponse.data.priceByCBM,
                final: apiResponse.data.basePrice,
                packagingCost: packagingCostFromAPI,
                insuranceCost: insuranceCostFromAPI,
                totalPrice: totalPriceFromAPI,
              } as any;
              (basePrice as any).parcelCalculation =
                apiResponse.data.parcelCalculation || 0;
              (basePrice as any).maxBaseOrParcel =
                apiResponse.data.maxBaseOrParcel || apiResponse.data.basePrice;
            } else {
              // Fallback if API returns error
              basePrice = {
                priceByWeight: 0,
                priceByCBM: 0,
                final: 75, // Minimum
              };
            }
          } catch (error) {
            console.error("Error calling pricing API:", error);
            // Fallback on error
            basePrice = {
              priceByWeight: 0,
              priceByCBM: 0,
              final: 75, // Minimum
            };
          }
        } else {
          basePrice = {
            priceByWeight: 0,
            priceByCBM: 0,
            final: 0,
          };
        }

        // Calculate Electronics Pricing separately (per piece from Price table, minimum 75€)
        let electronicsPricing:
          | {
              total: number;
              breakdown: {
                piecePrice: number;
                insurance: number;
                packaging: number;
                final: number;
              };
            }
          | undefined;
        if (electronicsParcels.length > 0) {
          // Get prices from API for electronics
          const pricesResponse = await apiService.getPrices();
          const pricesData = pricesResponse.data.success
            ? pricesResponse.data.prices
            : pricesResponse.data;

          // Calculate electronics price using Price table and repeatCount
          let electronicsTotal = 0;
          electronicsParcels.forEach((parcel) => {
            const priceEntry = pricesData.find(
              (p: any) => p.id.toString() === parcel.productCategory
            );
            if (priceEntry) {
              const pricePerPiece = parseFloat(priceEntry.price_per_kg);
              const repeatCount = parcel.repeatCount || 1;
              electronicsTotal += pricePerPiece * repeatCount;
            }
          });

          // Calculate insurance for electronics (forced)
          const electronicsInsuranceValue = electronicsParcels.reduce(
            (sum, p) =>
              sum + (p.declaredShipmentValue || 0) * (p.repeatCount || 1),
            0
          );
          const electronicsInsurance =
            (electronicsTotal + electronicsInsuranceValue) * 0.015;

          // Calculate packaging for electronics
          // Base packaging: 5€ per piece × repeatCount (forced)
          let electronicsPackaging = 0;
          electronicsParcels.forEach((p) => {
            const repeatCount = p.repeatCount || 1;
            // Add base packaging: 5€ × repeatCount
            electronicsPackaging += 5 * repeatCount;
          });

          // Note: Additional packaging from packagingType will be calculated by backend API
          // and added to the total packagingCostFromAPI

          electronicsPricing = {
            total:
              electronicsTotal + electronicsInsurance + electronicsPackaging,
            breakdown: {
              piecePrice: electronicsTotal,
              insurance: electronicsInsurance,
              packaging: electronicsPackaging,
              final:
                electronicsTotal + electronicsInsurance + electronicsPackaging,
            },
          };
        }

        // Calculate Grand Total using Backend API data only
        const electronicsTotal = electronicsPricing
          ? electronicsPricing.total
          : 0;

        // Build pricing result directly from Backend API
        const pricingResult = {
          basePrice:
            regularParcels.length > 0
              ? {
                  priceByWeight: basePrice.priceByWeight,
                  priceByCBM: basePrice.priceByCBM,
                  final: basePrice.final,
                }
              : {
                  priceByWeight: 0,
                  priceByCBM: 0,
                  final: 0,
                },
          // Parcel price (same as base price for now)
          parcelPrice: {
            total: regularParcels.length > 0 ? basePrice.final : 0,
            breakdown: {
              priceByWeight:
                regularParcels.length > 0 ? basePrice.priceByWeight : 0,
              priceByCBM: regularParcels.length > 0 ? basePrice.priceByCBM : 0,
              priceByProduct: 0,
              final: regularParcels.length > 0 ? basePrice.final : 0,
            },
          },
          // Electronics pricing from Backend
          electronicsPrice: electronicsPricing,
          // Packaging cost from Backend API
          packaging: {
            initial: 0,
            final: packagingCostFromAPI,
            total: packagingCostFromAPI,
          },
          // Insurance cost from Backend API
          insurance: {
            optional: insuranceCostFromAPI,
            mandatory: 0,
            total: insuranceCostFromAPI,
          },
          // Grand Total: Base LCL Price + Electronics + packaging + insurance (all from Backend)
          grandTotal:
            (regularParcels.length > 0 ? basePrice.final : 0) +
            electronicsTotal +
            packagingCostFromAPI +
            insuranceCostFromAPI,
        };
        // Store additional info for display
        (pricingResult as any).parcelPackagingCost = packagingCostFromAPI;
        (pricingResult as any).insuranceCostFromAPI = insuranceCostFromAPI;

        console.log(
          "✅ All pricing calculated from Backend API:",
          pricingResult
        );
        setPricing(pricingResult);
      } catch (error) {
        console.error("❌ Error calculating pricing from Backend:", error);
        // Set minimal fallback pricing (Backend required)
        setPricing({
          basePrice: {
            priceByWeight: 0,
            priceByCBM: 0,
            final: 75, // Minimum base price
          },
          packaging: {
            initial: 0,
            final: 0,
            total: 0,
          },
          insurance: {
            optional: 0,
            mandatory: 0,
            total: 0,
          },
          grandTotal: 75,
        } as any);

        alert(
          language === "ar"
            ? "حدث خطأ في حساب الأسعار. الرجاء المحاولة مرة أخرى."
            : "Error calculating pricing. Please try again."
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
      step5Title: "النقل الداخلي",
      step6Title: "ملخص التسعير",
      step7Title: "مراجعة وتأكيد",
      step8Title: "تم إنشاء الشحنة",
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
      step5Title: "Internal Transport",
      step6Title: "Pricing Summary",
      step7Title: "Review & Confirm",
      step8Title: "Shipment Created",
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
                            language === "ar"
                              ? "M15 19l-7-7 7-7"
                              : "M9 5l7 7-7 7"
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
                        d={
                          language === "ar" ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"
                        }
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
                        d={
                          language === "ar" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"
                        }
                      />
                    </motion.svg>
                  </span>
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {/* Step 3 Content - Parcel Details */}
          {currentStep === 3 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-2xl font-bold text-primary-dark mb-6 text-center">
                {t.step5Title}
              </h2>
              <Step4ParcelDetails
                shipmentTypes={shipmentTypes}
                parcels={parcels}
                onParcelsChange={setParcels}
                language={language}
                onValidationChange={setIsParcelDetailsValid}
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
                        d={
                          language === "ar" ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"
                        }
                      />
                    </motion.svg>
                    {t.back}
                  </span>
                </motion.button>

                {/* Continue Button */}
                <motion.button
                  onClick={() => setCurrentStep(4)}
                  disabled={!isParcelDetailsValid}
                  className={`relative px-20 py-5 font-bold text-xl rounded-3xl shadow-2xl transition-all duration-500 overflow-hidden group ${
                    isParcelDetailsValid
                      ? "bg-gradient-to-r from-primary-yellow to-primary-yellow/90 text-primary-dark hover:shadow-primary-yellow/50"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  whileHover={
                    isParcelDetailsValid ? { scale: 1.08, y: -2 } : {}
                  }
                  whileTap={isParcelDetailsValid ? { scale: 0.96 } : {}}
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
            </motion.div>
          )}

          {/* Step 4 Content - Internal Transport */}
          {currentStep === 4 && direction && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
            >
              <Step8InternalTransport
                direction={direction}
                language={language}
                euPickupAddress={euPickupAddress}
                onEUPickupAddressChange={setEUPickupAddress}
                euPickupWeight={euPickupWeight}
                onEUPickupWeightChange={setEUPickupWeight}
                euPickupCity={euPickupCity}
                onEUPickupCityChange={setEUPickupCity}
                euPickupPostalCode={euPickupPostalCode}
                onEUPickupPostalCodeChange={setEUPickupPostalCode}
                euPickupCountry={euPickupCountry}
                onEUPickupCountryChange={setEUPickupCountry}
                selectedEUShippingMethod={selectedEUShippingMethod}
                onEUShippingMethodChange={(id, price, name) => {
                  setSelectedEUShippingMethod(id);
                  setSelectedEUShippingPrice(price || 0);
                  setSelectedEUShippingName(name || "");
                }}
                syriaProvince={syriaProvince}
                onSyriaProvinceChange={setSyriaProvince}
                syriaWeight={syriaWeight}
                onSyriaWeightChange={setSyriaWeight}
                onSyriaTransportPriceChange={(price, details) => {
                  console.log("✅ Received Syria Transport Data:", {
                    price,
                    details,
                  });
                  setSyriaTransportPrice(price);
                  setSyriaTransportDetails(details);
                }}
              />
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
                        d={
                          language === "ar" ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"
                        }
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
                        d={
                          language === "ar" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"
                        }
                      />
                    </motion.svg>
                  </span>
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {/* Step 5 Content - Pricing Summary */}
          {currentStep === 5 && (
            <motion.div
              key="step5"
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
                <>
                  {console.log("📤 Sending to Step5Pricing:", {
                    direction,
                    selectedEUShippingPrice,
                    selectedEUShippingName,
                    syriaTransportPrice,
                    syriaTransportDetails,
                    pricingGrandTotal: pricing.grandTotal,
                  })}
                  <Step5Pricing
                    pricing={pricing}
                    language={language}
                    direction={direction}
                    selectedEUShippingPrice={selectedEUShippingPrice}
                    selectedEUShippingName={selectedEUShippingName}
                    syriaProvince={syriaProvince}
                    syriaTransportPrice={syriaTransportPrice}
                    syriaTransportDetails={syriaTransportDetails}
                  />
                </>
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
                        d={
                          language === "ar" ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"
                        }
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
                        d={
                          language === "ar" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"
                        }
                      />
                    </motion.svg>
                  </span>
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {/* Step 6 Content - Review */}
          {currentStep === 6 && direction && (
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
                  setCurrentStep(7);
                }}
                language={language}
                selectedEUShippingName={selectedEUShippingName}
                selectedEUShippingPrice={selectedEUShippingPrice}
                syriaTransportDetails={syriaTransportDetails}
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
                        d={
                          language === "ar" ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"
                        }
                      />
                    </motion.svg>
                    {t.back}
                  </span>
                </motion.button>

                {/* Continue Button */}
                <motion.button
                  onClick={() => setCurrentStep(7)}
                  disabled={!acceptedTerms || !acceptedPolicies}
                  className={`relative px-20 py-5 font-bold text-xl rounded-3xl shadow-2xl transition-all duration-500 overflow-hidden group ${
                    acceptedTerms && acceptedPolicies
                      ? "bg-gradient-to-r from-primary-yellow to-primary-yellow/90 text-primary-dark hover:shadow-primary-yellow/50"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  whileHover={
                    acceptedTerms && acceptedPolicies
                      ? { scale: 1.08, y: -2 }
                      : {}
                  }
                  whileTap={
                    acceptedTerms && acceptedPolicies ? { scale: 0.96 } : {}
                  }
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
            </motion.div>
          )}

          {/* Step 7 Content - Payment */}
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
                        d={
                          language === "ar" ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"
                        }
                      />
                    </motion.svg>
                    {t.back}
                  </span>
                </motion.button>

                {/* Continue Button - Payment step creates shipment */}
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
                        // Packaging is now handled in parcel cards via packagingType field
                        // Insurance is aggregated from all parcels
                        declared_shipment_value: parcels.reduce(
                          (sum, parcel) => {
                            if (
                              parcel.wantsInsurance ||
                              parcel.productCategory === "MOBILE_PHONE" ||
                              parcel.productCategory === "LAPTOP"
                            ) {
                              return sum + (parcel.declaredShipmentValue || 0);
                            }
                            return sum;
                          },
                          0
                        ),
                        eu_pickup_address: euPickupAddress,
                        eu_pickup_weight: euPickupWeight,
                        eu_pickup_city: euPickupCity,
                        eu_pickup_postal_code: euPickupPostalCode,
                        eu_pickup_country: euPickupCountry,
                        selected_eu_shipping_method: selectedEUShippingMethod,
                        syria_province: syriaProvince,
                        syria_weight: syriaWeight,
                        payment_method: paymentMethod,
                        transfer_sender_name: transferSenderName,
                        transfer_reference: transferReference,
                        accepted_terms: acceptedTerms,
                        accepted_policies: acceptedPolicies,
                      };

                      // Create shipment via API
                      const response = await apiService.createShipment(
                        shipmentData
                      );

                      if (response.data.success) {
                        setShipmentId(response.data.shipment_id);
                        setCurrentStep(8); // Go to confirmation
                      } else {
                        console.error(
                          "Failed to create shipment:",
                          response.data.error
                        );
                        alert(
                          language === "ar"
                            ? "فشل إنشاء الشحنة. يرجى المحاولة مرة أخرى."
                            : "Failed to create shipment. Please try again."
                        );
                      }
                    } catch (error) {
                      console.error("Error creating shipment:", error);
                      alert(
                        language === "ar"
                          ? "حدث خطأ أثناء إنشاء الشحنة. يرجى المحاولة مرة أخرى."
                          : "An error occurred while creating the shipment. Please try again."
                      );
                    } finally {
                      setIsCreatingShipment(false);
                    }
                  }}
                  disabled={
                    isCreatingShipment ||
                    !paymentMethod ||
                    !acceptedTerms ||
                    !acceptedPolicies
                  }
                  className={`relative px-20 py-5 font-bold text-xl rounded-3xl shadow-2xl transition-all duration-500 overflow-hidden group ${
                    isCreatingShipment ||
                    !paymentMethod ||
                    !acceptedTerms ||
                    !acceptedPolicies
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-primary-yellow to-primary-yellow/90 text-primary-dark hover:shadow-primary-yellow/50"
                  }`}
                  whileHover={
                    !isCreatingShipment &&
                    paymentMethod &&
                    acceptedTerms &&
                    acceptedPolicies
                      ? { scale: 1.08, y: -2 }
                      : {}
                  }
                  whileTap={
                    !isCreatingShipment &&
                    paymentMethod &&
                    acceptedTerms &&
                    acceptedPolicies
                      ? { scale: 0.96 }
                      : {}
                  }
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
                        d={
                          language === "ar" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"
                        }
                      />
                    </motion.svg>
                  </span>
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {/* Step 8 Content - Confirmation */}
          {currentStep === 8 && direction && shipmentId && (
            <motion.div
              key="step8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-2xl font-bold text-primary-dark mb-6 text-center">
                {t.step8Title}
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

      <Footer />
    </div>
  );
}
