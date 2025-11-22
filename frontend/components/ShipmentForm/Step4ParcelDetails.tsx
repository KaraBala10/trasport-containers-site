"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Parcel, ShipmentType } from "@/types/shipment";
import { PER_KG_PRODUCTS, PER_PIECE_PRODUCTS } from "@/types/pricing";
import { apiService } from "@/lib/api";

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
  const [calculatingCBM, setCalculatingCBM] = useState<Record<string, boolean>>(
    {}
  );

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

        // Clear CBM when any dimension changes to force recalculation
        if (field === "length" || field === "width" || field === "height") {
          updatedParcel.cbm = 0;
        }

        return updatedParcel;
      }
      return parcel;
    });
    onParcelsChange(updatedParcels);
  };

  const calculateCBMFromAPI = async (parcelId: string) => {
    const parcel = parcels.find((p) => p.id === parcelId);
    if (!parcel) return;

    const length = parcel.length || 0;
    const width = parcel.width || 0;
    const height = parcel.height || 0;

    // Validate dimensions
    if (length <= 0 || width <= 0 || height <= 0) {
      alert(
        language === "ar"
          ? "يرجى إدخال الأبعاد (الطول والعرض والارتفاع) أولاً"
          : "Please enter dimensions (length, width, height) first"
      );
      return;
    }

    setCalculatingCBM((prev) => ({ ...prev, [parcelId]: true }));

    try {
      const response = await apiService.calculateCBM(length, width, height);

      if (response.success && response.cbm !== undefined) {
        updateParcel(parcelId, "cbm", response.cbm);
      } else {
        alert(
          language === "ar"
            ? `خطأ في حساب الحجم: ${response.error || "خطأ غير معروف"}`
            : `Error calculating volume: ${response.error || "Unknown error"}`
        );
      }
    } catch (error: any) {
      console.error("Error calculating CBM:", error);
      alert(
        language === "ar"
          ? "حدث خطأ أثناء حساب الحجم. يرجى المحاولة مرة أخرى."
          : "An error occurred while calculating volume. Please try again."
      );
    } finally {
      setCalculatingCBM((prev) => ({ ...prev, [parcelId]: false }));
    }
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
              <h3 className="text-xl font-bold text-primary-dark">
                {language === "ar"
                  ? `طرد #${index + 1}`
                  : `Parcel #${index + 1}`}
              </h3>
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

              {/* CBM Display with Calculate Button */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.cbm}
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-600 flex items-center">
                    {parcel.cbm > 0
                      ? `${parcel.cbm.toFixed(6)} m³`
                      : language === "ar"
                      ? "0.000000 m³"
                      : "0.000000 m³"}
                  </div>
                  <button
                    type="button"
                    onClick={() => calculateCBMFromAPI(parcel.id)}
                    disabled={
                      calculatingCBM[parcel.id] ||
                      !parcel.length ||
                      !parcel.width ||
                      !parcel.height
                    }
                    className="px-4 py-3 bg-primary-yellow text-primary-dark font-semibold rounded-xl hover:bg-primary-yellow/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 min-w-[120px] justify-center"
                  >
                    {calculatingCBM[parcel.id] ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span className="text-sm">
                          {language === "ar"
                            ? "جاري الحساب..."
                            : "Calculating..."}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm">
                        {language === "ar" ? "احسب" : "Calculate"}
                      </span>
                    )}
                  </button>
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
