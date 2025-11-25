"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface Step3InsuranceProps {
  wantsInsurance: boolean;
  onWantsInsuranceChange: (value: boolean) => void;
  declaredShipmentValue: number;
  onDeclaredShipmentValueChange: (value: number) => void;
  language: "ar" | "en";
}

export default function Step3Insurance({
  wantsInsurance,
  onWantsInsuranceChange,
  declaredShipmentValue,
  onDeclaredShipmentValueChange,
  language,
}: Step3InsuranceProps) {
  const translations = {
    ar: {
      title: "التأمين",
      insuranceCheckbox: "أريد التأمين على الشحنة",
      insuranceDesc:
        "يمكنك اختيار تأمين إضافي على قيمة الشحنة (1.5% من القيمة المعلنة + حساب الشحنة)",
      declaredValue: "القيمة المعلنة للشحنة (€)",
      note: "ملاحظة: التأمين اختياري. سيتم حساب التأمين في صفحة ملخص التسعير.",
    },
    en: {
      title: "Insurance",
      insuranceCheckbox: "I want insurance for the shipment",
      insuranceDesc:
        "You can choose additional insurance on shipment value (1.5% of declared value + calculation)",
      declaredValue: "Declared Shipment Value (€)",
      note: "Note: Insurance is optional. Insurance will be calculated in the Pricing Summary page.",
    },
  };

  const t = translations[language];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100"
      >
        <div className="mb-4">
          <h3 className="text-xl font-bold text-primary-dark mb-2">
            {t.title}
          </h3>
          <p className="text-sm text-gray-600 mb-4">{t.insuranceDesc}</p>
        </div>

        <div className="space-y-4">
          {/* Checkbox */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="insurance-checkbox"
              checked={wantsInsurance}
              onChange={(e) => {
                onWantsInsuranceChange(e.target.checked);
                if (!e.target.checked) {
                  onDeclaredShipmentValueChange(0);
                }
              }}
              className="w-5 h-5 text-primary-yellow border-gray-300 rounded focus:ring-2 focus:ring-primary-yellow focus:ring-offset-2 cursor-pointer"
            />
            <label
              htmlFor="insurance-checkbox"
              className="text-lg font-semibold text-gray-700 cursor-pointer"
            >
              {t.insuranceCheckbox}
            </label>
          </div>

          {/* Declared Shipment Value Field - Only shown when checkbox is checked */}
          {wantsInsurance && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.declaredValue}
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={declaredShipmentValue || ""}
                onChange={(e) =>
                  onDeclaredShipmentValueChange(
                    parseFloat(e.target.value) || 0
                  )
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                placeholder={
                  language === "ar" ? "أدخل القيمة..." : "Enter value..."
                }
              />
            </motion.div>
          )}

          {!wantsInsurance && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-4 text-gray-500 text-sm"
            >
              {t.note}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

