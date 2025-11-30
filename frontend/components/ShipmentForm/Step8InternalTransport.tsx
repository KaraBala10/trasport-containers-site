"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShippingDirection } from "@/types/shipment";
import apiService from "@/lib/api";
import {
  validateEmail,
  validatePhone,
  validateRequired,
  validateWeight,
  validateNumber,
  formatPhoneInput,
  formatNumericInput,
  handleNumericInput,
  handleIntegerInput,
} from "@/utils/validation";

interface ShippingMethod {
  id: number;
  name: string;
  carrier: string;
  price: number; // Sendcloud original price
  profit_amount?: number; // Calculated profit amount
  profit_margin_percent?: number; // Profit margin percentage
  total_price?: number; // Total price (calculated in backend)
  currency: string;
  delivery_days: string;
  min_weight?: string;
  max_weight?: string;
  country_price_breakdown?: Array<{
    type: string;
    label: string;
    value: number;
  }>;
  lead_time_hours?: number | null;
}

interface Step8InternalTransportProps {
  direction: ShippingDirection;
  // Sendcloud Parcel Form Fields
  euPickupName: string;
  euPickupCompanyName: string;
  euPickupAddress: string;
  euPickupHouseNumber: string;
  euPickupCity: string;
  euPickupPostalCode: string;
  euPickupCountry: string;
  euPickupEmail: string;
  euPickupTelephone: string;
  euPickupWeight: number;
  selectedEUShippingMethod: number | null;
  // Callbacks
  onEUPickupNameChange: (name: string) => void;
  onEUPickupCompanyNameChange: (companyName: string) => void;
  onEUPickupAddressChange: (address: string) => void;
  onEUPickupHouseNumberChange: (houseNumber: string) => void;
  onEUPickupCityChange: (city: string) => void;
  onEUPickupPostalCodeChange: (postalCode: string) => void;
  onEUPickupCountryChange: (country: string) => void;
  onEUPickupEmailChange: (email: string) => void;
  onEUPickupTelephoneChange: (telephone: string) => void;
  onEUPickupWeightChange: (weight: number) => void;
  onEUShippingMethodChange: (
    methodId: number | null,
    sendcloudPrice?: number,
    name?: string,
    profitAmount?: number,
    profitMarginPercent?: number,
    totalPrice?: number
  ) => void;
  syriaProvince: string;
  syriaWeight: number;
  onSyriaProvinceChange: (province: string) => void;
  onSyriaWeightChange: (weight: number) => void;
  onSyriaTransportPriceChange: (price: number, details?: any) => void;
  language: "ar" | "en";
}

// EU countries
const euCountries = [
  { code: "AT", name: "النمسا", nameEn: "Austria" },
  { code: "BE", name: "بلجيكا", nameEn: "Belgium" },
  { code: "BG", name: "بلغاريا", nameEn: "Bulgaria" },
  { code: "HR", name: "كرواتيا", nameEn: "Croatia" },
  { code: "CY", name: "قبرص", nameEn: "Cyprus" },
  { code: "CZ", name: "التشيك", nameEn: "Czech Republic" },
  { code: "DK", name: "الدنمارك", nameEn: "Denmark" },
  { code: "EE", name: "إستونيا", nameEn: "Estonia" },
  { code: "FI", name: "فنلندا", nameEn: "Finland" },
  { code: "FR", name: "فرنسا", nameEn: "France" },
  { code: "DE", name: "ألمانيا", nameEn: "Germany" },
  { code: "GR", name: "اليونان", nameEn: "Greece" },
  { code: "HU", name: "هنغاريا", nameEn: "Hungary" },
  { code: "IE", name: "أيرلندا", nameEn: "Ireland" },
  { code: "IT", name: "إيطاليا", nameEn: "Italy" },
  { code: "LV", name: "لاتفيا", nameEn: "Latvia" },
  { code: "LT", name: "ليتوانيا", nameEn: "Lithuania" },
  { code: "LU", name: "لوكسمبورغ", nameEn: "Luxembourg" },
  { code: "MT", name: "مالطا", nameEn: "Malta" },
  { code: "NL", name: "هولندا", nameEn: "Netherlands" },
  { code: "PL", name: "بولندا", nameEn: "Poland" },
  { code: "PT", name: "البرتغال", nameEn: "Portugal" },
  { code: "RO", name: "رومانيا", nameEn: "Romania" },
  { code: "SK", name: "سلوفاكيا", nameEn: "Slovakia" },
  { code: "SI", name: "سلوفينيا", nameEn: "Slovenia" },
  { code: "ES", name: "إسبانيا", nameEn: "Spain" },
  { code: "SE", name: "السويد", nameEn: "Sweden" },
  { code: "NO", name: "النرويج", nameEn: "Norway" },
  { code: "CH", name: "سويسرا", nameEn: "Switzerland" },
  { code: "GB", name: "المملكة المتحدة", nameEn: "United Kingdom" },
];

