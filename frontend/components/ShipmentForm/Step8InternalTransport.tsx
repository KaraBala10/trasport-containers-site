"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShippingDirection } from "@/types/shipment";
import apiService from "@/lib/api";

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
}

interface Step8InternalTransportProps {
  direction: ShippingDirection;
  euPickupAddress: string;
  euPickupWeight: number;
  euPickupCity: string;
  euPickupPostalCode: string;
  euPickupCountry: string;
  selectedEUShippingMethod: number | null;
  onEUPickupAddressChange: (address: string) => void;
  onEUPickupWeightChange: (weight: number) => void;
  onEUPickupCityChange: (city: string) => void;
  onEUPickupPostalCodeChange: (postalCode: string) => void;
  onEUPickupCountryChange: (country: string) => void;
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
  euPickupAddress,
  euPickupWeight,
  euPickupCity,
  euPickupPostalCode,
  euPickupCountry,
  selectedEUShippingMethod,
  onEUPickupAddressChange,
  onEUPickupWeightChange,
  onEUPickupCityChange,
  onEUPickupPostalCodeChange,
  onEUPickupCountryChange,
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
      fillAllFields: "يرجى ملء جميع الحقول لحساب الأسعار",
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
      fillAllFields: "Please fill all fields to calculate rates",
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
    },
  };

  const t = translations[language];
  const isEUtoSY = direction === "eu-sy";

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
      euPickupAddress.trim().length > 0 &&
      euPickupCity.trim().length > 0 &&
      euPickupPostalCode.trim().length > 0 &&
      euPickupCountry.trim().length > 0 &&
      euPickupWeight > 0;

    setCanCalculate(allFieldsFilled);

    // Reset shipping methods when fields change
    if (!allFieldsFilled) {
      setShippingMethods([]);
      setShippingError(null);
      onEUShippingMethodChange(null);
    }
  }, [
    euPickupAddress,
    euPickupCity,
    euPickupPostalCode,
    euPickupCountry,
    euPickupWeight,
  ]);

  // ✅ Calculate EU shipping rates from Sendcloud
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
      const response = await apiService.calculateEUShipping({
        sender_address: "Wattweg 5", // Our center address
        sender_city: "Bergen op Zoom",
        sender_postal_code: "4622RA",
        sender_country: "NL",
        receiver_address: euPickupAddress,
        receiver_city: euPickupCity,
        receiver_postal_code: euPickupPostalCode,
        receiver_country: euPickupCountry,
        weight: euPickupWeight,
      });

      if (response.data.success && response.data.shipping_methods) {
        console.log("📦 EU Shipping Methods from API:", response.data.shipping_methods);
        // Log first method to see structure
        if (response.data.shipping_methods.length > 0) {
          console.log("📦 First Method Structure:", response.data.shipping_methods[0]);
          console.log("📦 First Method Keys:", Object.keys(response.data.shipping_methods[0]));
        }
        setShippingMethods(response.data.shipping_methods);

        if (response.data.shipping_methods.length === 0) {
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
            {/* Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.pickupAddress} *
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
                onChange={(e) => onEUPickupPostalCodeChange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                placeholder={
                  language === "ar" ? "مثال: 1012AB" : "e.g., 1012AB"
                }
              />
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
                        <p className="text-sm text-gray-600">
                          {t.deliveryDays}: {method.delivery_days}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary-dark">
                          {(method.total_price || method.price).toFixed(2)} {method.currency}
                        </p>
                        {method.profit_amount && method.profit_amount > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            {language === "ar" ? "شامل الربح" : "Incl. profit"} ({method.profit_margin_percent}%)
                          </p>
                        )}
                      </div>
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
                  onChange={(e) => onEUPickupPostalCodeChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                  placeholder={
                    language === "ar" ? "مثال: 1012AB" : "e.g., 1012AB"
                  }
                />
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
                          <p className="text-sm text-gray-600">
                            {t.deliveryDays}: {method.delivery_days}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary-dark">
                            {(method.total_price || method.price).toFixed(2)} {method.currency}
                          </p>
                          {method.profit_amount && method.profit_amount > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              {language === "ar" ? "شامل الربح" : "Incl. profit"} ({method.profit_margin_percent}%)
                            </p>
                          )}
                        </div>
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
