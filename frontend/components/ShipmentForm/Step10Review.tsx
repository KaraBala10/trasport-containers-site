"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ShippingDirection,
  ShipmentType,
  PersonInfo,
  Parcel,
} from "@/types/shipment";
import { PricingResult } from "@/types/pricing";
import Link from "next/link";

interface Step10ReviewProps {
  direction: ShippingDirection;
  shipmentTypes: ShipmentType[];
  sender: PersonInfo | null;
  receiver: PersonInfo | null;
  parcels: Parcel[];
  pricing: PricingResult | null;
  acceptedTerms: boolean;
  acceptedPolicies: boolean;
  onAcceptedTermsChange: (accepted: boolean) => void;
  onAcceptedPoliciesChange: (accepted: boolean) => void;
  onCreateShipment: () => void;
  language: "ar" | "en";
  selectedEUShippingName?: string;
  selectedEUShippingPrice?: number;
  syriaTransportDetails?: any;
}

export default function Step10Review({
  direction,
  shipmentTypes,
  sender,
  receiver,
  parcels,
  pricing,
  acceptedTerms,
  acceptedPolicies,
  onAcceptedTermsChange,
  onAcceptedPoliciesChange,
  onCreateShipment,
  language,
  selectedEUShippingName,
  selectedEUShippingPrice,
  syriaTransportDetails,
}: Step10ReviewProps) {
  const translations = {
    ar: {
      title: "مراجعة وتأكيد الشحنة",
      shipmentSummary: "ملخص الشحنة",
      direction: "الاتجاه",
      shipmentTypes: "أنواع الشحنة",
      senderInfo: "معلومات المرسل",
      receiverInfo: "معلومات المستلم",
      parcelsCount: "عدد الطرود",
      totalWeight: "الوزن الإجمالي",
      totalCBM: "الحجم الإجمالي (CBM)",
      pricingSummary: "ملخص التسعير",
      baseLCLPrice: "السعر الأساسي LCL",
      electronicsPrice: "سعر الإلكترونيات",
      transportPrice: "سعر النقل الداخلي",
      euTransport: "النقل في أوروبا",
      syriaTransport: "النقل في سورية",
      weightCost: "تكلفة الوزن",
      minimumPrice: "الحد الأدنى",
      finalPrice: "السعر النهائي",
      packaging: "التغليف",
      insurance: "التأمين",
      totalBeforeTransport: "المجموع قبل النقل",
      grandTotal: "الإجمالي النهائي",
      operationalPolicies: "السياسات التشغيلية",
      policyRejection: "سياسة رفض الشحنات",
      policyRejectionDesc:
        "إذا رفض العميل دفع السعر النهائي بعد القياس: إرجاع الشحنة على حسابه، أو تخزين 30 يوم ثم التخلص منها، أو بيع المحتوى لتغطية التكاليف",
      policyStorage: "سياسة التخزين",
      policyStorageDesc:
        "3 أيام مجانية، 1€ لكل طرد يومياً بعد ذلك، بعد 30 يوم → شحنة مهملة",
      policyKYC: "سياسة الهوية – EU KYC Light",
      policyKYCDesc:
        "مسموح: رقم هوية/جواز فقط – بدون تحميل صورة. مسموح: صور الطرود إلزامية. ممنوع: أي صورة وثائق رسمية. حذف البيانات بعد 6 أشهر كحد أقصى.",
      policyLiability: "سياسة المسؤولية",
      policyLiabilityDesc:
        "بدون تأمين → لا تعويض. التأمين يغطي القيمة المصرّح بها فقط. لا تعويض عن: التأخير، الجمارك، الطقس، الحرب، تلف التغليف الخارجي",
      policyLargeItems: "سياسة القطع الكبيرة",
      policyLargeItemsDesc:
        "السعر في الموقع تقديري. السعر النهائي بعد الوزن الحقيقي. يجوز فرض تغليف إجباري. لا تسليم قبل دفع الفاتورة المعدلة",
      termsAndConditions: "الشروط والأحكام",
      acceptTerms: "أوافق على الشروط والأحكام",
      acceptPolicies: "أوافق على السياسات التشغيلية",
      readTerms: "قراءة الشروط",
      readPolicies: "قراءة السياسات",
      createShipment: "إنشاء الشحنة",
      creating: "جاري الإنشاء...",
      euToSy: "من أوروبا إلى سورية",
      syToEu: "من سورية إلى أوروبا",
      parcelLCL: "طرود LCL",
      electronics: "إلكترونيات",
      largeItems: "قطع كبيرة",
      businessLCL: "شحن تجاري LCL",
    },
    en: {
      title: "Review & Confirm Shipment",
      shipmentSummary: "Shipment Summary",
      direction: "Direction",
      shipmentTypes: "Shipment Types",
      senderInfo: "Sender Information",
      receiverInfo: "Receiver Information",
      parcelsCount: "Number of Parcels",
      totalWeight: "Total Weight",
      totalCBM: "Total Volume (CBM)",
      pricingSummary: "Pricing Summary",
      baseLCLPrice: "Base LCL Price",
      electronicsPrice: "Electronics Price",
      transportPrice: "Internal Transport Price",
      euTransport: "Transport in Europe",
      syriaTransport: "Transport in Syria",
      weightCost: "Weight Cost",
      minimumPrice: "Minimum",
      finalPrice: "Final Price",
      packaging: "Packaging",
      insurance: "Insurance",
      totalBeforeTransport: "Total Before Transport",
      grandTotal: "Grand Total",
      operationalPolicies: "Operational Policies",
      policyRejection: "Shipment Rejection Policy",
      policyRejectionDesc:
        "If customer refuses to pay final price after measurement: return shipment at customer expense, or store for 30 days then dispose, or sell contents to cover costs",
      policyStorage: "Storage Policy",
      policyStorageDesc:
        "3 days free, 1€ per parcel daily after that, after 30 days → abandoned shipment",
      policyKYC: "Identity Policy – EU KYC Light",
      policyKYCDesc:
        "Allowed: ID/Passport number only – no photo upload. Allowed: Parcel photos mandatory. Prohibited: Any official document photos. Data deletion after 6 months maximum.",
      policyLiability: "Liability Policy",
      policyLiabilityDesc:
        "Without insurance → no compensation. Insurance covers declared value only. No compensation for: delays, customs, weather, war, external packaging damage",
      policyLargeItems: "Large Items Policy",
      policyLargeItemsDesc:
        "Website price is approximate. Final price after actual weight. Mandatory packaging may be imposed. No delivery before paying adjusted invoice",
      termsAndConditions: "Terms and Conditions",
      acceptTerms: "I agree to the Terms and Conditions",
      acceptPolicies: "I agree to the Operational Policies",
      readTerms: "Read Terms",
      readPolicies: "Read Policies",
      createShipment: "Create Shipment",
      creating: "Creating...",
      euToSy: "Europe to Syria",
      syToEu: "Syria to Europe",
      parcelLCL: "Parcel LCL",
      electronics: "Electronics",
      largeItems: "Large Items",
      businessLCL: "Business LCL",
    },
  };

  const t = translations[language];
  const isEUtoSY = direction === "eu-sy";

  const totalWeight = parcels.reduce((sum, p) => sum + (p.weight || 0), 0);
  const totalCBM = parcels.reduce((sum, p) => sum + (p.cbm || 0), 0);

  const isEUTransport =
    direction === "eu-sy" &&
    selectedEUShippingPrice &&
    selectedEUShippingPrice > 0;
  const isSyriaTransport =
    direction === "sy-eu" &&
    syriaTransportDetails &&
    syriaTransportDetails.calculated_price > 0;

  console.log("🔍 Step10Review - Transport Props:", {
    direction,
    selectedEUShippingName,
    selectedEUShippingPrice,
    syriaTransportDetails,
    isEUTransport,
    isSyriaTransport,
    pricingGrandTotal: pricing?.grandTotal,
  });

  return (
    <div className="space-y-8">
      {/* Shipment Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100"
      >
        <h3 className="text-xl font-bold text-primary-dark mb-4">
          {t.shipmentSummary}
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-semibold text-gray-700">
                {t.direction}:
              </span>
              <p className="text-gray-900 font-bold">
                {isEUtoSY ? t.euToSy : t.syToEu}
              </p>
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-700">
                {t.parcelsCount}:
              </span>
              <p className="text-gray-900 font-bold">{parcels.length}</p>
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-700">
                {t.totalWeight}:
              </span>
              <p className="text-gray-900 font-bold">
                {totalWeight.toFixed(2)} kg
              </p>
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-700">
                {t.totalCBM}:
              </span>
              <p className="text-gray-900 font-bold">
                {totalCBM.toFixed(4)} m³
              </p>
            </div>
          </div>

          {sender && (
            <div className="pt-4 border-t border-gray-200">
              <span className="text-sm font-semibold text-gray-700">
                {t.senderInfo}:
              </span>
              <p className="text-gray-900">{sender.fullName}</p>
              <p className="text-gray-600 text-sm">
                {sender.city}, {sender.country || sender.province}
              </p>
            </div>
          )}

          {receiver && (
            <div className="pt-4 border-t border-gray-200">
              <span className="text-sm font-semibold text-gray-700">
                {t.receiverInfo}:
              </span>
              <p className="text-gray-900">{receiver.fullName}</p>
              <p className="text-gray-600 text-sm">
                {receiver.city}, {receiver.country || receiver.province}
              </p>
            </div>
          )}

          {pricing && (
            <div className="pt-4 border-t border-gray-200">
              <span className="text-sm font-semibold text-gray-700 mb-3 block">
                {t.pricingSummary}:
              </span>

              {/* Pricing Breakdown */}
              <div className="mt-3 space-y-2 bg-gray-50 rounded-lg p-3 border border-gray-200">
                {/* Base LCL Price */}
                {pricing.basePrice && pricing.basePrice.final > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">
                      {t.baseLCLPrice}:
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      €{pricing.basePrice.final.toFixed(2)}
                    </span>
                  </div>
                )}

                {/* Electronics Price */}
                {pricing.electronicsPrice &&
                  pricing.electronicsPrice.total > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">
                        {t.electronicsPrice}:
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        €{pricing.electronicsPrice.total.toFixed(2)}
                      </span>
                    </div>
                  )}

                {/* Packaging */}
                {pricing.packaging && pricing.packaging.total > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">
                      {t.packaging}:
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      €{pricing.packaging.total.toFixed(2)}
                    </span>
                  </div>
                )}

                {/* Insurance */}
                {pricing.insurance && pricing.insurance.total > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">
                      {t.insurance}:
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      €{pricing.insurance.total.toFixed(2)}
                    </span>
                  </div>
                )}

                {/* Total Before Transport */}
                <div className="pt-2 border-t border-gray-300 flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-800">
                    {t.totalBeforeTransport}:
                  </span>
                  <span className="text-base font-bold text-gray-900">
                    €{pricing.grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Internal Transport - EU Transport Card */}
              {isEUTransport && (
                <div className="mt-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-300 shadow-md">
                  <div className="flex items-center gap-2 mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-green-700"
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
                    <h4 className="text-base font-bold text-green-900">
                      {t.euTransport}
                    </h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">
                        {language === "ar" ? "طريقة الشحن" : "Shipping Method"}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {selectedEUShippingName}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-green-300 flex justify-between items-center">
                      <span className="text-sm font-bold text-green-900">
                        {t.finalPrice}:
                      </span>
                      <span className="text-lg font-bold text-green-700">
                        €{selectedEUShippingPrice?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Internal Transport - Syria Transport Card */}
              {isSyriaTransport && (
                <div className="mt-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-300 shadow-md">
                  <div className="flex items-center gap-2 mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-green-700"
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
                    <h4 className="text-base font-bold text-green-900">
                      {t.syriaTransport}
                    </h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">
                        {t.weightCost}:
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        €
                        {syriaTransportDetails.breakdown?.weight_cost?.toFixed(
                          2
                        ) || "0.00"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">
                        {t.minimumPrice}:
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        €{syriaTransportDetails.min_price?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-green-300 flex justify-between items-center">
                      <span className="text-sm font-bold text-green-900">
                        {t.finalPrice}:
                      </span>
                      <span className="text-lg font-bold text-green-700">
                        €
                        {syriaTransportDetails.calculated_price?.toFixed(2) ||
                          "0.00"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Grand Total with Transport */}
              <div className="mt-4 bg-gradient-to-r from-primary-yellow/20 to-primary-yellow/30 rounded-xl p-4 border-2 border-primary-dark/30">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-primary-dark">
                    {t.grandTotal}:
                  </span>
                  <span className="text-3xl font-black text-primary-dark">
                    €
                    {(() => {
                      const baseTotal = pricing.grandTotal || 0;
                      // Calculate total transport cost (sum of both if both exist)
                      const euTransportCost =
                        selectedEUShippingPrice && selectedEUShippingPrice > 0
                          ? selectedEUShippingPrice
                          : 0;
                      const syriaTransportCost =
                        syriaTransportDetails?.calculated_price &&
                        syriaTransportDetails.calculated_price > 0
                          ? syriaTransportDetails.calculated_price
                          : 0;
                      const totalTransportCost =
                        euTransportCost + syriaTransportCost;
                      const finalTotal = baseTotal + totalTransportCost;

                      console.log("💰 Step10Review Grand Total:", {
                        baseTotal,
                        euTransportCost,
                        syriaTransportCost,
                        totalTransportCost,
                        direction,
                        finalTotal,
                      });
                      return finalTotal.toFixed(2);
                    })()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Operational Policies */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100"
      >
        <h3 className="text-xl font-bold text-primary-dark mb-4">
          {t.operationalPolicies}
        </h3>

        <div className="space-y-4">
          {/* Policy 1: Rejection */}
          <div className="bg-red-50 rounded-xl p-4 border-2 border-red-200">
            <h4 className="font-bold text-red-900 mb-2">{t.policyRejection}</h4>
            <p className="text-sm text-red-800">{t.policyRejectionDesc}</p>
          </div>

          {/* Policy 2: Storage */}
          <div className="bg-orange-50 rounded-xl p-4 border-2 border-orange-200">
            <h4 className="font-bold text-orange-900 mb-2">
              {t.policyStorage}
            </h4>
            <p className="text-sm text-orange-800">{t.policyStorageDesc}</p>
          </div>

          {/* Policy 3: KYC */}
          <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
            <h4 className="font-bold text-blue-900 mb-2">{t.policyKYC}</h4>
            <p className="text-sm text-blue-800">{t.policyKYCDesc}</p>
          </div>

          {/* Policy 4: Liability */}
          <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
            <h4 className="font-bold text-purple-900 mb-2">
              {t.policyLiability}
            </h4>
            <p className="text-sm text-purple-800">{t.policyLiabilityDesc}</p>
          </div>

          {/* Policy 5: Large Items */}
          <div className="bg-yellow-50 rounded-xl p-4 border-2 border-yellow-200">
            <h4 className="font-bold text-yellow-900 mb-2">
              {t.policyLargeItems}
            </h4>
            <p className="text-sm text-yellow-800">{t.policyLargeItemsDesc}</p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={acceptedPolicies}
              onChange={(e) => onAcceptedPoliciesChange(e.target.checked)}
              className="w-5 h-5 mt-1 text-primary-yellow rounded focus:ring-primary-yellow"
              required
            />
            <div className="flex-1">
              <label className="text-sm font-semibold text-gray-800">
                {t.acceptPolicies} *
              </label>
              <Link
                href="/documents/shipping-contract-full.pdf"
                target="_blank"
                className="text-primary-dark hover:text-primary-yellow text-sm underline ml-2"
              >
                {t.readPolicies}
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Terms and Conditions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100"
      >
        <h3 className="text-xl font-bold text-primary-dark mb-4">
          {t.termsAndConditions}
        </h3>

        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => onAcceptedTermsChange(e.target.checked)}
            className="w-5 h-5 mt-1 text-primary-yellow rounded focus:ring-primary-yellow"
            required
          />
          <div className="flex-1">
            <label className="text-sm font-semibold text-gray-800">
              {t.acceptTerms} *
            </label>
            <Link
              href="/documents/shipping-contract-full.pdf"
              target="_blank"
              className="text-primary-dark hover:text-primary-yellow text-sm underline ml-2"
            >
              {t.readTerms}
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Create Shipment Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex justify-center"
      >
        <motion.button
          onClick={onCreateShipment}
          disabled={!acceptedTerms || !acceptedPolicies}
          className={`relative px-20 py-5 font-bold text-xl rounded-3xl shadow-2xl transition-all duration-500 overflow-hidden group ${
            acceptedTerms && acceptedPolicies
              ? "bg-gradient-to-r from-primary-yellow to-primary-yellow/90 text-primary-dark hover:shadow-primary-yellow/50"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          whileHover={
            acceptedTerms && acceptedPolicies ? { scale: 1.08, y: -2 } : {}
          }
          whileTap={acceptedTerms && acceptedPolicies ? { scale: 0.96 } : {}}
        >
          <span className="relative z-10 flex items-center gap-3">
            {t.createShipment}
            <motion.svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              initial={{ x: 0 }}
              whileHover={
                acceptedTerms && acceptedPolicies
                  ? { x: language === "ar" ? -5 : 5 }
                  : {}
              }
              transition={{ duration: 0.3 }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </motion.svg>
          </span>
        </motion.button>
      </motion.div>
    </div>
  );
}