// ✅ Syrian provinces - interface for API data
interface SyrianProvince {
  id: number;
  province_code: string;
  province_name_ar: string;
  province_name_en: string;
  min_price: string;
  rate_per_kg: string;
  is_active: boolean;
  display_order: number;
}

interface SyriaTransportCalculation {
  province: {
    code: string;
    name_ar: string;
    name_en: string;
  };
  weight: number;
  min_price: number;
  rate_per_kg: number;
  calculated_price: number;
  breakdown: {
    weight_cost: number;
    min_price: number;
    final_price: number;
  };
}

export default function Step8InternalTransport({
  direction,
  euPickupName,
  euPickupCompanyName,
  euPickupAddress,
  euPickupHouseNumber,
  euPickupCity,
  euPickupPostalCode,
  euPickupCountry,
  euPickupEmail,
  euPickupTelephone,
  euPickupWeight,
  selectedEUShippingMethod,
  onEUPickupNameChange,
  onEUPickupCompanyNameChange,
  onEUPickupAddressChange,
  onEUPickupHouseNumberChange,
  onEUPickupCityChange,
  onEUPickupPostalCodeChange,
  onEUPickupCountryChange,
  onEUPickupEmailChange,
  onEUPickupTelephoneChange,
  onEUPickupWeightChange,
  onEUShippingMethodChange,
  syriaProvince,
  syriaWeight,
  onSyriaProvinceChange,
  onSyriaWeightChange,
  onSyriaTransportPriceChange,
  language,
}: Step8InternalTransportProps) {
  // ✅ States for Sendcloud shipping methods
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [canCalculate, setCanCalculate] = useState(false);
  const [postalCodeError, setPostalCodeError] = useState<string | null>(null);
  
  // Validation errors state
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    companyName?: string;
    address?: string;
    houseNumber?: string;
    city?: string;
    email?: string;
    telephone?: string;
    weight?: string;
  }>({});

  // ✅ States for Syrian internal transport
  const [syrianProvinces, setSyrianProvinces] = useState<SyrianProvince[]>([]);
  const [loadingSyriaProvinces, setLoadingSyriaProvinces] = useState(true);
  const [syriaTransportPrice, setSyriaTransportPrice] =
    useState<SyriaTransportCalculation | null>(null);
  const [loadingSyriaPrice, setLoadingSyriaPrice] = useState(false);

  const translations = {
    ar: {
      title: "النقل الداخلي",
      euTransport: "النقل الداخلي في أوروبا",
      euTransportDesc:
        "استلام من عنوانك في أوروبا إلى مركز Bergen op Zoom (هولندا)",
      pickupAddress: "عنوان الاستلام",
      approximateWeight: "الوزن (كغ)",
      city: "المدينة",
      postalCode: "الرمز البريدي",
      country: "الدولة",
      selectCountry: "اختر الدولة",
      sendcloudNote: "سيتم حساب السعر عبر Sendcloud API",
      comingSoon: "قريباً",
      calculateRates: "احسب الأسعار",
      calculating: "جاري الحساب...",
      availableShipping: "خيارات الشحن المتاحة",
      selectShipping: "اختر طريقة الشحن",
      carrier: "الناقل",
      deliveryDays: "أيام التوصيل",
      selected: "محدد",
      weightRange: "نطاق الوزن",
      priceBreakdown: "تفاصيل السعر",
      leadTime: "وقت التوصيل",
      labelPrice: "سعر Label",
      fuelSurcharge: "رسوم الوقود",
      customsSurcharge: "رسوم الجمارك",
      fillAllFields: "يرجى ملء جميع الحقول لحساب الأسعار",
      name: "الاسم",
      companyName: "اسم الشركة",
      houseNumber: "رقم المنزل",
      email: "البريد الإلكتروني",
      telephone: "رقم الهاتف",
      syriaTransport: "النقل الداخلي في سورية",
      syriaTransportDesc: "توصيل من مركز حلب إلى المحافظة المحددة",
      selectProvince: "اختر المحافظة",
      weight: "الوزن (كغ)",
      minPrice: "الحد الأدنى",
      ratePerKg: "السعر لكل كغ",
      calculatedPrice: "السعر المحسوب",
      optional: "اختياري",
      noMethods: "لا توجد طرق شحن متاحة",
      error: "خطأ",
      postalCodeInvalid: "الرمز البريدي غير صحيح",
      postalCodeRequired: "الرمز البريدي مطلوب",
      postalCodeGermany: "يجب أن يكون الرمز البريدي الألماني 5 أرقام",
      postalCodeNetherlands:
        "يجب أن يكون الرمز البريدي الهولندي 4 أرقام متبوعة بحرفين (مثال: 1012AB)",
    },
    en: {
      title: "Internal Transport",
      euTransport: "Internal Transport in Europe",
      euTransportDesc:
        "Pickup from your address in Europe to Bergen op Zoom center (Netherlands)",
      pickupAddress: "Pickup Address",
      approximateWeight: "Weight (kg)",
      city: "City",
      postalCode: "Postal Code",
      country: "Country",
      selectCountry: "Select Country",
      sendcloudNote: "Price will be calculated via Sendcloud API",
      comingSoon: "Coming Soon",
      calculateRates: "Calculate Rates",
      calculating: "Calculating...",
      availableShipping: "Available Shipping Options",
      selectShipping: "Select Shipping Method",
      carrier: "Carrier",
      deliveryDays: "Delivery Days",
      selected: "Selected",
      weightRange: "Weight Range",
      priceBreakdown: "Price Breakdown",
      leadTime: "Delivery Time",
      labelPrice: "Label Price",
      fuelSurcharge: "Fuel Surcharge",
      customsSurcharge: "Customs Surcharge",
      fillAllFields: "Please fill all fields to calculate rates",
      name: "Name",
      companyName: "Company Name",
      houseNumber: "House Number",
      email: "Email",
      telephone: "Telephone",
      syriaTransport: "Internal Transport in Syria",
      syriaTransportDesc: "Delivery from Aleppo center to selected province",
      selectProvince: "Select Province",
      weight: "Weight (kg)",
      minPrice: "Minimum Price",
      ratePerKg: "Rate per kg",
      calculatedPrice: "Calculated Price",
      optional: "Optional",
      noMethods: "No shipping methods available",
      error: "Error",
      postalCodeInvalid: "Invalid postal code",
      postalCodeRequired: "Postal code is required",
      postalCodeGermany: "German postal code must be exactly 5 digits",
      postalCodeNetherlands:
        "Dutch postal code must be 4 digits followed by 2 letters (e.g., 1012AB)",
    },
  };

  const t = translations[language];
  const isEUtoSY = direction === "eu-sy";

  // ✅ Validate postal code based on country
  const validatePostalCode = (code: string, country: string): string | null => {
    if (!code || !code.trim()) {
      return t.postalCodeRequired;
    }

    const cleaned = code.trim().replace(/[\s\-]/g, "");

    // Germany: exactly 5 digits
    if (country === "DE") {
      if (!/^\d+$/.test(cleaned)) {
        return t.postalCodeGermany;
      }
      if (cleaned.length > 5) {
        return t.postalCodeGermany;
      }
      // Allow less than 5 digits (will be padded on backend)
      if (cleaned.length === 0) {
        return t.postalCodeRequired;
      }
    }

    // Netherlands: 4 digits + 2 letters (format: 1234AB)
    if (country === "NL") {
      if (cleaned.length === 6) {
        const digits = cleaned.substring(0, 4);
        const letters = cleaned.substring(4, 6);
        if (!/^\d{4}$/.test(digits) || !/^[A-Za-z]{2}$/.test(letters)) {
          return t.postalCodeNetherlands;
        }
      } else if (cleaned.length === 4 && /^\d{4}$/.test(cleaned)) {
        // Allow just 4 digits (incomplete but valid format)
        return null;
      } else {
        return t.postalCodeNetherlands;
      }
    }

    // General validation: allow alphanumeric, max 20 chars
    if (cleaned.length > 20) {
      return t.postalCodeInvalid;
    }

    return null;
  };

  // ✅ Handle postal code change with validation
  const handlePostalCodeChange = (value: string) => {
    onEUPickupPostalCodeChange(value);

    // Validate if country is selected
    if (euPickupCountry) {
      const error = validatePostalCode(value, euPickupCountry);
      setPostalCodeError(error);
    } else {
      setPostalCodeError(null);
    }
  };

  // ✅ Validate postal code when country changes
  useEffect(() => {
    if (euPickupCountry && euPickupPostalCode) {
      const error = validatePostalCode(euPickupPostalCode, euPickupCountry);
      setPostalCodeError(error);
    } else {
      setPostalCodeError(null);
    }
  }, [euPickupCountry, euPickupPostalCode, language]);

  // ✅ Load Syrian provinces on component mount
  useEffect(() => {
    const fetchSyrianProvinces = async () => {
      try {
        setLoadingSyriaProvinces(true);
        const response = await apiService.getSyrianProvinces();
        if (response.data.success) {
          setSyrianProvinces(response.data.provinces);
        }
      } catch (error) {
        console.error("Error loading Syrian provinces:", error);
      } finally {
        setLoadingSyriaProvinces(false);
      }
    };

    fetchSyrianProvinces();
  }, []);

  // ✅ Calculate Syrian transport price when province or weight changes
  useEffect(() => {
    const calculateSyriaPrice = async () => {
      if (!syriaProvince || !syriaWeight || syriaWeight <= 0) {
        setSyriaTransportPrice(null);
        onSyriaTransportPriceChange(0, null);
        return;
      }

      try {
        setLoadingSyriaPrice(true);
        const response = await apiService.calculateSyriaTransport({
          province_code: syriaProvince,
          weight: syriaWeight,
        });

        if (response.data.success) {
          setSyriaTransportPrice(response.data);
          // Pass the calculated price and full details to parent
          onSyriaTransportPriceChange(
            response.data.calculated_price || 0,
            response.data
          );
        } else {
          onSyriaTransportPriceChange(0, null);
        }
      } catch (error) {
        console.error("Error calculating Syria transport price:", error);
        setSyriaTransportPrice(null);
        onSyriaTransportPriceChange(0, null);
      } finally {
        setLoadingSyriaPrice(false);
      }
    };

    calculateSyriaPrice();
  }, [syriaProvince, syriaWeight]);

  // ✅ Check if all required fields are filled for EU shipping calculation
  useEffect(() => {
    const allFieldsFilled =
      euPickupName.trim().length > 0 &&
      euPickupAddress.trim().length > 0 &&
      euPickupCity.trim().length > 0 &&
      euPickupPostalCode.trim().length > 0 &&
      euPickupCountry.trim().length > 0 &&
      euPickupWeight > 0 &&
      !postalCodeError; // Don't allow calculation if postal code is invalid

    setCanCalculate(allFieldsFilled);

    // Reset shipping methods when fields change
    if (!allFieldsFilled) {
      setShippingMethods([]);
      setShippingError(null);
      onEUShippingMethodChange(null);
    }
  }, [
    euPickupName,
    euPickupAddress,
    euPickupCity,
    euPickupPostalCode,
    euPickupCountry,
    euPickupWeight,
    postalCodeError,
  ]);

  // ✅ Calculate EU shipping rates from Sendcloud (using new simple endpoint)
  const calculateEUShipping = async () => {
    if (!canCalculate) {
      setShippingError(t.fillAllFields);
      return;
    }

    setLoadingShipping(true);
    setShippingError(null);
    setShippingMethods([]);
    onEUShippingMethodChange(null);

    try {
      // Use the new simple endpoint that filters by weight and country
      const response = await apiService.getShippingMethodsSimple(
        euPickupWeight,
        euPickupCountry
      );

      if (response.data.success && response.data.shipping_methods) {
        console.log(
          "📦 EU Shipping Methods from API:",
          response.data.shipping_methods
        );

        // Format the methods for display
        const formattedMethods: ShippingMethod[] =
          response.data.shipping_methods.map((method: any) => ({
            id: method.id,
            name: method.name,
            carrier: method.carrier || "unknown",
            price: method.price || 0, // Base Sendcloud price
            profit_amount: method.profit_amount || 0, // Profit amount
            profit_margin_percent: method.profit_margin_percent || 0, // Profit margin %
            total_price: method.total_price || method.price || 0, // Total price with profit
            currency: method.currency || "EUR",
            delivery_days: method.lead_time_hours
              ? `${Math.ceil(method.lead_time_hours / 24)} ${
                  language === "ar" ? "أيام" : "days"
                }`
              : "N/A",
            min_weight: method.min_weight,
            max_weight: method.max_weight,
            country_price_breakdown: method.country_price_breakdown || [],
            lead_time_hours: method.lead_time_hours,
          }));

        setShippingMethods(formattedMethods);

        if (formattedMethods.length === 0) {
          setShippingError(t.noMethods);
        }
      } else {
        setShippingError(response.data.error || t.error);
      }
    } catch (error: any) {
      console.error("Error calculating EU shipping:", error);
      const errorMessage = error.response?.data?.error || t.error;
      setShippingError(errorMessage);
    } finally {
      setLoadingShipping(false);
    }
  };

  // ✅ Syria transport price calculation will be done via Backend API
  // TODO: Implement API call to calculate price based on province and weight

  return (
    <div className="space-y-8">
      {/* EU Internal Transport */}
      {isEUtoSY && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100"
        >
          <div className="mb-4">
            <h3 className="text-xl font-bold text-primary-dark mb-2">
              {t.euTransport}
            </h3>
            <p className="text-sm text-gray-600 mb-2">{t.euTransportDesc}</p>
            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
              {t.optional}
            </span>
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.name} *
              </label>
              <input
                type="text"
                value={euPickupName}
                onChange={(e) => onEUPickupNameChange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                placeholder={
                  language === "ar" ? "مثال: John Doe" : "e.g., John Doe"
                }
              />
            </div>

            {/* Company Name (Optional) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.companyName} ({t.optional})
              </label>
              <input
                type="text"
                value={euPickupCompanyName}
                onChange={(e) => onEUPickupCompanyNameChange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                placeholder={
                  language === "ar"
                    ? "مثال: Company Name"
                    : "e.g., Company Name"
                }
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.pickupAddress} *
              </label>
              <input
                type="text"
                value={euPickupAddress}
                onChange={(e) => {
                  onEUPickupAddressChange(e.target.value);
                  if (fieldErrors.address) {
                    setFieldErrors({ ...fieldErrors, address: undefined });
                  }
                }}
                onBlur={() => {
                  const error = validateRequired(
                    euPickupAddress,
                    t.pickupAddress,
                    2,
                    200
                  );
                  setFieldErrors({ ...fieldErrors, address: error || undefined });
                }}
                className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-primary-yellow ${
                  fieldErrors.address
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 focus:border-primary-yellow"
                }`}
                placeholder={
                  language === "ar" ? "مثال: Main Street" : "e.g., Main Street"
                }
              />
              {fieldErrors.address && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.address}</p>
              )}
            </div>

            {/* House Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.houseNumber} *
              </label>
              <input
                type="text"
                value={euPickupHouseNumber}
                onChange={(e) => {
                  const formatted = formatIntegerInput(e.target.value);
                  onEUPickupHouseNumberChange(formatted);
                  if (fieldErrors.houseNumber) {
                    setFieldErrors({ ...fieldErrors, houseNumber: undefined });
                  }
                }}
                onBlur={() => {
                  const error = validateRequired(
                    euPickupHouseNumber,
                    t.houseNumber,
                    1,
                    50
                  );
                  setFieldErrors({ ...fieldErrors, houseNumber: error || undefined });
                }}
                onKeyDown={handleIntegerInput}
                className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-primary-yellow ${
                  fieldErrors.houseNumber
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 focus:border-primary-yellow"
                }`}
                placeholder={language === "ar" ? "مثال: 123" : "e.g., 123"}
              />
              {fieldErrors.houseNumber && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.houseNumber}</p>
              )}
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.city} *
              </label>
              <input
                type="text"
                value={euPickupCity}
                onChange={(e) => {
                  onEUPickupCityChange(e.target.value);
                  if (fieldErrors.city) {
                    setFieldErrors({ ...fieldErrors, city: undefined });
                  }
                }}
                onBlur={() => {
                  const error = validateRequired(
                    euPickupCity,
                    t.city,
                    2,
                    100
                  );
                  setFieldErrors({ ...fieldErrors, city: error || undefined });
                }}
                className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-primary-yellow ${
                  fieldErrors.city
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 focus:border-primary-yellow"
                }`}
                placeholder={
                  language === "ar" ? "مثال: Amsterdam" : "e.g., Amsterdam"
                }
              />
              {fieldErrors.city && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.city}</p>
              )}
            </div>

            {/* Postal Code */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.postalCode} *
              </label>
              <input
                type="text"
                value={euPickupPostalCode}
                onChange={(e) => handlePostalCodeChange(e.target.value)}
                onBlur={() => {
                  if (euPickupCountry && euPickupPostalCode) {
                    const error = validatePostalCode(
                      euPickupPostalCode,
                      euPickupCountry
                    );
                    setPostalCodeError(error);
                  }
                }}
                className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-primary-yellow ${
                  postalCodeError
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 focus:border-primary-yellow"
                }`}
                placeholder={
                  euPickupCountry === "DE"
                    ? language === "ar"
                      ? "مثال: 10115"
                      : "e.g., 10115"
                    : euPickupCountry === "NL"
                    ? language === "ar"
                      ? "مثال: 1012AB"
                      : "e.g., 1012AB"
                    : language === "ar"
                    ? "مثال: 1012AB"
                    : "e.g., 1012AB"
                }
              />
              {postalCodeError && (
                <p className="mt-1 text-sm text-red-600">{postalCodeError}</p>
              )}
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.country} *
              </label>
              <select
                value={euPickupCountry}
                onChange={(e) => onEUPickupCountryChange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow bg-white"
              >
                <option value="">{t.selectCountry}</option>
                {euCountries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {language === "ar" ? country.name : country.nameEn} (
                    {country.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Weight */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.approximateWeight} *
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={euPickupWeight || ""}
                onChange={(e) =>
                  onEUPickupWeightChange(parseFloat(e.target.value) || 0)
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                placeholder={
                  language === "ar" ? "أدخل الوزن..." : "Enter weight..."
                }
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.email} *
              </label>
              <input
                type="email"
                value={euPickupEmail}
                onChange={(e) => onEUPickupEmailChange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                placeholder={
                  language === "ar"
                    ? "مثال: email@example.com"
                    : "e.g., email@example.com"
                }
              />
            </div>

            {/* Telephone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.telephone} *
              </label>
              <input
                type="tel"
                value={euPickupTelephone}
                onChange={(e) => onEUPickupTelephoneChange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                placeholder={
                  language === "ar"
                    ? "مثال: +31612345678"
                    : "e.g., +31612345678"
                }
              />
            </div>

            {/* Calculate Button */}
            <button
              onClick={calculateEUShipping}
              disabled={!canCalculate || loadingShipping}
              className={`w-full px-6 py-4 rounded-xl font-bold text-white transition-all ${
                canCalculate && !loadingShipping
                  ? "bg-primary-yellow hover:bg-yellow-600 cursor-pointer"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              {loadingShipping ? t.calculating : t.calculateRates}
            </button>

            {/* Error Message */}
            {shippingError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 rounded-xl p-4 border-2 border-red-200"
              >
                <p className="text-red-700 text-sm font-semibold">
                  ⚠️ {shippingError}
                </p>
              </motion.div>
            )}

            {/* Shipping Methods */}
            {shippingMethods.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <h4 className="font-bold text-gray-800">
                  {t.availableShipping}
                </h4>
                {shippingMethods.map((method) => (
                  <motion.div
                    key={method.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedEUShippingMethod === method.id
                        ? "border-primary-yellow bg-yellow-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                    onClick={() => {
                      console.log("🖱️ Clicked EU Shipping Method:", {
                        id: method.id,
                        name: method.name,
                        price: method.price,
                        profit_amount: method.profit_amount,
                        profit_margin_percent: method.profit_margin_percent,
                        total_price: method.total_price,
                        fullMethod: method,
                      });
                      onEUShippingMethodChange(
                        method.id,
                        method.price,
                        method.name,
                        method.profit_amount,
                        method.profit_margin_percent,
                        method.total_price
                      );
                    }}
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-bold text-gray-800">
                              {method.name}
                            </h5>
                            {selectedEUShippingMethod === method.id && (
                              <span className="px-2 py-0.5 bg-primary-yellow text-white text-xs rounded-full font-bold">
                                ✓ {t.selected}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {t.carrier}: {method.carrier}
                          </p>
                          {method.min_weight && method.max_weight && (
                            <p className="text-sm text-gray-600">
                              {t.weightRange}: {method.min_weight} -{" "}
                              {method.max_weight} kg
                            </p>
                          )}
                          {method.lead_time_hours && (
                            <p className="text-sm text-gray-600">
                              {t.leadTime}:{" "}
                              {Math.ceil(method.lead_time_hours / 24)}{" "}
                              {language === "ar" ? "أيام" : "days"}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary-dark">
                            {method.price.toFixed(2)} {method.currency}
                          </p>
                        </div>
                      </div>

                      {/* Price Breakdown */}
                      {method.country_price_breakdown &&
                        method.country_price_breakdown.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs font-semibold text-gray-700 mb-2">
                              {t.priceBreakdown}:
                            </p>
                            <div className="space-y-1">
                              {method.country_price_breakdown.map(
                                (item: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className="flex justify-between items-center text-xs"
                                  >
                                    <span className="text-gray-600">
                                      {item.label}:
                                    </span>
                                    <span className="font-semibold text-gray-800">
                                      €{item.value.toFixed(2)}
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* Syria Internal Transport */}
      {isEUtoSY && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100"
        >
          <div className="mb-4">
            <h3 className="text-xl font-bold text-primary-dark mb-2">
              {t.syriaTransport}
            </h3>
            <p className="text-sm text-gray-600 mb-2">{t.syriaTransportDesc}</p>
            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
              {t.optional}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.selectProvince}
              </label>
              <select
                value={syriaProvince}
                onChange={(e) => onSyriaProvinceChange(e.target.value)}
                disabled={loadingSyriaProvinces}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {loadingSyriaProvinces
                    ? language === "ar"
                      ? "جاري التحميل..."
                      : "Loading..."
                    : language === "ar"
                    ? "اختر..."
                    : "Select..."}
                </option>
                {syrianProvinces.map((province) => (
                  <option
                    key={province.province_code}
                    value={province.province_code}
                  >
                    {language === "ar"
                      ? province.province_name_ar
                      : province.province_name_en}
                  </option>
                ))}
              </select>
            </div>

            {syriaProvince && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.weight}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={syriaWeight || ""}
                    onChange={(e) =>
                      onSyriaWeightChange(parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                  />
                </div>

                {/* ✅ Real-time price calculation from Backend API */}
                {syriaWeight > 0 && (
                  <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                    {loadingSyriaPrice ? (
                      <p className="text-sm text-blue-600 text-center animate-pulse">
                        {language === "ar"
                          ? "جاري حساب السعر..."
                          : "Calculating price..."}
                      </p>
                    ) : syriaTransportPrice ? (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-700">
                            {language === "ar"
                              ? "تكلفة الوزن:"
                              : "Weight Cost:"}
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            €
                            {syriaTransportPrice.breakdown.weight_cost.toFixed(
                              2
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-700">
                            {language === "ar" ? "الحد الأدنى:" : "Minimum:"}
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            €{syriaTransportPrice.min_price.toFixed(2)}
                          </span>
                        </div>
                        <div className="pt-2 border-t-2 border-blue-300 flex justify-between items-center">
                          <span className="text-base font-bold text-blue-900">
                            {language === "ar"
                              ? "السعر النهائي:"
                              : "Final Price:"}
                          </span>
                          <span className="text-xl font-bold text-blue-600">
                            €{syriaTransportPrice.calculated_price.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          {language === "ar"
                            ? `(${syriaWeight} كغ × €${syriaTransportPrice.rate_per_kg.toFixed(
                                2
                              )}/كغ)`
                            : `(${syriaWeight} kg × €${syriaTransportPrice.rate_per_kg.toFixed(
                                2
                              )}/kg)`}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-red-600 text-center">
                        {language === "ar"
                          ? "❌ فشل حساب السعر"
                          : "❌ Failed to calculate price"}
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* Syria to EU - Syria Pickup and EU Delivery */}
      {!isEUtoSY && (
        <>
          {/* Syria Internal Transport */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100"
          >
            <div className="mb-4">
              <h3 className="text-xl font-bold text-primary-dark mb-2">
                {t.syriaTransport}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {language === "ar"
                  ? "استلام من عنوانك في سورية إلى مركز حلب"
                  : "Pickup from your address in Syria to Aleppo center"}
              </p>
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                {t.optional}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.selectProvince}
                </label>
                <select
                  value={syriaProvince}
                  onChange={(e) => onSyriaProvinceChange(e.target.value)}
                  disabled={loadingSyriaProvinces}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {loadingSyriaProvinces
                      ? language === "ar"
                        ? "جاري التحميل..."
                        : "Loading..."
                      : language === "ar"
                      ? "اختر..."
                      : "Select..."}
                  </option>
                  {syrianProvinces.map((province) => (
                    <option
                      key={province.province_code}
                      value={province.province_code}
                    >
                      {language === "ar"
                        ? province.province_name_ar
                        : province.province_name_en}
                    </option>
                  ))}
                </select>
              </div>

              {syriaProvince && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.weight}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={syriaWeight || ""}
                      onChange={(e) =>
                        onSyriaWeightChange(parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                    />
                  </div>

                  {/* ✅ Real-time price calculation from Backend API */}
                  {syriaWeight > 0 && (
                    <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                      {loadingSyriaPrice ? (
                        <p className="text-sm text-blue-600 text-center animate-pulse">
                          {language === "ar"
                            ? "جاري حساب السعر..."
                            : "Calculating price..."}
                        </p>
                      ) : syriaTransportPrice ? (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-700">
                              {language === "ar"
                                ? "تكلفة الوزن:"
                                : "Weight Cost:"}
                            </span>
                            <span className="text-sm font-semibold text-gray-900">
                              €
                              {syriaTransportPrice.breakdown.weight_cost.toFixed(
                                2
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-700">
                              {language === "ar" ? "الحد الأدنى:" : "Minimum:"}
                            </span>
                            <span className="text-sm font-semibold text-gray-900">
                              €{syriaTransportPrice.min_price.toFixed(2)}
                            </span>
                          </div>
                          <div className="pt-2 border-t-2 border-blue-300 flex justify-between items-center">
                            <span className="text-base font-bold text-blue-900">
                              {language === "ar"
                                ? "السعر النهائي:"
                                : "Final Price:"}
                            </span>
                            <span className="text-xl font-bold text-blue-600">
                              €{syriaTransportPrice.calculated_price.toFixed(2)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-2 text-center">
                            {language === "ar"
                              ? `(${syriaWeight} كغ × €${syriaTransportPrice.rate_per_kg.toFixed(
                                  2
                                )}/كغ)`
                              : `(${syriaWeight} kg × €${syriaTransportPrice.rate_per_kg.toFixed(
                                  2
                                )}/kg)`}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-red-600 text-center">
                          {language === "ar"
                            ? "❌ فشل حساب السعر"
                            : "❌ Failed to calculate price"}
                        </p>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* EU Internal Transport for Syria to EU */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100 mt-6"
          >
            <div className="mb-4">
              <h3 className="text-xl font-bold text-primary-dark mb-2">
                {t.euTransport}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {language === "ar"
                  ? "توصيل من مركز Bergen op Zoom (هولندا) إلى عنوانك في أوروبا"
                  : "Delivery from Bergen op Zoom center (Netherlands) to your address in Europe"}
              </p>
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                {t.optional}
              </span>
            </div>

            <div className="space-y-4">
              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {language === "ar" ? "عنوان التوصيل" : "Delivery Address"} *
                </label>
                <input
                  type="text"
                  value={euPickupAddress}
                  onChange={(e) => onEUPickupAddressChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                  placeholder={
                    language === "ar"
                      ? "مثال: Main Street 123"
                      : "e.g., Main Street 123"
                  }
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.city} *
                </label>
                <input
                  type="text"
                  value={euPickupCity}
                  onChange={(e) => onEUPickupCityChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                  placeholder={
                    language === "ar" ? "مثال: Amsterdam" : "e.g., Amsterdam"
                  }
                />
              </div>

              {/* Postal Code */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.postalCode} *
                </label>
                <input
                  type="text"
                  value={euPickupPostalCode}
                  onChange={(e) => handlePostalCodeChange(e.target.value)}
                  onBlur={() => {
                    if (euPickupCountry && euPickupPostalCode) {
                      const error = validatePostalCode(
                        euPickupPostalCode,
                        euPickupCountry
                      );
                      setPostalCodeError(error);
                    }
                  }}
                  className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-primary-yellow ${
                    postalCodeError
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-primary-yellow"
                  }`}
                  placeholder={
                    euPickupCountry === "DE"
                      ? language === "ar"
                        ? "مثال: 10115"
                        : "e.g., 10115"
                      : euPickupCountry === "NL"
                      ? language === "ar"
                        ? "مثال: 1012AB"
                        : "e.g., 1012AB"
                      : language === "ar"
                      ? "مثال: 1012AB"
                      : "e.g., 1012AB"
                  }
                />
                {postalCodeError && (
                  <p className="mt-1 text-sm text-red-600">{postalCodeError}</p>
                )}
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.country} *
                </label>
                <select
                  value={euPickupCountry}
                  onChange={(e) => onEUPickupCountryChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow bg-white"
                >
                  <option value="">{t.selectCountry}</option>
                  {euCountries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {language === "ar" ? country.name : country.nameEn} (
                      {country.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Weight */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.approximateWeight} *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={euPickupWeight || ""}
                  onChange={(e) =>
                    onEUPickupWeightChange(parseFloat(e.target.value) || 0)
                  }
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                  placeholder={
                    language === "ar" ? "أدخل الوزن..." : "Enter weight..."
                  }
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.email} *
                </label>
                <input
                  type="email"
                  value={euPickupEmail}
                  onChange={(e) => onEUPickupEmailChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                  placeholder={
                    language === "ar"
                      ? "مثال: email@example.com"
                      : "e.g., email@example.com"
                  }
                />
              </div>

              {/* Telephone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.telephone} *
                </label>
                <input
                  type="tel"
                  value={euPickupTelephone}
                  onChange={(e) => onEUPickupTelephoneChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                  placeholder={
                    language === "ar"
                      ? "مثال: +31612345678"
                      : "e.g., +31612345678"
                  }
                />
              </div>

              {/* Calculate Button */}
              <button
                onClick={calculateEUShipping}
                disabled={!canCalculate || loadingShipping}
                className={`w-full px-6 py-4 rounded-xl font-bold text-white transition-all ${
                  canCalculate && !loadingShipping
                    ? "bg-primary-yellow hover:bg-yellow-600 cursor-pointer"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                {loadingShipping ? t.calculating : t.calculateRates}
              </button>

              {/* Error Message */}
              {shippingError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 rounded-xl p-4 border-2 border-red-200"
                >
                  <p className="text-red-700 text-sm font-semibold">
                    ⚠️ {shippingError}
                  </p>
                </motion.div>
              )}

              {/* Shipping Methods */}
              {shippingMethods.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <h4 className="font-bold text-gray-800">
                    {t.availableShipping}
                  </h4>
                  {shippingMethods.map((method) => (
                    <motion.div
                      key={method.id}
                      whileHover={{ scale: 1.02 }}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedEUShippingMethod === method.id
                          ? "border-primary-yellow bg-yellow-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                      onClick={() => {
                        console.log("🖱️ Clicked EU Shipping Method (RTL):", {
                          id: method.id,
                          name: method.name,
                          price: method.price,
                          profit_amount: method.profit_amount,
                          profit_margin_percent: method.profit_margin_percent,
                          total_price: method.total_price,
                          fullMethod: method,
                        });
                        onEUShippingMethodChange(
                          method.id,
                          method.price,
                          method.name,
                          method.profit_amount,
                          method.profit_margin_percent,
                          method.total_price
                        );
                      }}
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-bold text-gray-800">
                                {method.name}
                              </h5>
                              {selectedEUShippingMethod === method.id && (
                                <span className="px-2 py-0.5 bg-primary-yellow text-white text-xs rounded-full font-bold">
                                  ✓ {t.selected}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {t.carrier}: {method.carrier}
                            </p>
                            {method.min_weight && method.max_weight && (
                              <p className="text-sm text-gray-600">
                                {t.weightRange}: {method.min_weight} -{" "}
                                {method.max_weight} kg
                              </p>
                            )}
                            {method.lead_time_hours && (
                              <p className="text-sm text-gray-600">
                                {t.leadTime}:{" "}
                                {Math.ceil(method.lead_time_hours / 24)}{" "}
                                {language === "ar" ? "أيام" : "days"}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary-dark">
                              {method.price.toFixed(2)} {method.currency}
                            </p>
                          </div>
                        </div>

                        {/* Price Breakdown */}
                        {method.country_price_breakdown &&
                          method.country_price_breakdown.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <p className="text-xs font-semibold text-gray-700 mb-2">
                                {t.priceBreakdown}:
                              </p>
                              <div className="space-y-1">
                                {method.country_price_breakdown.map(
                                  (item: any, idx: number) => (
                                    <div
                                      key={idx}
                                      className="flex justify-between items-center text-xs"
                                    >
                                      <span className="text-gray-600">
                                        {item.label}:
                                      </span>
                                      <span className="font-semibold text-gray-800">
                                        €{item.value.toFixed(2)}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
