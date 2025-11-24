"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Parcel, ShipmentType } from "@/types/shipment";
import { PER_KG_PRODUCTS, PER_PIECE_PRODUCTS } from "@/types/pricing";
import { calculateCBM } from "@/lib/pricing";

interface Step4ParcelDetailsProps {
  shipmentTypes: ShipmentType[];
  parcels: Parcel[];
  onParcelsChange: (parcels: Parcel[]) => void;
  language: "ar" | "en";
}

export default function Step4ParcelDetails({
  shipmentTypes,
  parcels,
  onParcelsChange,
  language,
}: Step4ParcelDetailsProps) {
  const translations = {
    ar: {
      title: "تفاصيل الطرود",
      addParcel: "إضافة طرد جديد",
      removeParcel: "حذف الطرد",
      length: "الطول (سم)",
      width: "العرض (سم)",
      height: "الارتفاع (سم)",
      weight: "الوزن (كغ)",
      productCategory: "نوع المنتج",
      quantity: "الكمية",
      repeatCount: "عدد التكرار",
      repeatCountHint: "كم مرة تريد تكرار هذا الطرد؟",
      photos: "صور الطرد",
      photosRequired: "مطلوب: 3 صور",
      devicePhoto: "صورة المنتج الإلكتروني",
      devicePhotoRequired: "مطلوب: صورة واحدة",
      cbm: "الحجم (CBM)",
      deviceType: "نوع الجهاز",
      deviceModel: "الموديل",
      declaredValue: "القيمة المعلنة (€)",
      hasInvoice: "يوجد فاتورة شراء",
      itemType: "نوع القطعة",
      unknownDimensions: "لا أعرف الأبعاد الدقيقة",
      notes: "ملاحظات",
      electronicsInfo: "معلومات الإلكترونيات",
      largeItemInfo: "معلومات القطعة الكبيرة",
    },
    en: {
      title: "Parcel Details",
      addParcel: "Add New Parcel",
      removeParcel: "Remove Parcel",
      length: "Length (cm)",
      width: "Width (cm)",
      height: "Height (cm)",
      weight: "Weight (kg)",
      productCategory: "Product Category",
      quantity: "Quantity",
      repeatCount: "Repeat Count",
      repeatCountHint: "How many times to repeat this parcel?",
      photos: "Parcel Photos",
      photosRequired: "Required: 3 photos",
      devicePhoto: "Electronics Device Photo",
      devicePhotoRequired: "Required: 1 photo",
      cbm: "Volume (CBM)",
      deviceType: "Device Type",
      deviceModel: "Model",
      declaredValue: "Declared Value (€)",
      hasInvoice: "Has Purchase Invoice",
      itemType: "Item Type",
      unknownDimensions: "Unknown Dimensions",
      notes: "Notes",
      electronicsInfo: "Electronics Information",
      largeItemInfo: "Large Item Information",
    },
  };

  const t = translations[language];
  const hasElectronics = shipmentTypes.includes("electronics");
  const hasLargeItems = shipmentTypes.includes("large-items");

  // Combine all product categories
  const allProducts = [...PER_KG_PRODUCTS, ...PER_PIECE_PRODUCTS];

  const addParcel = () => {
    const newParcel: Parcel = {
      id: `parcel-${Date.now()}`,
      length: 0,
      width: 0,
      height: 0,
      weight: 0,
      cbm: 0,
      productCategory: "",
      quantity: 1,
      repeatCount: 1,
      photos: [],
    };
    onParcelsChange([...parcels, newParcel]);
  };

  const removeParcel = (id: string) => {
    onParcelsChange(parcels.filter((p) => p.id !== id));
  };

  const updateParcel = (id: string, field: keyof Parcel, value: any) => {
    const updatedParcels = parcels.map((parcel) => {
      if (parcel.id === id) {
        const updatedParcel = { ...parcel, [field]: value };

        // Automatically calculate CBM when any dimension changes
        if (field === "length" || field === "width" || field === "height") {
          const length = field === "length" ? value : parcel.length || 0;
          const width = field === "width" ? value : parcel.width || 0;
          const height = field === "height" ? value : parcel.height || 0;
          updatedParcel.cbm = calculateCBM(length, width, height);
        }

        return updatedParcel;
      }
      return parcel;
    });
    onParcelsChange(updatedParcels);
  };

  const handlePhotoUpload = (
    id: string,
    files: FileList | null,
    isDevicePhoto: boolean = false
  ) => {
    if (!files || files.length === 0) return;

    const updatedParcels = parcels.map((parcel) => {
      if (parcel.id === id) {
        if (isDevicePhoto) {
          return { ...parcel, devicePhoto: files[0] };
        } else {
          return { ...parcel, photos: Array.from(files) };
        }
      }
      return parcel;
    });
    onParcelsChange(updatedParcels);
  };

  // Device types for electronics
  const deviceTypes = [
    { id: "mobile", name: "موبايل", nameEn: "Mobile Phone" },
    { id: "laptop", name: "لابتوب", nameEn: "Laptop" },
    { id: "camera", name: "كاميرا", nameEn: "Camera" },
    { id: "tablet", name: "تابلت", nameEn: "Tablet" },
    { id: "other", name: "أخرى", nameEn: "Other" },
  ];

  // Item types for large items
  const itemTypes = [
    { id: "furniture", name: "أثاث", nameEn: "Furniture" },
    { id: "appliance", name: "جهاز منزلي", nameEn: "Home Appliance" },
    { id: "refrigerator", name: "براد", nameEn: "Refrigerator" },
    { id: "washing-machine", name: "غسالة", nameEn: "Washing Machine" },
    { id: "other", name: "أخرى", nameEn: "Other" },
  ];

  return (
    <div className="space-y-6">
      {/* Add Parcel Button */}
      <div className="flex justify-end">
        <motion.button
          onClick={addParcel}
          className="px-6 py-3 bg-primary-yellow text-primary-dark font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {t.addParcel}
        </motion.button>
      </div>

      {/* Parcels List */}
      <AnimatePresence>
        {parcels.map((parcel, index) => (
          <motion.div
            key={parcel.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-xl font-bold text-primary-dark">
                  {language === "ar"
                    ? `طرد #${index + 1}`
                    : `Parcel #${index + 1}`}
                </h3>
                {/* Repeat Count Badge */}
                <div className="flex items-center gap-2 bg-gradient-to-r from-primary-yellow/20 to-primary-yellow/10 px-4 py-2 rounded-lg border-2 border-primary-yellow/30 shadow-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-primary-yellow"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <label className="text-xs font-semibold text-gray-600 whitespace-nowrap">
                    {language === "ar" ? "عدد التكرار:" : "Repeat:"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={parcel.repeatCount || 1}
                    onChange={(e) =>
                      updateParcel(
                        parcel.id,
                        "repeatCount",
                        Math.max(1, parseInt(e.target.value) || 1)
                      )
                    }
                    className="w-16 px-2 py-1 text-center font-bold text-primary-dark bg-white rounded-md border-2 border-primary-yellow/50 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow transition-all"
                  />
                  {parcel.repeatCount > 1 && (
                    <span className="text-sm font-bold text-primary-yellow">
                      × {parcel.repeatCount}
                    </span>
                  )}
                </div>
              </div>
              <motion.button
                onClick={() => removeParcel(parcel.id)}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t.removeParcel}
              </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Dimensions */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.length} *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={parcel.length || ""}
                  onChange={(e) =>
                    updateParcel(
                      parcel.id,
                      "length",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.width} *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={parcel.width || ""}
                  onChange={(e) =>
                    updateParcel(
                      parcel.id,
                      "width",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.height} *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={parcel.height || ""}
                  onChange={(e) =>
                    updateParcel(
                      parcel.id,
                      "height",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.weight} *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={parcel.weight || ""}
                  onChange={(e) =>
                    updateParcel(
                      parcel.id,
                      "weight",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                />
              </div>

              {/* CBM Display (Auto-calculated) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.cbm}
                </label>
                <div className="px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-600 flex items-center">
                  {parcel.cbm > 0
                    ? `${parcel.cbm.toFixed(6)} m³`
                    : language === "ar"
                    ? "0.000000 m³"
                    : "0.000000 m³"}
                </div>
              </div>

              {/* Product Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.productCategory} *
                </label>
                <select
                  value={parcel.productCategory}
                  onChange={(e) =>
                    updateParcel(parcel.id, "productCategory", e.target.value)
                  }
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow bg-white"
                >
                  <option value="">
                    {language === "ar" ? "اختر..." : "Select..."}
                  </option>
                  {allProducts.map((product) => (
                    <option key={product.key} value={product.key}>
                      {language === "ar" ? product.name : product.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.quantity} *
                </label>
                <input
                  type="number"
                  min="1"
                  value={parcel.quantity || 1}
                  onChange={(e) =>
                    updateParcel(
                      parcel.id,
                      "quantity",
                      parseInt(e.target.value) || 1
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                />
              </div>

              {/* Photos */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.photos} * ({t.photosRequired})
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handlePhotoUpload(parcel.id, e.target.files)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                />
                {parcel.photos && parcel.photos.length > 0 && (
                  <p className="mt-2 text-sm text-gray-600">
                    {parcel.photos.length}{" "}
                    {language === "ar" ? "صورة محملة" : "photos uploaded"}
                  </p>
                )}
              </div>

              {/* Electronics Fields */}
              {hasElectronics && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="md:col-span-2 space-y-4 p-4 bg-purple-50 rounded-xl border-2 border-purple-200"
                >
                  <h4 className="font-bold text-purple-900">
                    {t.electronicsInfo}
                  </h4>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.deviceType} *
                    </label>
                    <select
                      value={parcel.deviceType || ""}
                      onChange={(e) =>
                        updateParcel(parcel.id, "deviceType", e.target.value)
                      }
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow bg-white"
                    >
                      <option value="">
                        {language === "ar" ? "اختر..." : "Select..."}
                      </option>
                      {deviceTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {language === "ar" ? type.name : type.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.deviceModel} *
                    </label>
                    <input
                      type="text"
                      value={parcel.deviceModel || ""}
                      onChange={(e) =>
                        updateParcel(parcel.id, "deviceModel", e.target.value)
                      }
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.declaredValue} * (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={parcel.declaredValue || ""}
                      onChange={(e) =>
                        updateParcel(
                          parcel.id,
                          "declaredValue",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={parcel.hasInvoice || false}
                      onChange={(e) =>
                        updateParcel(parcel.id, "hasInvoice", e.target.checked)
                      }
                      className="w-5 h-5 text-primary-yellow rounded focus:ring-primary-yellow"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      {t.hasInvoice}
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.devicePhoto} * ({t.devicePhotoRequired})
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handlePhotoUpload(parcel.id, e.target.files, true)
                      }
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                    />
                  </div>
                </motion.div>
              )}

              {/* Large Items Fields */}
              {hasLargeItems && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="md:col-span-2 space-y-4 p-4 bg-orange-50 rounded-xl border-2 border-orange-200"
                >
                  <h4 className="font-bold text-orange-900">
                    {t.largeItemInfo}
                  </h4>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.itemType} *
                    </label>
                    <select
                      value={parcel.itemType || ""}
                      onChange={(e) =>
                        updateParcel(parcel.id, "itemType", e.target.value)
                      }
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow bg-white"
                    >
                      <option value="">
                        {language === "ar" ? "اختر..." : "Select..."}
                      </option>
                      {itemTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {language === "ar" ? type.name : type.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={parcel.unknownDimensions || false}
                      onChange={(e) =>
                        updateParcel(
                          parcel.id,
                          "unknownDimensions",
                          e.target.checked
                        )
                      }
                      className="w-5 h-5 text-primary-yellow rounded focus:ring-primary-yellow"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      {t.unknownDimensions}
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.notes}
                    </label>
                    <textarea
                      value={parcel.notes || ""}
                      onChange={(e) =>
                        updateParcel(parcel.id, "notes", e.target.value)
                      }
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {parcels.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {language === "ar"
            ? 'لا توجد طرود. اضغط على "إضافة طرد جديد" للبدء.'
            : 'No parcels. Click "Add New Parcel" to start.'}
        </div>
      )}
    </div>
  );
}
