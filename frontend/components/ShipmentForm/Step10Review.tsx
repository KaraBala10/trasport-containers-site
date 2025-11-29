"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShippingDirection, PersonInfo, Parcel } from "@/types/shipment";
import { PricingResult } from "@/types/pricing";
import Link from "next/link";

interface Step10ReviewProps {
  direction: ShippingDirection;
  sender: PersonInfo | null;
  receiver: PersonInfo | null;
  parcels: Parcel[];
  pricing: PricingResult | null;
  acceptedTerms: boolean;
  acceptedPolicies: boolean;
  onAcceptedTermsChange: (accepted: boolean) => void;
  onAcceptedPoliciesChange: (accepted: boolean) => void;
  language: "ar" | "en";
  selectedEUShippingName?: string;
  selectedEUShippingPrice?: number; // Original Sendcloud price
  selectedEUShippingTotalPrice?: number; // Total price with profit (from backend)
  syriaTransportDetails?: any;
}

export default function Step10Review({
  direction,
  sender,
  receiver,
  parcels,
  pricing,
  acceptedTerms,
  acceptedPolicies,
  onAcceptedTermsChange,
  onAcceptedPoliciesChange,
  language,
  selectedEUShippingName,
  selectedEUShippingPrice,
  selectedEUShippingTotalPrice,
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
      businessLCL: "Business LCL",
    },
  };

  const t = translations[language];
  const isEUtoSY = direction === "eu-sy";

  const totalWeight = parcels.reduce((sum, p) => sum + (p.weight || 0), 0);
  const totalCBM = parcels.reduce((sum, p) => sum + (p.cbm || 0), 0);

  // Show transport cards based on data availability (ignore direction) - Same as Step5Pricing
  // Use selectedEUShippingTotalPrice (with profit) to determine if EU transport exists
  const isEUTransport =
    selectedEUShippingTotalPrice && selectedEUShippingTotalPrice > 0;
  const isSyriaTransport =
    syriaTransportDetails?.calculated_price &&
    syriaTransportDetails.calculated_price > 0;

  // Calculate transport prices (use total_price from backend, NOT selectedEUShippingPrice)
  const euTransportPrice = isEUTransport
    ? selectedEUShippingTotalPrice || 0
    : 0;
  const syriaTransportCost = isSyriaTransport
    ? syriaTransportDetails.calculated_price
    : 0;
  const totalTransportCost = euTransportPrice + syriaTransportCost;

  console.log("🔍 Step10Review - Transport Props:", {
    direction,
    isEUTransport,
    isSyriaTransport,
    selectedEUShippingPrice, // Original Sendcloud price
    selectedEUShippingTotalPrice, // Total with profit (from backend)
    euTransportPrice, // Should be total_price
    syriaTransportCost,
    totalTransportCost,
    selectedEUShippingName,
    pricingGrandTotal: pricing?.grandTotal,
  });

  return (
    <div className="space-y-8">
      {/* Shipment Summary - Invoice Style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg p-6 border border-gray-300"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
          {t.shipmentSummary}
        </h3>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">{t.direction}:</span>
            <span className="text-sm font-semibold text-gray-900">
              {isEUtoSY ? t.euToSy : t.syToEu}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">{t.parcelsCount}:</span>
            <span className="text-sm font-semibold text-gray-900">
              {parcels.length}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">{t.totalWeight}:</span>
            <span className="text-sm font-semibold text-gray-900">
              {totalWeight.toFixed(2)} kg
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">{t.totalCBM}:</span>
            <span className="text-sm font-semibold text-gray-900">
              {totalCBM.toFixed(4)} m³
            </span>
          </div>

          {sender && (
            <div className="pt-3 border-t border-gray-200">
              <div className="text-sm font-semibold text-gray-700 mb-1">
                {t.senderInfo}:
              </div>
              <div className="text-sm text-gray-900">{sender.fullName}</div>
              <div className="text-xs text-gray-600">
                {sender.city}, {sender.country || sender.province}
              </div>
            </div>
          )}

          {receiver && (
            <div className="pt-3 border-t border-gray-200">
              <div className="text-sm font-semibold text-gray-700 mb-1">
                {t.receiverInfo}:
              </div>
              <div className="text-sm text-gray-900">{receiver.fullName}</div>
              <div className="text-xs text-gray-600">
                {receiver.city}, {receiver.country || receiver.province}
              </div>
            </div>
          )}

          {pricing && (
            <div className="pt-4 border-t-2 border-gray-300">
              <span className="text-base font-bold text-gray-900 mb-3 block">
                {t.pricingSummary}:
              </span>

              {/* Pricing Breakdown */}
              <div className="mt-3 space-y-2">
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

                {/* EU Transport - Text Format */}
                {isEUTransport && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">
                      {t.euTransport} ({selectedEUShippingName}):
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      €{euTransportPrice.toFixed(2)}
                    </span>
                  </div>
                )}

                {/* Syria Transport - Text Format with Details */}
                {isSyriaTransport && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">
                        {t.syriaTransport}:
                      </span>
                      <span className="text-sm font-semibold text-gray-900"></span>
                    </div>
                    <div className="flex justify-between items-center pl-4">
                      <span className="text-xs text-gray-600">
                        {t.weightCost} ({syriaTransportDetails.weight} kg × €
                        {syriaTransportDetails.rate_per_kg?.toFixed(2)}/kg):
                      </span>
                      <span className="text-xs font-semibold text-gray-800">
                        €
                        {syriaTransportDetails.breakdown?.weight_cost?.toFixed(
                          2
                        ) || "0.00"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pl-4">
                      <span className="text-xs text-gray-600">
                        {t.minimumPrice}:
                      </span>
                      <span className="text-xs font-semibold text-gray-800">
                        €{syriaTransportDetails.min_price?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pl-4">
                      <span className="text-sm font-bold text-gray-700">
                        {t.finalPrice}:
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        €
                        {syriaTransportDetails.calculated_price?.toFixed(2) ||
                          "0.00"}
                      </span>
                    </div>
                  </>
                )}

                {/* Total Before Transport */}
                {(isEUTransport || isSyriaTransport) && (
                  <div className="pt-2 border-t border-gray-300 flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-800">
                      {t.totalBeforeTransport}:
                    </span>
                    <span className="text-base font-bold text-gray-900">
                      €{pricing.grandTotal.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {/* Grand Total - Invoice Style */}
              <div className="mt-4 bg-gray-100 rounded-lg p-4 border-2 border-gray-400">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900">
                    {t.grandTotal}:
                  </span>
                  <span className="text-2xl font-bold text-gray-900">
                    €
                    {(() => {
                      const baseTotal = pricing.grandTotal || 0;
                      const finalTotal = baseTotal + totalTransportCost;

                      console.log("💰 Step10Review Grand Total:", {
                        baseTotal,
                        euTransportPrice,
                        syriaTransportCost,
                        totalTransportCost,
                        direction,
                        isEUTransport,
                        isSyriaTransport,
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

      {/* Operational Policies - Invoice Style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg p-6 border border-gray-300"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
          {t.operationalPolicies}
        </h3>

        <div className="space-y-3">
          {/* Policy 1: Rejection */}
          <div className="border-l-4 border-red-500 pl-3 py-2">
            <h4 className="font-bold text-gray-900 text-sm mb-1">
              {t.policyRejection}
            </h4>
            <p className="text-xs text-gray-700">{t.policyRejectionDesc}</p>
          </div>

          {/* Policy 2: Storage */}
          <div className="border-l-4 border-orange-500 pl-3 py-2">
            <h4 className="font-bold text-gray-900 text-sm mb-1">
              {t.policyStorage}
            </h4>
            <p className="text-xs text-gray-700">{t.policyStorageDesc}</p>
          </div>

          {/* Policy 3: KYC */}
          <div className="border-l-4 border-blue-500 pl-3 py-2">
            <h4 className="font-bold text-gray-900 text-sm mb-1">
              {t.policyKYC}
            </h4>
            <p className="text-xs text-gray-700">{t.policyKYCDesc}</p>
          </div>

          {/* Policy 4: Liability */}
          <div className="border-l-4 border-purple-500 pl-3 py-2">
            <h4 className="font-bold text-gray-900 text-sm mb-1">
              {t.policyLiability}
            </h4>
            <p className="text-xs text-gray-700">{t.policyLiabilityDesc}</p>
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
                href={`/documents/${encodeURIComponent(
                  "LCL Shipping Policy - Medo-Freight EU.pdf"
                )}`}
                target="_blank"
                className="text-primary-dark hover:text-primary-yellow text-sm underline ml-2"
              >
                {t.readPolicies}
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Terms and Conditions - Invoice Style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-lg p-6 border border-gray-300"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
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
              href={`/documents/${encodeURIComponent(
                "LCL Shipping Agreement - Medo-Freight EU.pdf"
              )}`}
              target="_blank"
              className="text-primary-dark hover:text-primary-yellow text-sm underline ml-2"
            >
              {t.readTerms}
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
