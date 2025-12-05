"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useMemo } from "react";

// grecaptcha types are defined in types/grecaptcha.d.ts
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
import { ShippingDirection, Parcel, PersonInfo } from "@/types/shipment";
import { PricingResult } from "@/types/pricing";
import { apiService } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import { useReCaptcha } from "@/components/ReCaptchaWrapper";

const TOTAL_STEPS = 8;

export default function CreateShipmentPage() {
  const router = useRouter();
  const { language, setLanguage, mounted } = useLanguage();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const { executeRecaptcha } = useReCaptcha();
  const [currentStep, setCurrentStep] = useState(1);

  // reCAPTCHA state
  const recaptchaSiteKey =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""
      : "";
  const isDevelopment = process.env.NODE_ENV === "development";
  const [recaptchaToken, setRecaptchaToken] = useState<string>("");
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
  const [direction, setDirection] = useState<ShippingDirection | null>(null);
  const [sender, setSender] = useState<PersonInfo | null>(null);
  const [receiver, setReceiver] = useState<PersonInfo | null>(null);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [wantsInsurance, setWantsInsurance] = useState<boolean>(false);
  const [declaredShipmentValue, setDeclaredShipmentValue] = useState<number>(0);
  // Sendcloud Parcel Form Fields
  const [euPickupName, setEUPickupName] = useState<string>("");
  const [euPickupCompanyName, setEUPickupCompanyName] = useState<string>("");
  const [euPickupAddress, setEUPickupAddress] = useState<string>("");
  const [euPickupHouseNumber, setEUPickupHouseNumber] = useState<string>("");
  const [euPickupCity, setEUPickupCity] = useState<string>("");
  const [euPickupPostalCode, setEUPickupPostalCode] = useState<string>("");
  const [euPickupCountry, setEUPickupCountry] = useState<string>("");
  const [euPickupEmail, setEUPickupEmail] = useState<string>("");
  const [euPickupTelephone, setEUPickupTelephone] = useState<string>("");
  const [euPickupWeight, setEUPickupWeight] = useState<number>(0);
  const [selectedEUShippingMethod, setSelectedEUShippingMethod] = useState<
    number | null
  >(null);
  const [selectedEUShippingPrice, setSelectedEUShippingPrice] =
    useState<number>(0); // Sendcloud original price
  const [selectedEUShippingName, setSelectedEUShippingName] =
    useState<string>("");
  const [selectedEUShippingProfitAmount, setSelectedEUShippingProfitAmount] =
    useState<number>(0); // Calculated profit amount
  const [
    selectedEUShippingProfitMarginPercent,
    setSelectedEUShippingProfitMarginPercent,
  ] = useState<number>(0); // Profit margin percentage
  const [selectedEUShippingTotalPrice, setSelectedEUShippingTotalPrice] =
    useState<number>(0); // Total price (calculated in backend)
  const [syriaProvince, setSyriaProvince] = useState<string>("");
  const [syriaWeight, setSyriaWeight] = useState<number>(0);
  const [syriaTransportPrice, setSyriaTransportPrice] = useState<number>(0);
  const [syriaTransportDetails, setSyriaTransportDetails] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<
    "stripe" | "cash" | "internal-transfer" | null
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
  const [isProcessingPayment, setIsProcessingPayment] =
    useState<boolean>(false);

  // Initialize reCAPTCHA widget after component mounts and script loads
  useEffect(() => {
    if (!mounted || !isDevelopment || !recaptchaSiteKey) return;

    const initRecaptcha = () => {
      const widgetElement = document.getElementById(
        "recaptcha-widget-shipment"
      );
      if (!widgetElement) {
        setTimeout(initRecaptcha, 200);
        return;
      }

      if (!window.grecaptcha) {
        setTimeout(initRecaptcha, 200);
        return;
      }

      // Check if already rendered
      if (widgetElement.hasChildNodes()) {
        setRecaptchaLoaded(true);
        return;
      }

      window.grecaptcha.ready(() => {
        try {
          const widgetId = window.grecaptcha!.render(
            "recaptcha-widget-shipment",
            {
              sitekey: recaptchaSiteKey,
              size: "normal",
              theme: "light",
              callback: (token: string) => {
                console.log(
                  "reCAPTCHA verified:",
                  token.substring(0, 20) + "..."
                );
                setRecaptchaToken(token);
              },
              "expired-callback": () => {
                console.log("reCAPTCHA expired");
                setRecaptchaToken("");
              },
              "error-callback": () => {
                console.error("reCAPTCHA error");
                setRecaptchaToken("");
              },
            }
          );
          console.log("reCAPTCHA widget rendered, widgetId:", widgetId);
          setRecaptchaLoaded(true);
        } catch (error) {
          console.error("Error rendering reCAPTCHA:", error);
          setRecaptchaLoaded(false);
        }
      });
    };

    // Start initialization after a delay to ensure script is loaded
    const timer = setTimeout(initRecaptcha, 1000);
    return () => clearTimeout(timer);
  }, [mounted, isDevelopment, recaptchaSiteKey]);

  // Check if reCAPTCHA is required and completed
  const isRecaptchaValid = useMemo(() => {
    // If no reCAPTCHA key is configured, it's not required
    if (!recaptchaSiteKey) {
      return true;
    }

    // In development mode with v2 widget (visible checkbox)
    // Button should be disabled if widget is loaded but not checked
    if (isDevelopment && recaptchaLoaded) {
      return !!recaptchaToken; // Must have token if widget is loaded
    }

    // In production with v3 (invisible, executed on submit)
    // Allow button to be enabled (v3 executes on submit)
    if (!isDevelopment) {
      return true;
    }

    // If widget hasn't loaded yet, allow button (will be disabled once loaded)
    return true;
  }, [recaptchaSiteKey, isDevelopment, recaptchaLoaded, recaptchaToken]);

  const [isParcelDetailsValid, setIsParcelDetailsValid] =
    useState<boolean>(false);

  // Validation functions for each step
  const isStep2Valid = useMemo(() => {
    if (!sender || !receiver) return false;

    // Validate sender
    // eu-sy: sender needs city + country
    // sy-eu: sender needs country + province (no city)
    const senderValid =
      sender.fullName?.trim() &&
      sender.phone?.trim() &&
      sender.email?.trim() &&
      sender.street?.trim() &&
      (direction === "eu-sy"
        ? sender.city?.trim() && sender.country?.trim()
        : sender.country?.trim() && sender.province?.trim());

    // Validate receiver
    // eu-sy: receiver needs country + province (no city)
    // sy-eu: receiver needs city + country
    const receiverValid =
      receiver.fullName?.trim() &&
      receiver.phone?.trim() &&
      receiver.email?.trim() &&
      receiver.street?.trim() &&
      (direction === "eu-sy"
        ? receiver.country?.trim() && receiver.province?.trim()
        : receiver.city?.trim() && receiver.country?.trim());

    return senderValid && receiverValid;
  }, [sender, receiver, direction]);

  const isStep4Valid = useMemo(() => {
    // Internal Transport is completely optional - users can proceed without filling any fields
    // Both EU Transport and Syria Transport are optional sections
    // Users can continue even if fields are empty or partially filled
    return true;
  }, []);

  const isStep5Valid = useMemo(() => {
    return pricing !== null && pricing.grandTotal > 0;
  }, [pricing]);

  const isStep6Valid = useMemo(() => {
    return acceptedTerms && acceptedPolicies;
  }, [acceptedTerms, acceptedPolicies]);

  const isStep7Valid = useMemo(() => {
    // Payment method is required
    if (!paymentMethod) return false;

    // For eu-sy direction, only Stripe is allowed
    if (direction === "eu-sy" && paymentMethod !== "stripe") {
      return false;
    }

    // If internal-transfer is selected, validate required fields
    if (paymentMethod === "internal-transfer") {
      return (
        transferSenderName?.trim() &&
        transferReference?.trim() &&
        transferSlip !== null
      );
    }

    // For stripe and cash, just having payment method is enough
    return true;
  }, [
    paymentMethod,
    direction,
    transferSenderName,
    transferReference,
    transferSlip,
  ]);

  // Auto-select Stripe payment for eu-sy direction
  useEffect(() => {
    if (direction === "eu-sy" && currentStep >= 7 && !paymentMethod) {
      setPaymentMethod("stripe");
    }
  }, [direction, currentStep, paymentMethod]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Handle payment cancellation - update shipment to PENDING_PICKUP with full paid amount
  useEffect(() => {
    const handlePaymentCancellation = async () => {
      if (typeof window === "undefined") return;

      const urlParams = new URLSearchParams(window.location.search);
      const paymentStatus = urlParams.get("payment");
      const shipmentIdParam = urlParams.get("shipment_id");

      if (paymentStatus === "cancelled" && shipmentIdParam) {
        const shipmentId = parseInt(shipmentIdParam, 10);
        if (!isNaN(shipmentId)) {
          try {
            // Get shipment details to get total_price
            const shipmentResponse = await apiService.getShipment(shipmentId);
            const shipment = shipmentResponse.data;

            if (shipment && shipment.total_price) {
              // Update shipment to PENDING_PICKUP status with full paid amount
              await apiService.updateShipment(shipmentId, {
                status: "PENDING_PICKUP",
                amount_paid: shipment.total_price,
                payment_status: "paid",
              });

              showSuccess(
                language === "ar"
                  ? "تم تحديث الشحنة إلى حالة انتظار الاستلام مع المبلغ المدفوع بالكامل"
                  : "Shipment updated to Pending Pickup status with full paid amount"
              );

              // Redirect to dashboard
              router.push("/dashboard");
            }
          } catch (error: any) {
            console.error("Error handling payment cancellation:", error);
            showError(
              language === "ar"
                ? "حدث خطأ أثناء تحديث حالة الشحنة"
                : "An error occurred while updating shipment status"
            );
          }

          // Clean up URL parameters
          window.history.replaceState({}, "", "/create-shipment");
        }
      }
    };

    handlePaymentCancellation();
  }, [router, language, showSuccess, showError]);

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

        // Regular Parcels: all other parcels (non-electronics)
        const regularParcels = parcels.filter((p) => !p.isElectronicsShipment);

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

        showSuccess(
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
  ]);

  // Calculate electronics declared value for insurance
  // Check based on parcels with isElectronicsShipment flag or specific product categories
  const electronicsDeclaredValue = useMemo(() => {
    const electronicsParcels = parcels.filter(
      (p) =>
        p.isElectronicsShipment === true ||
        p.productCategory === "MOBILE_PHONE" ||
        p.productCategory === "LAPTOP" ||
        p.productCategory === "LARGE_MIRROR"
    );
    return electronicsParcels.reduce(
      (sum, p) => sum + (p.declaredValue || 0),
      0
    );
  }, [parcels]);

  // Calculate Grand Total with Transport
  const grandTotalWithTransport = useMemo(() => {
    if (!pricing) return 0;
    // Ensure all values are numbers to avoid string concatenation
    const baseTotal = Number(pricing.grandTotal) || 0;
    const euTransportPrice = Number(selectedEUShippingTotalPrice) || 0;
    const syriaTransportCost =
      Number(syriaTransportDetails?.calculated_price) || 0;
    const totalTransportPrice = euTransportPrice + syriaTransportCost;
    return baseTotal + totalTransportPrice;
  }, [pricing, selectedEUShippingTotalPrice, syriaTransportDetails]);

  // Handle Stripe Payment
  const handleStripePayment = async () => {
    if (!pricing || grandTotalWithTransport <= 0) {
      showSuccess(
        language === "ar"
          ? "يرجى التأكد من حساب السعر أولاً"
          : "Please ensure pricing is calculated first"
      );
      return;
    }

    if (!sender || !receiver) {
      showSuccess(
        language === "ar"
          ? "يرجى التأكد من إدخال بيانات المرسل والمستلم"
          : "Please ensure sender and receiver information is provided"
      );
      return;
    }

    setIsProcessingPayment(true);
    try {
      // Get reCAPTCHA v3 token (same pattern as register page)
      let recaptchaToken = "";
      const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

      if (recaptchaSiteKey) {
        if (executeRecaptcha) {
          try {
            recaptchaToken = await executeRecaptcha("create_shipment");
            console.log("reCAPTCHA v3 token obtained");
          } catch (recaptchaError) {
            console.error("reCAPTCHA execution failed:", recaptchaError);
            showError(
              language === "ar"
                ? "فشل التحقق من reCAPTCHA. يرجى المحاولة مرة أخرى."
                : "reCAPTCHA verification failed. Please try again."
            );
            setIsProcessingPayment(false);
            return;
          }
        } else {
          showError(
            language === "ar"
              ? "التحقق من reCAPTCHA مطلوب. يرجى المحاولة مرة أخرى."
              : "reCAPTCHA verification is required. Please try again."
          );
          setIsProcessingPayment(false);
          return;
        }
      }

      // First, create the shipment
      // Set country based on direction: eu-sy means receiver is in Syria, sy-eu means sender is in Syria
      const receiverCountry =
        direction === "eu-sy" ? "Syria" : receiver.country || "";
      const senderCountry =
        direction === "sy-eu" ? "Syria" : sender.country || "";

      const shipmentData = {
        direction: direction,
        sender_name: sender.fullName,
        sender_email: sender.email,
        sender_phone: sender.phone,
        sender_address: `${sender.street} ${sender.streetNumber}`.trim(),
        sender_city: sender.city,
        sender_postal_code: sender.postalCode || "",
        sender_country: senderCountry,
        receiver_name: receiver.fullName,
        receiver_email: receiver.email,
        receiver_phone: receiver.phone,
        receiver_address: `${receiver.street} ${receiver.streetNumber}`.trim(),
        receiver_city:
          direction === "eu-sy"
            ? receiver?.province || receiver?.country || ""
            : receiver?.city || "",
        receiver_postal_code: receiver.postalCode || "",
        receiver_country: receiverCountry,
        parcels: parcels,
        eu_pickup_name: euPickupName,
        eu_pickup_company_name: euPickupCompanyName,
        eu_pickup_address: euPickupAddress,
        eu_pickup_house_number: euPickupHouseNumber,
        eu_pickup_city: euPickupCity,
        eu_pickup_postal_code: euPickupPostalCode,
        eu_pickup_country: euPickupCountry,
        eu_pickup_email: euPickupEmail,
        eu_pickup_telephone: euPickupTelephone,
        eu_pickup_weight: euPickupWeight,
        selected_eu_shipping_method: selectedEUShippingMethod,
        selected_eu_shipping_name: selectedEUShippingName,
        syria_province: syriaProvince,
        syria_weight: syriaWeight,
        payment_method: "stripe",
        total_price: Number(Number(grandTotalWithTransport || 0).toFixed(2)),
        recaptcha_token: recaptchaToken || undefined,
      };

      const shipmentResponse = await apiService.createShipment(shipmentData);
      const shipmentId = shipmentResponse.data?.id;

      if (!shipmentId) {
        throw new Error("Failed to create shipment");
      }

      // Build success and cancel URLs based on current origin
      const baseUrl =
        typeof window !== "undefined"
          ? window.location.origin
          : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      // Note: session_id will be added after checkout session is created
      const successUrl = `${baseUrl}/payment-success?type=shipment&shipment_id=${shipmentId}`;
      const cancelUrl = `${baseUrl}/create-shipment?payment=cancelled&shipment_id=${shipmentId}`;

      // Then create checkout session with shipment ID in metadata
      const checkoutResponse = await apiService.createShipmentCheckout({
        shipment_id: shipmentId,
        amount: grandTotalWithTransport,
        currency: "eur",
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          direction: direction || "",
          shipment_id: shipmentId.toString(),
        },
      });

      console.log("✅ Checkout response:", checkoutResponse.data);

      if (
        checkoutResponse.data?.success &&
        checkoutResponse.data?.checkout_url
      ) {
        // Update shipment with stripe_session_id
        if (checkoutResponse.data?.session_id) {
          try {
            await apiService.updateShipment(shipmentId, {
              stripe_session_id: checkoutResponse.data.session_id,
              payment_status: "pending",
            });
          } catch (updateError) {
            console.error(
              "⚠️ Failed to update shipment with session ID:",
              updateError
            );
            // Continue anyway - the checkout session is created
          }
        }

        // Redirect to Stripe checkout
        // Note: session_id will be included in success URL via {CHECKOUT_SESSION_ID} placeholder
        console.log("🔗 Redirecting to:", checkoutResponse.data.checkout_url);
        window.location.href = checkoutResponse.data.checkout_url;
      } else {
        console.error("❌ Checkout failed:", checkoutResponse.data);
        throw new Error(
          checkoutResponse.data?.error || "Failed to create checkout session"
        );
      }
    } catch (error: any) {
      console.error("Error creating Stripe checkout:", error);
      console.error("Error response:", error.response?.data);

      // Extract error message from backend response
      let errorMessage = "";
      if (error.response?.data) {
        const errorData = error.response.data;
        // Handle Django REST Framework validation errors
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (typeof errorData === "object") {
          // Get first validation error
          const firstError = Object.values(errorData)[0];
          if (Array.isArray(firstError)) {
            errorMessage = firstError[0];
          } else if (typeof firstError === "string") {
            errorMessage = firstError;
          }
        } else {
          errorMessage = String(errorData);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      showSuccess(
        language === "ar"
          ? errorMessage ||
              "حدث خطأ أثناء إنشاء جلسة الدفع. يرجى التحقق من البيانات والمحاولة مرة أخرى."
          : errorMessage ||
              "An error occurred while creating payment session. Please check your data and try again."
      );
      setIsProcessingPayment(false);
    }
  };

  const translations = {
    ar: {
      title: "إنشاء شحنة جديدة",
      subtitle: "اختر اتجاه الشحن لبدء رحلتك",
      step1Title: "اختر اتجاه الشحن",
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
      syriaCenter: "مركز الشرق الأوسط",
      email: "البريد الإلكتروني",
      phone: "الهاتف",
    },
    en: {
      title: "Create New Shipment",
      subtitle: "Select shipping direction to begin your journey",
      step1Title: "Select Shipping Direction",
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
      syriaCenter: "Middle East Center",
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
                  disabled={!isStep2Valid}
                  className={`relative px-20 py-5 font-bold text-xl rounded-3xl shadow-2xl transition-all duration-500 overflow-hidden group ${
                    isStep2Valid
                      ? "bg-gradient-to-r from-primary-yellow to-primary-yellow/90 text-primary-dark hover:shadow-primary-yellow/50"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  whileHover={isStep2Valid ? { scale: 1.08, y: -2 } : {}}
                  whileTap={isStep2Valid ? { scale: 0.96 } : {}}
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
                euPickupName={euPickupName}
                onEUPickupNameChange={setEUPickupName}
                euPickupCompanyName={euPickupCompanyName}
                onEUPickupCompanyNameChange={setEUPickupCompanyName}
                euPickupAddress={euPickupAddress}
                onEUPickupAddressChange={setEUPickupAddress}
                euPickupHouseNumber={euPickupHouseNumber}
                onEUPickupHouseNumberChange={setEUPickupHouseNumber}
                euPickupCity={euPickupCity}
                onEUPickupCityChange={setEUPickupCity}
                euPickupPostalCode={euPickupPostalCode}
                onEUPickupPostalCodeChange={setEUPickupPostalCode}
                euPickupCountry={euPickupCountry}
                onEUPickupCountryChange={setEUPickupCountry}
                euPickupEmail={euPickupEmail}
                onEUPickupEmailChange={setEUPickupEmail}
                euPickupTelephone={euPickupTelephone}
                onEUPickupTelephoneChange={setEUPickupTelephone}
                euPickupWeight={euPickupWeight}
                onEUPickupWeightChange={setEUPickupWeight}
                selectedEUShippingMethod={selectedEUShippingMethod}
                onEUShippingMethodChange={(
                  id,
                  price,
                  name,
                  profitAmount,
                  profitMarginPercent,
                  totalPrice
                ) => {
                  console.log("🔵 onEUShippingMethodChange called with:", {
                    id,
                    price,
                    name,
                    profitAmount,
                    profitMarginPercent,
                    totalPrice,
                  });
                  setSelectedEUShippingMethod(id);
                  setSelectedEUShippingPrice(price || 0); // Sendcloud original price
                  setSelectedEUShippingName(name || "");
                  setSelectedEUShippingProfitAmount(profitAmount || 0); // Profit amount
                  setSelectedEUShippingProfitMarginPercent(
                    profitMarginPercent || 0
                  ); // Profit %
                  setSelectedEUShippingTotalPrice(totalPrice || 0); // Total (backend calculated)
                  console.log(
                    "✅ State updated - selectedEUShippingTotalPrice:",
                    totalPrice || 0
                  );
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
                  disabled={!isStep4Valid}
                  className={`relative px-20 py-5 font-bold text-xl rounded-3xl shadow-2xl transition-all duration-500 overflow-hidden group ${
                    isStep4Valid
                      ? "bg-gradient-to-r from-primary-yellow to-primary-yellow/90 text-primary-dark hover:shadow-primary-yellow/50"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  whileHover={isStep4Valid ? { scale: 1.08, y: -2 } : {}}
                  whileTap={isStep4Valid ? { scale: 0.96 } : {}}
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
                    selectedEUShippingTotalPrice,
                    selectedEUShippingProfitAmount,
                    selectedEUShippingProfitMarginPercent,
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
                    selectedEUShippingProfitAmount={
                      selectedEUShippingProfitAmount
                    }
                    selectedEUShippingProfitMarginPercent={
                      selectedEUShippingProfitMarginPercent
                    }
                    selectedEUShippingTotalPrice={selectedEUShippingTotalPrice}
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
                  disabled={!isStep5Valid}
                  className={`relative px-20 py-5 font-bold text-xl rounded-3xl shadow-2xl transition-all duration-500 overflow-hidden group ${
                    isStep5Valid
                      ? "bg-gradient-to-r from-primary-yellow to-primary-yellow/90 text-primary-dark hover:shadow-primary-yellow/50"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  whileHover={isStep5Valid ? { scale: 1.08, y: -2 } : {}}
                  whileTap={isStep5Valid ? { scale: 0.96 } : {}}
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
                sender={sender}
                receiver={receiver}
                parcels={parcels}
                pricing={pricing}
                acceptedTerms={acceptedTerms}
                acceptedPolicies={acceptedPolicies}
                onAcceptedTermsChange={setAcceptedTerms}
                onAcceptedPoliciesChange={setAcceptedPolicies}
                language={language}
                selectedEUShippingName={selectedEUShippingName}
                selectedEUShippingPrice={selectedEUShippingPrice}
                selectedEUShippingTotalPrice={selectedEUShippingTotalPrice}
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
                onPaymentMethodChange={(method) => {
                  // For eu-sy direction, only allow Stripe
                  if (
                    direction === "eu-sy" &&
                    method !== "stripe" &&
                    method !== null
                  ) {
                    setPaymentMethod("stripe");
                  } else {
                    setPaymentMethod(method);
                  }
                }}
                transferSenderName={transferSenderName}
                transferReference={transferReference}
                transferSlip={transferSlip}
                onTransferSenderNameChange={setTransferSenderName}
                onTransferReferenceChange={setTransferReference}
                onTransferSlipChange={setTransferSlip}
                language={language}
                grandTotal={grandTotalWithTransport}
                onStripePayment={handleStripePayment}
                isProcessingPayment={isProcessingPayment}
                hasInternalTransport={selectedEUShippingMethod !== null}
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

                    if (!isStep7Valid) {
                      showWarning(
                        language === "ar"
                          ? "يرجى إكمال جميع بيانات الدفع المطلوبة"
                          : "Please complete all required payment information"
                      );
                      return;
                    }

                    // If payment method is Stripe, use handleStripePayment instead of creating shipment directly
                    if (paymentMethod === "stripe") {
                      await handleStripePayment();
                      return;
                    }

                    setIsCreatingShipment(true);
                    try {
                      // Prepare shipment data for new API
                      // Set country based on direction: eu-sy means receiver is in Syria, sy-eu means sender is in Syria
                      const receiverCountry =
                        direction === "eu-sy"
                          ? "Syria"
                          : receiver?.country || "";
                      const senderCountry =
                        direction === "sy-eu" ? "Syria" : sender?.country || "";

                      // Validate sender based on direction
                      // sy-eu: sender needs country + province (no city)
                      // eu-sy: sender needs city + country
                      const isSYtoEU = direction === "sy-eu";
                      const senderValid = isSYtoEU
                        ? !!(
                            sender?.fullName?.trim() &&
                            sender?.email?.trim() &&
                            sender?.phone?.trim() &&
                            sender?.country?.trim() &&
                            sender?.province?.trim() &&
                            senderCountry
                          )
                        : !!(
                            sender?.fullName?.trim() &&
                            sender?.email?.trim() &&
                            sender?.phone?.trim() &&
                            sender?.city?.trim() &&
                            sender?.country?.trim() &&
                            senderCountry
                          );

                      if (!senderValid) {
                        // Debug: log what's missing
                        console.log("Sender validation failed:", {
                          direction,
                          isSYtoEU,
                          fullName: sender?.fullName,
                          email: sender?.email,
                          phone: sender?.phone,
                          country: sender?.country,
                          province: sender?.province,
                          city: sender?.city,
                          senderCountry,
                        });

                        showSuccess(
                          language === "ar"
                            ? isSYtoEU
                              ? "يرجى إكمال جميع بيانات المرسل المطلوبة (الاسم، البريد الإلكتروني، الهاتف، الدولة، المحافظة)"
                              : "يرجى إكمال جميع بيانات المرسل المطلوبة (الاسم، البريد الإلكتروني، الهاتف، المدينة، الدولة)"
                            : isSYtoEU
                            ? "Please complete all required sender information (name, email, phone, country, province)"
                            : "Please complete all required sender information (name, email, phone, city, country)"
                        );
                        setIsCreatingShipment(false);
                        return;
                      }

                      // Validate receiver based on direction
                      // eu-sy: receiver needs country + province (no city)
                      // sy-eu: receiver needs city + country
                      const isEUtoSY = direction === "eu-sy";
                      const receiverValid = isEUtoSY
                        ? !!(
                            receiver?.fullName?.trim() &&
                            receiver?.email?.trim() &&
                            receiver?.phone?.trim() &&
                            receiver?.country?.trim() &&
                            receiver?.province?.trim() &&
                            receiverCountry
                          )
                        : !!(
                            receiver?.fullName?.trim() &&
                            receiver?.email?.trim() &&
                            receiver?.phone?.trim() &&
                            receiver?.city?.trim() &&
                            receiver?.country?.trim() &&
                            receiverCountry
                          );

                      if (!receiverValid) {
                        // Debug: log what's missing
                        console.log("Receiver validation failed:", {
                          direction,
                          isEUtoSY,
                          fullName: receiver?.fullName,
                          email: receiver?.email,
                          phone: receiver?.phone,
                          country: receiver?.country,
                          province: receiver?.province,
                          city: receiver?.city,
                          receiverCountry,
                        });

                        showSuccess(
                          language === "ar"
                            ? isEUtoSY
                              ? "يرجى إكمال جميع بيانات المستقبل المطلوبة (الاسم، البريد الإلكتروني، الهاتف، الدولة، المحافظة)"
                              : "يرجى إكمال جميع بيانات المستقبل المطلوبة (الاسم، البريد الإلكتروني، الهاتف، المدينة، الدولة)"
                            : isEUtoSY
                            ? "Please complete all required receiver information (name, email, phone, country, province)"
                            : "Please complete all required receiver information (name, email, phone, city, country)"
                        );
                        setIsCreatingShipment(false);
                        return;
                      }

                      if (!sender?.street || !receiver?.street) {
                        showSuccess(
                          language === "ar"
                            ? "يرجى إدخال عنوان المرسل والمستقبل"
                            : "Please enter sender and receiver addresses"
                        );
                        setIsCreatingShipment(false);
                        return;
                      }

                      if (parcels.length === 0) {
                        showWarning(
                          language === "ar"
                            ? "يرجى إضافة طرد واحد على الأقل"
                            : "Please add at least one parcel"
                        );
                        setIsCreatingShipment(false);
                        return;
                      }

                      // Get reCAPTCHA v3 token (same pattern as register page)
                      let recaptchaToken = "";
                      const recaptchaSiteKey =
                        process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

                      if (recaptchaSiteKey) {
                        if (executeRecaptcha) {
                          try {
                            recaptchaToken = await executeRecaptcha(
                              "create_shipment"
                            );
                            console.log("reCAPTCHA v3 token obtained");
                          } catch (recaptchaError) {
                            console.error(
                              "reCAPTCHA execution failed:",
                              recaptchaError
                            );
                            showError(
                              language === "ar"
                                ? "فشل التحقق من reCAPTCHA. يرجى المحاولة مرة أخرى."
                                : "reCAPTCHA verification failed. Please try again."
                            );
                            setIsCreatingShipment(false);
                            return;
                          }
                        } else {
                          showError(
                            language === "ar"
                              ? "التحقق من reCAPTCHA مطلوب. يرجى المحاولة مرة أخرى."
                              : "reCAPTCHA verification is required. Please try again."
                          );
                          setIsCreatingShipment(false);
                          return;
                        }
                      }

                      // Prepare parcels data without File objects (for JSON)
                      // IMPORTANT: Do NOT include photos, devicePhoto, or electronicsPicture in JSON
                      // These are File objects and will be sent separately in FormData
                      const parcelsData = parcels.map((parcel) => {
                        const parcelData: any = {
                          id: parcel.id,
                          length: parcel.length,
                          width: parcel.width,
                          height: parcel.height,
                          weight: parcel.weight,
                          cbm: parcel.cbm,
                          productCategory: parcel.productCategory,
                          quantity: parcel.quantity,
                          repeatCount: parcel.repeatCount,
                          shipmentType: parcel.shipmentType,
                        };

                        // Add optional fields
                        if (parcel.isCustomProduct)
                          parcelData.isCustomProduct = parcel.isCustomProduct;
                        if (parcel.customProductName)
                          parcelData.customProductName =
                            parcel.customProductName;
                        if (parcel.packagingType)
                          parcelData.packagingType = parcel.packagingType;
                        if (parcel.hs_code) parcelData.hs_code = parcel.hs_code;
                        if (parcel.wantsInsurance)
                          parcelData.wantsInsurance = parcel.wantsInsurance;
                        if (parcel.declaredShipmentValue)
                          parcelData.declaredShipmentValue =
                            parcel.declaredShipmentValue;

                        // Electronics fields (but NOT devicePhoto or electronicsPicture - those are files)
                        if (parcel.isElectronicsShipment) {
                          parcelData.isElectronicsShipment =
                            parcel.isElectronicsShipment;
                          if (parcel.deviceType)
                            parcelData.deviceType = parcel.deviceType;
                          if (parcel.deviceModel)
                            parcelData.deviceModel = parcel.deviceModel;
                          if (parcel.declaredValue)
                            parcelData.declaredValue = parcel.declaredValue;
                          if (parcel.hasInvoice)
                            parcelData.hasInvoice = parcel.hasInvoice;
                          if (parcel.electronicsName)
                            parcelData.electronicsName = parcel.electronicsName;
                        }

                        // Explicitly exclude File objects (photos, devicePhoto, electronicsPicture)
                        // These will be sent separately in FormData
                        // Make sure these fields are NOT in parcelData
                        delete parcelData.photos;
                        delete parcelData.devicePhoto;
                        delete parcelData.electronicsPicture;

                        return parcelData;
                      });

                      // Create FormData for file uploads
                      const formData = new FormData();

                      // Add all shipment data as JSON string
                      formData.append(
                        "shipment_data",
                        JSON.stringify({
                          direction: direction,
                          sender_name: sender?.fullName || "",
                          sender_email: sender?.email || "",
                          sender_phone: sender?.phone || "",
                          sender_address:
                            sender?.street && sender?.streetNumber
                              ? `${sender.street} ${sender.streetNumber}`.trim()
                              : sender?.street || "",
                          sender_city:
                            direction === "sy-eu"
                              ? sender?.country || sender?.province || ""
                              : sender?.city || "",
                          sender_postal_code: sender?.postalCode || "",
                          sender_country: senderCountry,
                          receiver_name: receiver?.fullName || "",
                          receiver_email: receiver?.email || "",
                          receiver_phone: receiver?.phone || "",
                          receiver_address:
                            receiver?.street && receiver?.streetNumber
                              ? `${receiver.street} ${receiver.streetNumber}`.trim()
                              : receiver?.street || "",
                          receiver_city:
                            direction === "eu-sy"
                              ? receiver?.country || receiver?.province || ""
                              : receiver?.city || "",
                          receiver_postal_code: receiver?.postalCode || "",
                          receiver_country: receiverCountry,
                          parcels: parcelsData,
                          eu_pickup_name: euPickupName,
                          eu_pickup_company_name: euPickupCompanyName,
                          eu_pickup_address: euPickupAddress,
                          eu_pickup_house_number: euPickupHouseNumber,
                          eu_pickup_city: euPickupCity,
                          eu_pickup_postal_code: euPickupPostalCode,
                          eu_pickup_country: euPickupCountry,
                          eu_pickup_email: euPickupEmail,
                          eu_pickup_telephone: euPickupTelephone,
                          eu_pickup_weight: euPickupWeight,
                          selected_eu_shipping_method: selectedEUShippingMethod,
                          selected_eu_shipping_name: selectedEUShippingName,
                          syria_province: syriaProvince,
                          syria_weight: syriaWeight,
                          payment_method: paymentMethod,
                          transfer_sender_name: transferSenderName,
                          transfer_reference: transferReference,
                          total_price: Number(
                            Number(grandTotalWithTransport || 0).toFixed(2)
                          ),
                          recaptcha_token: recaptchaToken || undefined,
                        })
                      );

                      // Add parcel photos
                      parcels.forEach((parcel, parcelIndex) => {
                        // Parcel photos (for non-electronics)
                        if (parcel.photos && parcel.photos.length > 0) {
                          console.log(
                            `Adding ${parcel.photos.length} photos for parcel ${parcelIndex}`
                          );
                          parcel.photos.forEach((photo, photoIndex) => {
                            const key = `parcel_${parcelIndex}_photo_${photoIndex}`;
                            formData.append(key, photo);
                            console.log(
                              `Added photo: ${key}, size: ${photo.size}`
                            );
                          });
                        } else {
                          console.log(`Parcel ${parcelIndex} has no photos`);
                        }

                        // Electronics photos
                        if (parcel.isElectronicsShipment) {
                          console.log(
                            `Parcel ${parcelIndex} is electronics shipment`
                          );
                          if (parcel.devicePhoto) {
                            formData.append(
                              `parcel_${parcelIndex}_device_photo`,
                              parcel.devicePhoto
                            );
                            console.log(
                              `Added device photo for parcel ${parcelIndex}`
                            );
                          }
                          if (parcel.electronicsPicture) {
                            formData.append(
                              `parcel_${parcelIndex}_electronics_picture`,
                              parcel.electronicsPicture
                            );
                            console.log(
                              `Added electronics picture for parcel ${parcelIndex}`
                            );
                          }
                        }
                      });

                      // Log FormData contents
                      console.log(
                        "FormData keys:",
                        Array.from(formData.keys())
                      );

                      // Create shipment via API
                      const response = await apiService.createShipment(
                        formData
                      );

                      if (response.data?.id || response.data?.shipment_number) {
                        setShipmentId(
                          response.data.id || response.data.shipment_number
                        );
                        setCurrentStep(8); // Go to confirmation
                      } else {
                        console.error(
                          "Failed to create shipment:",
                          response.data?.error || response.data
                        );
                        showSuccess(
                          language === "ar"
                            ? "فشل إنشاء الشحنة. يرجى المحاولة مرة أخرى."
                            : "Failed to create shipment. Please try again."
                        );
                      }
                    } catch (error: any) {
                      console.error("Error creating shipment:", error);
                      console.error("Error response:", error.response?.data);

                      // Extract error message from backend response
                      let errorMessage = "";
                      if (error.response?.data) {
                        const errorData = error.response.data;
                        // Handle Django REST Framework validation errors
                        if (errorData.detail) {
                          errorMessage = errorData.detail;
                        } else if (typeof errorData === "object") {
                          // Get first validation error
                          const firstError = Object.values(errorData)[0];
                          if (Array.isArray(firstError)) {
                            errorMessage = firstError[0];
                          } else if (typeof firstError === "string") {
                            errorMessage = firstError;
                          } else {
                            errorMessage = JSON.stringify(errorData);
                          }
                        } else {
                          errorMessage = String(errorData);
                        }
                      }

                      showSuccess(
                        language === "ar"
                          ? errorMessage ||
                              "حدث خطأ أثناء إنشاء الشحنة. يرجى التحقق من البيانات والمحاولة مرة أخرى."
                          : errorMessage ||
                              "An error occurred while creating the shipment. Please check your data and try again."
                      );
                    } finally {
                      setIsCreatingShipment(false);
                    }
                  }}
                  disabled={
                    isCreatingShipment ||
                    !isStep7Valid ||
                    !acceptedTerms ||
                    !acceptedPolicies ||
                    !isRecaptchaValid
                  }
                  className={`relative px-20 py-5 font-bold text-xl rounded-3xl shadow-2xl transition-all duration-500 overflow-hidden group ${
                    isCreatingShipment ||
                    !isStep7Valid ||
                    !acceptedTerms ||
                    !acceptedPolicies ||
                    !isRecaptchaValid
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-primary-yellow to-primary-yellow/90 text-primary-dark hover:shadow-primary-yellow/50"
                  }`}
                  whileHover={
                    !isCreatingShipment &&
                    isStep7Valid &&
                    acceptedTerms &&
                    acceptedPolicies &&
                    isRecaptchaValid
                      ? { scale: 1.08, y: -2 }
                      : {}
                  }
                  whileTap={
                    !isCreatingShipment &&
                    isStep7Valid &&
                    acceptedTerms &&
                    acceptedPolicies &&
                    isRecaptchaValid
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

              {/* reCAPTCHA Widget (Development Only) */}
              {isDevelopment && recaptchaSiteKey && (
                <div className="flex flex-col items-center justify-center py-4 mt-4">
                  <div
                    id="recaptcha-widget-shipment"
                    className="flex justify-center items-center min-h-[78px] w-full"
                    style={{ minWidth: "304px" }}
                  ></div>
                  {recaptchaSiteKey ===
                    "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" && (
                    <p className="mt-2 text-xs text-yellow-600 text-center">
                      {language === "ar"
                        ? "⚠️ استخدام مفتاح اختبار Google (localhost غير مدعوم)"
                        : "⚠️ Using Google test key (localhost not supported)"}
                    </p>
                  )}
                  {recaptchaLoaded && (
                    <p className="mt-2 text-xs text-gray-500 text-center">
                      {language === "ar"
                        ? "reCAPTCHA v2 (وضع التطوير)"
                        : "reCAPTCHA v2 (Development Mode)"}
                    </p>
                  )}
                  {!recaptchaLoaded && (
                    <p className="mt-2 text-xs text-gray-400 text-center animate-pulse">
                      {language === "ar"
                        ? "جاري تحميل reCAPTCHA..."
                        : "Loading reCAPTCHA..."}
                    </p>
                  )}
                </div>
              )}

              {/* reCAPTCHA Required Message */}
              {isDevelopment &&
                recaptchaSiteKey &&
                recaptchaLoaded &&
                !recaptchaToken && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 px-4 py-3 rounded-r-lg flex items-start gap-3 mt-4">
                    <svg
                      className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <span className="text-sm font-medium">
                      {language === "ar"
                        ? "يرجى التحقق من reCAPTCHA للمتابعة"
                        : "Please complete the reCAPTCHA verification to continue"}
                    </span>
                  </div>
                )}
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
                shipmentId={shipmentId || ""}
                direction={direction}
                pricing={pricing}
                language={language}
                grandTotalWithTransport={grandTotalWithTransport}
                hasInternalTransport={selectedEUShippingMethod !== null}
                onStripePayment={handleStripePayment}
                isProcessingPayment={isProcessingPayment}
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
