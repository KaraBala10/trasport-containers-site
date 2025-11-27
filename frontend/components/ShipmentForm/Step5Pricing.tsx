"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { PricingResult } from "@/types/pricing";
import { ShippingDirection } from "@/types/shipment";
import apiService from "@/lib/api";

interface Step5PricingProps {
  pricing: PricingResult;
  language: "ar" | "en";
  direction: ShippingDirection | null;
  selectedEUShippingMethod: number | null;
  syriaProvince: string;
}

interface ShippingMethod {
  id: number;
  name: string;
  carrier: string;
  price: number;
  currency: string;
  delivery_days: string;
}

interface SyrianProvince {
  id: number;
  province_code: string;
  province_name_ar: string;
  province_name_en: string;
  min_price: string;
  rate_per_kg: string;
}

export default function Step5Pricing({ 
  pricing, 
  language, 
  direction, 
  selectedEUShippingMethod, 
  syriaProvince 
}: Step5PricingProps) {
  const [transportPrice, setTransportPrice] = useState<number>(0);
  const [transportName, setTransportName] = useState<string>("");
  const [loadingTransport, setLoadingTransport] = useState<boolean>(false);
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
      largeItemsPrice: "حساب القطع الكبيرة",
      approximate: "سعر تقريبي",
      largeItemsNote: "ملاحظة: السعر النهائي سيتم حسابه بعد القياس في المركز",
      packaging: "التغليف",
      initialPackaging: "تغليف مبدئي",
      finalPackaging: "تغليف نهائي",
      parcelPackaging: "تغليف الطرود",
      insuranceOptional: "تأمين اختياري",
      transport: "النقل الداخلي",
      euTransport: "النقل في أوروبا",
      syriaTransport: "النقل في سورية",
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
      largeItemsPrice: "Large Items Calculation",
      approximate: "Approximate Price",
      largeItemsNote:
        "Note: Final price will be calculated after measurement at center",
      packaging: "Packaging",
      initialPackaging: "Initial Packaging",
      finalPackaging: "Final Packaging",
      parcelPackaging: "Parcel Packaging",
      insuranceOptional: "Optional Insurance",
      transport: "Internal Transport",
      euTransport: "Transport in Europe",
      syriaTransport: "Transport in Syria",
      grandTotal: "Grand Total",
    },
  };

  const t = translations[language];

  // Fetch transport prices based on user selection
  useEffect(() => {
    const fetchTransportPrice = async () => {
      if (!direction) return;

      setLoadingTransport(true);
      
      try {
        if (direction === 'eu-sy') {
          // Fetch EU shipping method price
          if (selectedEUShippingMethod) {
            // In a real scenario, you'd fetch this from API or state
            // For now, we'll set a placeholder
            setTransportName(language === "ar" ? "شحن أوروبي محدد" : "Selected EU Shipping");
            setTransportPrice(0); // Will be set from the shipping method
          }
        } else if (direction === 'sy-eu') {
          // Fetch Syria province price
          if (syriaProvince) {
            try {
              const response = await apiService.getSyrianProvinces();
              if (response.data.success && response.data.provinces) {
                const province = response.data.provinces.find(
                  (p: SyrianProvince) => p.province_code === syriaProvince
                );
                if (province) {
                  setTransportName(
                    language === "ar" 
                      ? `النقل من ${province.province_name_ar}` 
                      : `Transport from ${province.province_name_en}`
                  );
                  // Calculate based on weight or minimum
                  const minPrice = parseFloat(province.min_price);
                  setTransportPrice(minPrice);
                }
              }
            } catch (error) {
              console.error("Error fetching Syria transport price:", error);
            }
          }
        }
      } finally {
        setLoadingTransport(false);
      }
    };

    fetchTransportPrice();
  }, [direction, selectedEUShippingMethod, syriaProvince, language]);

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
                {pricing.basePrice.priceByWeight.toFixed(2)} €
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">{t.priceByCBM}</span>
              <span className="font-semibold text-blue-900">
                {pricing.basePrice.priceByCBM.toFixed(2)} €
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">{t.minimum}</span>
              <span className="font-semibold text-blue-900">75.00 €</span>
            </div>
            <div className="pt-3 border-t border-blue-300 flex justify-between items-center">
              <span className="font-bold text-blue-900">{t.basePrice}</span>
              <span className="text-xl font-bold text-blue-900">
                {pricing.basePrice.final.toFixed(2)} €
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
                {pricing.electronicsPrice.breakdown.piecePrice.toFixed(2)} €
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">{t.insurance}</span>
              <span className="font-semibold text-purple-900">
                {pricing.electronicsPrice.breakdown.insurance.toFixed(2)} €
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">
                {language === "ar"
                  ? "تغليف أساسي (إجباري)"
                  : "Base Packaging (Mandatory)"}
              </span>
              <span className="font-semibold text-purple-900">
                {pricing.electronicsPrice.breakdown.packaging.toFixed(2)} €
              </span>
            </div>
            <div className="pt-3 border-t border-purple-300 flex justify-between items-center">
              <span className="font-bold text-purple-900">
                {t.electronicsPrice}
              </span>
              <span className="text-xl font-bold text-purple-900">
                {pricing.electronicsPrice.total.toFixed(2)} €
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Large Items Price */}
      {pricing.largeItemsPrice && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 shadow-lg border-2 border-orange-200"
        >
          <h3 className="text-lg font-bold text-orange-900 mb-4">
            {t.largeItemsPrice}
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">{t.approximate}</span>
              <span className="font-semibold text-orange-900">
                {pricing.largeItemsPrice.approximate.toFixed(2)} €
              </span>
            </div>
            <p className="mt-4 text-sm text-orange-700 italic">
              {pricing.largeItemsPrice.note}
            </p>
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
                  {pricing.packaging.initial.toFixed(2)} €
                </span>
              </div>
            )}
            {pricing.packaging.final > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-700">{t.finalPackaging}</span>
                <span className="font-semibold text-gray-800">
                  {pricing.packaging.final.toFixed(2)} €
                </span>
              </div>
            )}
            {(pricing as any).parcelPackagingCost > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-700">{t.parcelPackaging}</span>
                <span className="font-semibold text-gray-800">
                  {((pricing as any).parcelPackagingCost || 0).toFixed(2)} €
                </span>
              </div>
            )}
            <div className="pt-3 border-t border-gray-300 flex justify-between items-center">
              <span className="font-bold text-gray-800">{t.packaging}</span>
              <span className="text-xl font-bold text-gray-800">
                {pricing.packaging.total.toFixed(2)} €
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
                  {((pricing as any).insuranceCostFromAPI || 0).toFixed(2)} €
                </span>
              </div>
            )}
            {pricing.insurance.optional > 0 &&
              (pricing as any).insuranceCostFromAPI === 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">{t.insuranceOptional}</span>
                  <span className="font-semibold text-gray-800">
                    {pricing.insurance.optional.toFixed(2)} €
                  </span>
                </div>
              )}
            {pricing.insurance.mandatory > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-700">{t.insurance} (إلزامي)</span>
                <span className="font-semibold text-gray-800">
                  {pricing.insurance.mandatory.toFixed(2)} €
                </span>
              </div>
            )}
            <div className="pt-3 border-t border-gray-300 flex justify-between items-center">
              <span className="font-bold text-gray-800">
                {t.insuranceOptional}
              </span>
              <span className="text-xl font-bold text-gray-800">
                {(
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

      {/* Internal Transport */}
      {transportPrice > 0 && (
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
            {t.transport}
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">{transportName}</span>
              <span className="font-semibold text-green-900">
                {transportPrice.toFixed(2)} €
              </span>
            </div>
            <div className="pt-3 border-t border-green-300 flex justify-between items-center">
              <span className="font-bold text-green-900">{t.transport}</span>
              <span className="text-xl font-bold text-green-900">
                {transportPrice.toFixed(2)} €
              </span>
            </div>
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
            {(pricing.grandTotal + transportPrice).toFixed(2)} €
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
