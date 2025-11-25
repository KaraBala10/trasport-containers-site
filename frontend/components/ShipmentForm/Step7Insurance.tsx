"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface Step7InsuranceProps {
  optionalInsuranceValue: number;
  onOptionalInsuranceChange: (value: number) => void;
  language: "ar" | "en";
  hasElectronics: boolean;
  electronicsDeclaredValue: number;
}

export default function Step7Insurance({
  optionalInsuranceValue,
  onOptionalInsuranceChange,
  language,
  hasElectronics,
  electronicsDeclaredValue,
}: Step7InsuranceProps) {
  const translations = {
    ar: {
      title: "التأمين",
      optionalInsurance: "تأمين اختياري",
      optionalInsuranceDesc:
        "يمكنك اختيار تأمين إضافي على قيمة الشحنة (1.5% من القيمة المعلنة)",
      declaredValue: "القيمة المعلنة للشحنة (€)",
      insuranceRate: "نسبة التأمين",
      insuranceCost: "تكلفة التأمين",
      mandatoryInsurance: "تأمين إلزامي للإلكترونيات",
      mandatoryInsuranceDesc:
        "التأمين إلزامي للإلكترونيات بنسبة 1% من القيمة المعلنة",
      electronicsValue: "القيمة المعلنة للإلكترونيات",
      totalInsurance: "إجمالي التأمين",
      optional: "اختياري",
      mandatory: "إلزامي",
    },
    en: {
      title: "Insurance",
      optionalInsurance: "Optional Insurance",
      optionalInsuranceDesc:
        "You can choose additional insurance on shipment value (1.5% of declared value)",
      declaredValue: "Declared Shipment Value (€)",
      insuranceRate: "Insurance Rate",
      insuranceCost: "Insurance Cost",
      mandatoryInsurance: "Mandatory Insurance for Electronics",
      mandatoryInsuranceDesc:
        "Insurance is mandatory for electronics at 1% of declared value",
      electronicsValue: "Electronics Declared Value",
      totalInsurance: "Total Insurance",
      optional: "Optional",
      mandatory: "Mandatory",
    },
  };

  const t = translations[language];

  const optionalInsuranceCost = optionalInsuranceValue * 0.015; // 1.5%
  const mandatoryInsuranceCost = hasElectronics
    ? electronicsDeclaredValue * 0.01
    : 0; // 1% for electronics
  const totalInsuranceCost = optionalInsuranceCost + mandatoryInsuranceCost;

  return (
    <div className="space-y-8">
      {/* Optional Insurance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100"
      >
        <div className="mb-4">
          <h3 className="text-xl font-bold text-primary-dark mb-2">
            {t.optionalInsurance}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            {t.optionalInsuranceDesc}
          </p>
          <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
            {t.optional}
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.declaredValue}
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={optionalInsuranceValue || ""}
              onChange={(e) =>
                onOptionalInsuranceChange(parseFloat(e.target.value) || 0)
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
              placeholder={
                language === "ar" ? "أدخل القيمة..." : "Enter value..."
              }
            />
          </div>

          {optionalInsuranceValue > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">{t.insuranceRate}</span>
                  <span className="font-semibold text-blue-900">1.5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">{t.insuranceCost}</span>
                  <span className="font-bold text-blue-900 text-lg">
                    {optionalInsuranceCost.toFixed(2)} €
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Mandatory Insurance for Electronics */}
      {hasElectronics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-purple-50 rounded-2xl p-6 shadow-lg border-2 border-purple-200"
        >
          <div className="mb-4">
            <h3 className="text-xl font-bold text-purple-900 mb-2">
              {t.mandatoryInsurance}
            </h3>
            <p className="text-sm text-purple-700 mb-2">
              {t.mandatoryInsuranceDesc}
            </p>
            <span className="inline-block px-3 py-1 bg-purple-200 text-purple-900 text-xs rounded-full font-semibold">
              {t.mandatory}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.electronicsValue}
              </label>
              <div className="w-full px-4 py-3 rounded-xl border-2 border-purple-300 bg-purple-100 text-purple-900 font-semibold">
                {electronicsDeclaredValue.toFixed(2)} €
              </div>
            </div>

            <div className="bg-purple-100 rounded-xl p-4 border-2 border-purple-300">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-purple-900">{t.insuranceRate}</span>
                  <span className="font-semibold text-purple-900">1%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-900 font-semibold">
                    {t.insuranceCost}
                  </span>
                  <span className="font-bold text-purple-900 text-lg">
                    {mandatoryInsuranceCost.toFixed(2)} €
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Total Insurance */}
      {totalInsuranceCost > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-primary-yellow to-primary-yellow/90 rounded-2xl p-6 shadow-2xl border-4 border-primary-dark"
        >
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-primary-dark">
              {t.totalInsurance}
            </span>
            <span className="text-3xl font-black text-primary-dark">
              {totalInsuranceCost.toFixed(2)} €
            </span>
          </div>
        </motion.div>
      )}

      {!hasElectronics && optionalInsuranceValue === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-4 text-gray-500 text-sm"
        >
          {language === "ar"
            ? "ملاحظة: التأمين اختياري. يمكنك إضافة قيمة التأمين أعلاه إذا رغبت."
            : "Note: Insurance is optional. You can add insurance value above if desired."}
        </motion.div>
      )}
    </div>
  );
}
