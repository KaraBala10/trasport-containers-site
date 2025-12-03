"use client";

import { motion } from "framer-motion";
import { PricingResult } from "@/types/pricing";
import { ShippingDirection } from "@/types/shipment";

interface Step5PricingProps {
  pricing: PricingResult;
  language: "ar" | "en";
  direction: ShippingDirection | null;
  selectedEUShippingPrice: number; // Sendcloud original price
  selectedEUShippingName: string;
  selectedEUShippingProfitAmount?: number; // Profit amount from backend
  selectedEUShippingProfitMarginPercent?: number; // Profit margin %
  selectedEUShippingTotalPrice?: number; // Total price (calculated in backend)
  syriaProvince: string;
  syriaTransportPrice: number;
  syriaTransportDetails: any;
}

export default function Step5Pricing({
  pricing,
  language,
  direction,
  selectedEUShippingPrice,
  selectedEUShippingName,
  selectedEUShippingProfitAmount,
  selectedEUShippingProfitMarginPercent,
  selectedEUShippingTotalPrice,
  syriaProvince,
  syriaTransportPrice,
  syriaTransportDetails,
}: Step5PricingProps) {
  const translations = {
    ar: {
      title: "ملخص التسعير",
      basePrice: "السعر الأساسي LCL",
      priceByWeight: "حسب الوزن",
      priceByCBM: "حسب الحجم (CBM)",
      minimum: "الحد الأدنى",
      priceByProduct: "حسب المنتج",
      electronicsPrice: "حساب الإلكترونيات",
      piecePrice: "سعر القطع",
      perPiece: "لكل قطعة",
      pieces: "قطعة/قطع",
      insurance: "تأمين إلزامي",
      specialPackaging: "تغليف خاص",
      minimumElectronics: "الحد الأدنى",
      approximate: "سعر تقريبي",
      packaging: "التغليف",
      initialPackaging: "تغليف مبدئي",
      finalPackaging: "تغليف نهائي",
      parcelPackaging: "تغليف الطرود",
      insuranceOptional: "تأمين اختياري",
      transport: "النقل الداخلي",
      euTransport: "النقل في أوروبا",
      syriaTransport: "النقل في سورية",
      weightCost: "تكلفة الوزن",
      minimumPrice: "الحد الأدنى",
      finalPrice: "السعر النهائي",
      grandTotal: "الإجمالي النهائي",
    },
    en: {
      title: "Pricing Summary",
      basePrice: "Base LCL Price",
      priceByWeight: "By Weight",
      priceByCBM: "By Volume (CBM)",
      minimum: "Minimum",
      priceByProduct: "By Product",
      electronicsPrice: "Electronics Calculation",
      piecePrice: "Piece Price",
      perPiece: "Per Piece",
      pieces: "Piece(s)",
      insurance: "Mandatory Insurance",
      specialPackaging: "Special Packaging",
      minimumElectronics: "Minimum",
      approximate: "Approximate Price",
      packaging: "Packaging",
      initialPackaging: "Initial Packaging",
      finalPackaging: "Final Packaging",
      parcelPackaging: "Parcel Packaging",
      insuranceOptional: "Optional Insurance",
      transport: "Internal Transport",
      euTransport: "Transport in Europe",
      syriaTransport: "Transport in Syria",
      weightCost: "Weight Cost",
      minimumPrice: "Minimum",
      finalPrice: "Final Price",
      grandTotal: "Grand Total",
    },
  };

  const t = translations[language];

  console.log("📥 Step5Pricing - Received Props:", {
    direction,
    syriaTransportDetails,
    syriaTransportPrice,
    selectedEUShippingPrice, // Sendcloud original price
    selectedEUShippingTotalPrice, // Total price with profit
    selectedEUShippingProfitAmount, // Profit amount
    selectedEUShippingProfitMarginPercent, // Profit %
    selectedEUShippingName,
    pricingGrandTotal: pricing?.grandTotal,
  });

  // Show transport cards based on data availability (ignore direction)
  // Use selectedEUShippingTotalPrice (with profit) to determine if EU transport exists
  const isEUTransport =
    selectedEUShippingTotalPrice && selectedEUShippingTotalPrice > 0;
  const isSyriaTransport =
    syriaTransportDetails?.calculated_price !== null &&
    syriaTransportDetails?.calculated_price !== undefined &&
    syriaTransportDetails?.calculated_price > 0;

  // Get prices from backend (NO calculations here!)
  // Ensure all values are numbers to avoid string concatenation issues
  const sendcloudPrice = isEUTransport
    ? Number(selectedEUShippingPrice) || 0
    : 0;
  const profitAmount = isEUTransport
    ? Number(selectedEUShippingProfitAmount) || 0
    : 0;
  const euTransportPrice = isEUTransport
    ? Number(selectedEUShippingTotalPrice) || 0
    : 0; // Backend calculated total
  const syriaTransportCost = isSyriaTransport
    ? Number(syriaTransportDetails?.calculated_price) || 0
    : 0;
  const totalTransportPrice =
    Number(euTransportPrice) + Number(syriaTransportCost);

  console.log("🔍 Step5Pricing - Calculated Transport:", {
    direction,
    sendcloudPrice,
    profitAmount,
    profitMarginPercent: selectedEUShippingProfitMarginPercent,
    selectedEUShippingTotalPrice, // Total price with profit
    euTransportPrice, // Should equal selectedEUShippingTotalPrice
    selectedEUShippingName,
    syriaTransportDetails,
    isEUTransport,
    isSyriaTransport,
    syriaTransportCost,
    totalTransportPrice,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-primary-dark mb-6 text-center">
        {t.title}
      </h2>

      {/* Base LCL Price - Only show if there are regular parcels */}
      {pricing.basePrice.final > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-lg border-2 border-blue-200">
          <h3 className="text-lg font-bold text-blue-900 mb-4">
            {t.basePrice}
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">{t.priceByWeight}</span>
              <span className="font-semibold text-blue-900">
                {Number(pricing.basePrice.priceByWeight || 0).toFixed(2)} €
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">{t.minimum}</span>
              <span className="font-semibold text-blue-900">75.00 €</span>
            </div>
            <div className="pt-3 border-t border-blue-300 flex justify-between items-center">
              <span className="font-bold text-blue-900">{t.basePrice}</span>
              <span className="text-xl font-bold text-blue-900">
                {Number(pricing.basePrice.final || 0).toFixed(2)} €
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Electronics Price - Separate Card */}
      {pricing.electronicsPrice && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 shadow-lg border-2 border-purple-200"
        >
          <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            {t.electronicsPrice}
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">{t.piecePrice}</span>
              <span className="font-semibold text-purple-900">
                {Number(
                  pricing.electronicsPrice.breakdown.piecePrice || 0
                ).toFixed(2)}{" "}
                €
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">{t.insurance}</span>
              <span className="font-semibold text-purple-900">
                {Number(
                  pricing.electronicsPrice.breakdown.insurance || 0
                ).toFixed(2)}{" "}
                €
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">
                {language === "ar"
                  ? "تغليف أساسي (إجباري)"
                  : "Base Packaging (Mandatory)"}
              </span>
              <span className="font-semibold text-purple-900">
                {Number(
                  pricing.electronicsPrice.breakdown.packaging || 0
                ).toFixed(2)}{" "}
                €
              </span>
            </div>
            <div className="pt-3 border-t border-purple-300 flex justify-between items-center">
              <span className="font-bold text-purple-900">
                {t.electronicsPrice}
              </span>
              <span className="text-xl font-bold text-purple-900">
                {Number(pricing.electronicsPrice.total || 0).toFixed(2)} €
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Packaging */}
      {(pricing.packaging.initial > 0 ||
        pricing.packaging.final > 0 ||
        (pricing as any).parcelPackagingCost > 0) && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            {t.packaging}
          </h3>
          <div className="space-y-2">
            {pricing.packaging.initial > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-700">{t.initialPackaging}</span>
                <span className="font-semibold text-gray-800">
                  {Number(pricing.packaging.initial || 0).toFixed(2)} €
                </span>
              </div>
            )}
            {pricing.packaging.final > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-700">{t.finalPackaging}</span>
                <span className="font-semibold text-gray-800">
                  {Number(pricing.packaging.final || 0).toFixed(2)} €
                </span>
              </div>
            )}
            {(pricing as any).parcelPackagingCost > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-700">{t.parcelPackaging}</span>
                <span className="font-semibold text-gray-800">
                  {Number((pricing as any).parcelPackagingCost || 0).toFixed(2)}{" "}
                  €
                </span>
              </div>
            )}
            <div className="pt-3 border-t border-gray-300 flex justify-between items-center">
              <span className="font-bold text-gray-800">{t.packaging}</span>
              <span className="text-xl font-bold text-gray-800">
                {Number(pricing.packaging.total || 0).toFixed(2)} €
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Insurance */}
      {((pricing as any).insuranceCostFromAPI > 0 ||
        pricing.insurance.total > 0) && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            {t.insuranceOptional}
          </h3>
          <div className="space-y-2">
            {(pricing as any).insuranceCostFromAPI > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-700">{t.insuranceOptional}</span>
                <span className="font-semibold text-gray-800">
                  {Number((pricing as any).insuranceCostFromAPI || 0).toFixed(
                    2
                  )}{" "}
                  €
                </span>
              </div>
            )}
            {pricing.insurance.optional > 0 &&
              (pricing as any).insuranceCostFromAPI === 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">{t.insuranceOptional}</span>
                  <span className="font-semibold text-gray-800">
                    {Number(pricing.insurance.optional || 0).toFixed(2)} €
                  </span>
                </div>
              )}
            {pricing.insurance.mandatory > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-700">{t.insurance} (إلزامي)</span>
                <span className="font-semibold text-gray-800">
                  {Number(pricing.insurance.mandatory || 0).toFixed(2)} €
                </span>
              </div>
            )}
            <div className="pt-3 border-t border-gray-300 flex justify-between items-center">
              <span className="font-bold text-gray-800">
                {t.insuranceOptional}
              </span>
              <span className="text-xl font-bold text-gray-800">
                {Number(
                  (pricing as any).insuranceCostFromAPI ||
                    pricing.insurance.total ||
                    0
                ).toFixed(2)}{" "}
                €
              </span>
            </div>
          </div>
        </div>
      )}

      {/* EU Transport Card */}
      {isEUTransport && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-lg border-2 border-blue-200"
        >
          <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
              />
            </svg>
            {t.euTransport}
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">
                {language === "ar" ? "طريقة الشحن" : "Shipping Method"}
              </span>
              <span className="font-semibold text-blue-900">
                {selectedEUShippingName}
              </span>
            </div>

            {/* تفاصيل التسعير من Backend */}
            {sendcloudPrice > 0 && profitAmount !== undefined && (
              <div className="bg-white rounded-lg p-4 space-y-2 border border-blue-200">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">
                    {language === "ar" ? "سعر Sendcloud:" : "Sendcloud Price:"}
                  </span>
                  <span className="font-semibold text-gray-800">
                    €{Number(sendcloudPrice || 0).toFixed(2)}
                  </span>
                </div>

                {profitAmount > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-green-600">
                      {language === "ar"
                        ? `+ الربح (${selectedEUShippingProfitMarginPercent}%):`
                        : `+ Profit (${selectedEUShippingProfitMarginPercent}%):`}
                    </span>
                    <span className="font-semibold text-green-600">
                      €{Number(profitAmount || 0).toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                  <span className="font-bold text-gray-800">
                    {language === "ar" ? "المجموع:" : "Total:"}
                  </span>
                  <span className="text-lg font-bold text-blue-600">
                    €{Number(euTransportPrice || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* إذا ما في تفاصيل، عرض السعر النهائي بس */}
            {(sendcloudPrice === 0 || profitAmount === undefined) &&
              euTransportPrice > 0 && (
                <div className="pt-3 border-t border-blue-300 flex justify-between items-center">
                  <span className="font-bold text-blue-900">{t.transport}</span>
                  <span className="text-xl font-bold text-blue-900">
                    €{euTransportPrice.toFixed(2)}
                  </span>
                </div>
              )}
          </div>
        </motion.div>
      )}

      {/* Syria Transport Card */}
      {isSyriaTransport && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 shadow-lg border-2 border-green-200"
        >
          <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
              />
            </svg>
            {t.syriaTransport}
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">{t.weightCost}</span>
              <span className="font-semibold text-green-900">
                €
                {Number(
                  syriaTransportDetails?.breakdown?.weight_cost || 0
                ).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">{t.minimumPrice}</span>
              <span className="font-semibold text-green-900">
                €{Number(syriaTransportDetails?.min_price || 0).toFixed(2)}
              </span>
            </div>
            <div className="pt-3 border-t-2 border-green-300 flex justify-between items-center">
              <span className="font-bold text-green-900">{t.finalPrice}</span>
              <span className="text-xl font-bold text-green-600">
                €
                {Number(syriaTransportDetails?.calculated_price || 0).toFixed(
                  2
                )}
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-2 text-center">
              ({syriaTransportDetails.weight} kg × €
              {Number(syriaTransportDetails?.rate_per_kg || 0).toFixed(2)}/kg)
            </p>
          </div>
        </motion.div>
      )}

      {/* Grand Total */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-primary-yellow to-primary-yellow/90 rounded-2xl p-8 shadow-2xl border-4 border-primary-dark"
      >
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-primary-dark">
            {t.grandTotal}
          </span>
          <span className="text-4xl font-black text-primary-dark">
            {(() => {
              const baseTotal = Number(pricing.grandTotal) || 0;
              const finalTotal = baseTotal + totalTransportPrice;
              console.log("💰 Step5Pricing Grand Total:", {
                baseTotal,
                euTransportPrice,
                syriaTransportCost,
                totalTransportPrice,
                finalTotal,
              });
              return Number(finalTotal).toFixed(2);
            })()}{" "}
            €
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
