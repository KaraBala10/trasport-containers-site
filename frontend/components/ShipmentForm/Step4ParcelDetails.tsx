"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Parcel, ShipmentType } from "@/types/shipment";
import { apiService } from "@/lib/api";

interface Price {
  id: number;
  ar_item: string;
  en_item: string;
  price_per_kg: number;
  minimum_shipping_weight: number;
  minimum_shipping_unit: "per_kg" | "per_piece";
  minimum_shipping_unit_display: string;
  one_cbm: number;
}

interface PerPieceProduct {
  id: number;
  ar_item: string;
  en_item: string;
  price_per_kg: string;
  minimum_shipping_weight: string;
  minimum_shipping_unit: string;
}

interface PackagingPrice {
  id: number;
  ar_option: string;
  en_option: string;
  dimension: string;
  price: number;
}

interface Step4ParcelDetailsProps {
  shipmentTypes: ShipmentType[];
  parcels: Parcel[];
  onParcelsChange: (parcels: Parcel[]) => void;
  language: "ar" | "en";
  onValidationChange?: (isValid: boolean) => void;
  wantsInsurance?: boolean;
  onWantsInsuranceChange?: (value: boolean) => void;
  declaredShipmentValue?: number;
  onDeclaredShipmentValueChange?: (value: number) => void;
}

export default function Step4ParcelDetails({
  shipmentTypes,
  parcels,
  onParcelsChange,
  language,
  onValidationChange,
}: Step4ParcelDetailsProps) {
  const [prices, setPrices] = useState<Price[]>([]);
  const [regularProducts, setRegularProducts] = useState<Price[]>([]);
  const [perPieceProducts, setPerPieceProducts] = useState<PerPieceProduct[]>(
    []
  );
  const [packagingPrices, setPackagingPrices] = useState<PackagingPrice[]>([]);
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [loadingPackagingPrices, setLoadingPackagingPrices] = useState(true);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [customProductMode, setCustomProductMode] = useState<{
    [key: string]: boolean;
  }>({});
  const [requestingProduct, setRequestingProduct] = useState<{
    [key: string]: boolean;
  }>({});
  const [productRequested, setProductRequested] = useState<{
    [key: string]: boolean;
  }>({});

  // Fetch prices from API
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setLoadingPrices(true);
        const response = await apiService.getPrices();
        if (response.data.success && response.data.prices) {
          setPrices(response.data.prices);
        }
      } catch (error) {
        console.error("Error fetching prices:", error);
      } finally {
        setLoadingPrices(false);
      }
    };

    const fetchRegularProducts = async () => {
      try {
        const response = await apiService.getRegularProducts();
        if (response.data.success && response.data.products) {
          setRegularProducts(response.data.products);
          console.log('✅ Regular products loaded:', response.data.products.length);
        }
      } catch (error) {
        console.error("Failed to fetch regular products:", error);
      }
    };

    const fetchPerPieceProducts = async () => {
      try {
        const response = await apiService.getPerPieceProducts();
        if (response.data.success) {
          setPerPieceProducts(response.data.products);
          console.log('✅ Per-piece products (Electronics) loaded:', response.data.products.length);
        }
      } catch (error) {
        console.error("Failed to fetch per-piece products:", error);
      }
    };

    fetchPrices();
    fetchRegularProducts();
    fetchPerPieceProducts();
  }, []);

  // Fetch packaging prices from API
  useEffect(() => {
    const fetchPackagingPrices = async () => {
      try {
        setLoadingPackagingPrices(true);
        const response = await apiService.getPackagingPrices();
        if (response.data.success && response.data.data) {
          setPackagingPrices(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching packaging prices:", error);
      } finally {
        setLoadingPackagingPrices(false);
      }
    };
    fetchPackagingPrices();
  }, []);

  // Validate parcels against minimum shipping weight
  useEffect(() => {
    const errors: { [key: string]: string } = {};
    let isValid = true;

    parcels.forEach((parcel) => {
      if (!parcel.productCategory) return;

      const price = prices.find(
        (p) => p.id.toString() === parcel.productCategory
      );
      if (!price) return;

      const minWeight = parseFloat(price.minimum_shipping_weight.toString());
      const parcelWeight = parcel.weight || 0;
      const parcelQuantity = parcel.quantity || 1;

      if (price.minimum_shipping_unit === "per_kg") {
        if (parcelWeight < minWeight) {
          errors[parcel.id] =
            language === "ar"
              ? `الوزن الأدنى المطلوب: ${minWeight} كغ`
              : `Minimum weight required: ${minWeight} kg`;
          isValid = false;
        }
      } else if (price.minimum_shipping_unit === "per_piece") {
        if (parcelQuantity < minWeight) {
          errors[parcel.id] =
            language === "ar"
              ? `الكمية الأدنى المطلوبة: ${minWeight} قطعة`
              : `Minimum quantity required: ${minWeight} piece(s)`;
          isValid = false;
        }
      }
    });

    setValidationErrors(errors);
    if (onValidationChange) {
      onValidationChange(isValid && parcels.length > 0);
    }
  }, [parcels, prices, language, onValidationChange]);

  const translations = {
    ar: {
      title: "تفاصيل الطرود",
      addParcel: "إضافة طرد جديد",
      addElectronics: "إضافة شحنة إلكترونيات",
      removeParcel: "حذف الطرد",
      electronicsShipment: "شحنة إلكترونيات",
      electronicsName: "اسم الجهاز/الموديل",
      electronicsPicture: "صورة الجهاز",
      required: "إجباري",
      customProduct: "منتج غير موجود في القائمة؟",
      enterCustomProduct: "أدخل اسم المنتج",
      requestProduct: "طلب إضافة منتج",
      backToSelect: "العودة للاختيار من القائمة",
      productRequested: "تم إرسال الطلب للأدمن",
      requestingProduct: "جاري الإرسال...",
      length: "الطول (سم)",
      width: "العرض (سم)",
      height: "الارتفاع (سم)",
      weight: "الوزن (كغ)",
      productCategory: "نوع المنتج",
      packagingType: "نوع التغليف",
      packagingTypeOptional: "اختياري",
      additionalPackaging: "تغليف إضافي",
      basePackagingNote: "* يتضمن تغليف أساسي 5€",
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
      insurance: "التأمين",
      insuranceCheckbox: "أريد التأمين على الشحنة",
      insuranceDesc:
        "يمكنك اختيار تأمين إضافي على قيمة الشحنة (1.5% من القيمة المعلنة + حساب الشحنة)",
      declaredValueShipment: "القيمة المعلنة للشحنة (€)",
      note: "ملاحظة: التأمين اختياري. سيتم حساب التأمين في صفحة ملخص التسعير.",
    },
    en: {
      title: "Parcel Details",
      addParcel: "Add New Parcel",
      addElectronics: "Add Electronics Shipment",
      removeParcel: "Remove Parcel",
      electronicsShipment: "Electronics Shipment",
      electronicsName: "Device Name/Model",
      electronicsPicture: "Device Picture",
      required: "Required",
      customProduct: "Product not in list?",
      enterCustomProduct: "Enter product name",
      requestProduct: "Request Admin to Add Product",
      backToSelect: "Back to Select from List",
      productRequested: "Request sent to admin",
      requestingProduct: "Sending...",
      length: "Length (cm)",
      width: "Width (cm)",
      height: "Height (cm)",
      weight: "Weight (kg)",
      productCategory: "Product Category",
      packagingType: "Packaging Type",
      packagingTypeOptional: "Optional",
      additionalPackaging: "Additional Packaging",
      basePackagingNote: "* Includes base packaging 5€",
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
      insurance: "Insurance",
      insuranceCheckbox: "I want insurance for the shipment",
      insuranceDesc:
        "You can choose additional insurance on shipment value (1.5% of declared value + calculation)",
      declaredValueShipment: "Declared Shipment Value (€)",
      note: "Note: Insurance is optional. Insurance will be calculated in the Pricing Summary page.",
    },
  };

  const t = translations[language];
  const hasElectronics = shipmentTypes.includes("electronics");
  const hasLargeItems = shipmentTypes.includes("large-items");

  // Helper function to check if product is phone or laptop
  const isPhoneOrLaptop = (productCategory: string): boolean => {
    if (!productCategory) return false;
    const selectedPrice = prices.find(
      (p) => p.id.toString() === productCategory
    );
    return !!(
      productCategory === "MOBILE_PHONE" ||
      productCategory === "LAPTOP" ||
      selectedPrice?.en_item?.toLowerCase().includes("mobile") ||
      selectedPrice?.en_item?.toLowerCase().includes("laptop") ||
      selectedPrice?.ar_item?.includes("موبايل") ||
      selectedPrice?.ar_item?.includes("لابتوب")
    );
  };

  const addElectronicsShipment = () => {
    // Find laptop and mobile prices
    const laptopPrice = prices.find(
      (p) =>
        p.en_item?.toLowerCase().includes("laptop") ||
        p.ar_item?.includes("لابتوب")
    );
    const mobilePrice = prices.find(
      (p) =>
        p.en_item?.toLowerCase().includes("mobile") ||
        p.ar_item?.includes("موبايل")
    );

    const newElectronics: Parcel = {
      id: `electronics-${Date.now()}`,
      length: 0,
      width: 0,
      height: 0,
      weight: 0,
      cbm: 0,
      productCategory: laptopPrice ? laptopPrice.id.toString() : "", // Default to laptop if available
      quantity: 1,
      repeatCount: 1,
      photos: [],
      isElectronicsShipment: true,
      electronicsName: "",
      electronicsPicture: undefined,
      wantsInsurance: true, // Force insurance
      declaredShipmentValue: 0,
    };
    onParcelsChange([...parcels, newElectronics]);
  };

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
      wantsInsurance: false as boolean,
      declaredShipmentValue: 0 as number,
    };
    onParcelsChange([...parcels, newParcel]);
  };

  const removeParcel = (id: string) => {
    onParcelsChange(parcels.filter((p) => p.id !== id));
  };

  const updateParcel = async (id: string, field: keyof Parcel, value: any) => {
    const updatedParcels = await Promise.all(parcels.map(async (parcel) => {
      if (parcel.id === id) {
        const updatedParcel = { ...parcel, [field]: value };

        // Automatically calculate CBM when any dimension changes
        if (field === "length" || field === "width" || field === "height") {
          const length = field === "length" ? value : parcel.length || 0;
          const width = field === "width" ? value : parcel.width || 0;
          const height = field === "height" ? value : parcel.height || 0;
          
          // Calculate CBM using Backend API only
          try {
            const response = await apiService.calculateCBM(length, width, height);
            if (response.data.success) {
              updatedParcel.cbm = response.data.cbm;
              console.log('✅ CBM calculated from Backend API:', response.data.cbm);
            } else {
              console.error('❌ Backend API returned error for CBM calculation');
              updatedParcel.cbm = 0;
            }
          } catch (error) {
            console.error('❌ Backend API failed for CBM calculation:', error);
            updatedParcel.cbm = 0;
          }
        }

        // Force enable insurance for MOBILE_PHONE and LAPTOP
        if (field === "productCategory") {
          const isPhoneOrLaptop =
            value === "MOBILE_PHONE" ||
            value === "LAPTOP" ||
            prices
              .find((p) => p.id.toString() === value)
              ?.en_item?.toLowerCase()
              .includes("mobile") ||
            prices
              .find((p) => p.id.toString() === value)
              ?.en_item?.toLowerCase()
              .includes("laptop");

          if (isPhoneOrLaptop) {
            updatedParcel.wantsInsurance = true;
            // If no declared value set, set a default or keep existing
            if (!updatedParcel.declaredShipmentValue) {
              updatedParcel.declaredShipmentValue =
                updatedParcel.declaredValue || 0;
            }
          }
        }

        return updatedParcel;
      }
      return parcel;
    }));
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
      <div className="flex justify-end gap-4">
        <motion.button
          onClick={addParcel}
          className="px-6 py-3 bg-primary-yellow text-primary-dark font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {t.addParcel}
        </motion.button>
        <motion.button
          onClick={addElectronicsShipment}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {t.addElectronics}
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
            className={`rounded-2xl p-6 shadow-lg border-2 ${
              parcel.isElectronicsShipment
                ? "bg-gradient-to-br from-blue-50 to-purple-50 border-blue-300"
                : "bg-white border-gray-100"
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-xl font-bold text-primary-dark">
                  {parcel.isElectronicsShipment
                    ? t.electronicsShipment + ` #${index + 1}`
                    : language === "ar"
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
              {/* Dimensions - Hidden for Electronics Shipment */}
              {!parcel.isElectronicsShipment && (
                <>
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
                </>
              )}

              {/* Product Category */}
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    {t.productCategory} *
                  </label>
                  {!parcel.isElectronicsShipment && (
                    <button
                      type="button"
                      onClick={() => {
                        const newMode = !customProductMode[parcel.id];
                        setCustomProductMode({
                          ...customProductMode,
                          [parcel.id]: newMode,
                        });

                        if (newMode) {
                          // Switching to custom mode
                          const updatedParcels = parcels.map((p) =>
                            p.id === parcel.id
                              ? {
                                  ...p,
                                  isCustomProduct: true,
                                  productCategory: "",
                                  customProductName: "",
                                }
                              : p
                          );
                          onParcelsChange(updatedParcels);
                        } else {
                          // Switching back to select mode
                          const updatedParcels = parcels.map((p) =>
                            p.id === parcel.id
                              ? {
                                  ...p,
                                  isCustomProduct: false,
                                  customProductName: "",
                                }
                              : p
                          );
                          onParcelsChange(updatedParcels);
                        }
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline"
                    >
                      {customProductMode[parcel.id]
                        ? t.backToSelect
                        : t.customProduct}
                    </button>
                  )}
                </div>

                {customProductMode[parcel.id] ? (
                  // Custom Product Text Input
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={parcel.customProductName || ""}
                      onChange={(e) => {
                        updateParcel(
                          parcel.id,
                          "customProductName",
                          e.target.value
                        );
                      }}
                      placeholder={
                        language === "ar"
                          ? "أدخل اسم المنتج (مثال: أدوات طبية متخصصة)"
                          : "Enter product name (e.g., Specialized Medical Equipment)"
                      }
                      autoFocus
                      className="w-full px-4 py-3 rounded-xl border-2 border-orange-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                    />
                    {parcel.customProductName && (
                      <button
                        type="button"
                        onClick={async () => {
                          if (!parcel.customProductName) return;

                          setRequestingProduct({
                            ...requestingProduct,
                            [parcel.id]: true,
                          });

                          try {
                            const response = await apiService.requestNewProduct(
                              {
                                productName: parcel.customProductName,
                                language: language,
                              }
                            );

                            if (response.data.success) {
                              // Show success message
                              alert(
                                language === "ar"
                                  ? `تم إرسال طلبك بنجاح!\n\nسيقوم الأدمن بمراجعة طلبك وإضافة المنتج "${parcel.customProductName}" مع السعر.\n\nسنقوم بإرسال بريد إلكتروني لك عند إضافة المنتج.\n\nشكراً لك!`
                                  : `Request sent successfully!\n\nThe admin will review your request and add the product "${parcel.customProductName}" with pricing.\n\nWe will send you an email when the product is added.\n\nThank you!`
                              );

                              // Remove this parcel card
                              const updatedParcels = parcels.filter(
                                (p) => p.id !== parcel.id
                              );
                              onParcelsChange(updatedParcels);
                            }
                          } catch (error) {
                            console.error("Error requesting product:", error);
                            alert(
                              language === "ar"
                                ? "حدث خطأ في إرسال الطلب. الرجاء المحاولة مرة أخرى."
                                : "Error sending request. Please try again."
                            );
                          } finally {
                            setRequestingProduct({
                              ...requestingProduct,
                              [parcel.id]: false,
                            });
                          }
                        }}
                        disabled={
                          requestingProduct[parcel.id] ||
                          productRequested[parcel.id]
                        }
                        className="w-full px-4 py-3 rounded-xl font-semibold transition-all bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {requestingProduct[parcel.id]
                          ? t.requestingProduct
                          : t.requestProduct}
                      </button>
                    )}
                    <p className="text-xs text-gray-600">
                      {language === "ar"
                        ? "سيتم إرسال طلبك للأدمن وسنرسل لك بريد إلكتروني عند إضافة المنتج"
                        : "Your request will be sent to admin and we will email you when the product is added"}
                    </p>
                  </div>
                ) : (
                  // Regular Select Dropdown
                  <select
                    value={parcel.productCategory}
                    onChange={(e) =>
                      updateParcel(parcel.id, "productCategory", e.target.value)
                    }
                    disabled={loadingPrices}
                    className={`w-full px-4 py-3 rounded-xl border-2 ${
                      validationErrors[parcel.id]
                        ? "border-red-500"
                        : "border-gray-300"
                    } focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow bg-white disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <option value="">
                      {loadingPrices
                        ? language === "ar"
                          ? "جاري التحميل..."
                          : "Loading..."
                        : language === "ar"
                        ? "اختر..."
                        : "Select..."}
                    </option>
                    {parcel.isElectronicsShipment
                      ? // For electronics shipments, use per-piece products only
                        perPieceProducts.map((product) => (
                          <option
                            key={product.id}
                            value={product.id.toString()}
                          >
                            {language === "ar"
                              ? product.ar_item
                              : product.en_item}
                          </option>
                        ))
                      : // For regular parcels, use regular products only (per_kg)
                        regularProducts.map((price) => (
                          <option key={price.id} value={price.id.toString()}>
                            {language === "ar" ? price.ar_item : price.en_item}
                          </option>
                        ))}
                  </select>
                )}
                {validationErrors[parcel.id] && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors[parcel.id]}
                  </p>
                )}
                {parcel.productCategory &&
                  !validationErrors[parcel.id] &&
                  (() => {
                    const selectedPrice = prices.find(
                      (p) => p.id.toString() === parcel.productCategory
                    );
                    if (selectedPrice) {
                      const minWeight = parseFloat(
                        selectedPrice.minimum_shipping_weight.toString()
                      );
                      const unit =
                        selectedPrice.minimum_shipping_unit === "per_kg"
                          ? language === "ar"
                            ? "كغ"
                            : "kg"
                          : language === "ar"
                          ? "قطعة"
                          : "piece(s)";
                      return (
                        <p className="mt-1 text-xs text-gray-500">
                          {language === "ar"
                            ? `الوزن/الكمية الأدنى: ${minWeight} ${unit}`
                            : `Minimum: ${minWeight} ${unit}`}
                        </p>
                      );
                    }
                    return null;
                  })()}
              </div>

              {/* Electronics Specific Fields */}
              {parcel.isElectronicsShipment && (
                <>
                  {/* Electronics Name */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.electronicsName} *{" "}
                      <span className="text-blue-600 text-xs">
                        ({t.required})
                      </span>
                    </label>
                    <input
                      type="text"
                      value={parcel.electronicsName || ""}
                      onChange={(e) =>
                        updateParcel(
                          parcel.id,
                          "electronicsName",
                          e.target.value
                        )
                      }
                      placeholder={
                        language === "ar"
                          ? "مثال: iPhone 14 Pro - 256GB - أزرق"
                          : "e.g., iPhone 14 Pro - 256GB - Blue"
                      }
                      className="w-full px-4 py-3 rounded-xl border-2 border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                  </div>

                  {/* Electronics Picture */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.electronicsPicture} *{" "}
                      <span className="text-blue-600 text-xs">
                        ({t.required})
                      </span>
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="flex-1 cursor-pointer">
                        <div className="px-6 py-4 border-2 border-dashed border-blue-300 rounded-xl hover:border-blue-500 transition-colors bg-blue-50/50 hover:bg-blue-100/50 flex items-center justify-center gap-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-blue-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="text-blue-700 font-semibold">
                            {parcel.electronicsPicture
                              ? language === "ar"
                                ? "تم اختيار الصورة ✓"
                                : "Picture selected ✓"
                              : language === "ar"
                              ? "اختر صورة للجهاز"
                              : "Choose device picture"}
                          </span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              updateParcel(
                                parcel.id,
                                "electronicsPicture",
                                file
                              );
                            }
                          }}
                        />
                      </label>
                      {parcel.electronicsPicture && (
                        <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-blue-300 shadow-md">
                          <img
                            src={URL.createObjectURL(parcel.electronicsPicture)}
                            alt="Electronics"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {language === "ar"
                        ? "يرجى رفع صورة واضحة للجهاز"
                        : "Please upload a clear picture of the device"}
                    </p>
                  </div>
                </>
              )}

              {/* Base Packaging Note for Electronics */}
              {parcel.isElectronicsShipment && (
                <div className="md:col-span-2 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                    <span className="text-sm font-semibold text-blue-900">
                      {t.basePackagingNote}
                    </span>
                  </div>
                </div>
              )}

              {/* Packaging Type - Hidden for Electronics Shipment */}
              {!parcel.isElectronicsShipment && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.packagingType}{" "}
                    <span className="text-gray-400 text-xs">
                      ({t.packagingTypeOptional})
                    </span>
                  </label>
                  <select
                    value={parcel.packagingType || ""}
                    onChange={(e) =>
                      updateParcel(
                        parcel.id,
                        "packagingType",
                        e.target.value || undefined
                      )
                    }
                    disabled={loadingPackagingPrices}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {loadingPackagingPrices
                        ? language === "ar"
                          ? "جاري التحميل..."
                          : "Loading..."
                        : language === "ar"
                        ? "بدون تغليف"
                        : "No Packaging"}
                    </option>
                    {packagingPrices.map((packaging) => (
                      <option
                        key={packaging.id}
                        value={packaging.id.toString()}
                      >
                        {language === "ar"
                          ? packaging.ar_option
                          : packaging.en_option}{" "}
                        ({packaging.dimension}) - €{packaging.price}
                      </option>
                    ))}
                  </select>
                  {parcel.packagingType &&
                    (() => {
                      const selectedPackaging = packagingPrices.find(
                        (p) => p.id.toString() === parcel.packagingType
                      );
                      if (selectedPackaging) {
                        return (
                          <p className="mt-1 text-xs text-gray-500">
                            {language === "ar"
                              ? `السعر: €${selectedPackaging.price}`
                              : `Price: €${selectedPackaging.price}`}
                          </p>
                        );
                      }
                      return null;
                    })()}
                </div>
              )}

              {/* Quantity - Hidden for Electronics Shipment */}
              {!parcel.isElectronicsShipment && (
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
              )}

              {/* Photos - Hidden for Electronics Shipment */}
              {!parcel.isElectronicsShipment && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.photos} * ({t.photosRequired})
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) =>
                      handlePhotoUpload(parcel.id, e.target.files)
                    }
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                  />
                  {parcel.photos && parcel.photos.length > 0 && (
                    <p className="mt-2 text-sm text-gray-600">
                      {parcel.photos.length}{" "}
                      {language === "ar" ? "صورة محملة" : "photos uploaded"}
                    </p>
                  )}
                </div>
              )}

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

              {/* Insurance Section - Inside Parcel Card */}
              <div className="md:col-span-2 mt-4 pt-4 border-t border-gray-200">
                <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-bold text-primary-dark">
                        {t.insurance}
                      </h4>
                      {(isPhoneOrLaptop(parcel.productCategory) ||
                        parcel.isElectronicsShipment) && (
                        <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                          {language === "ar" ? "إلزامي" : "Required"}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">{t.insuranceDesc}</p>
                  </div>

                  <div className="space-y-3">
                    {/* Checkbox */}
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id={`insurance-checkbox-${parcel.id}`}
                        checked={parcel.wantsInsurance || false}
                        disabled={
                          isPhoneOrLaptop(parcel.productCategory) ||
                          parcel.isElectronicsShipment
                        }
                        onChange={(e) => {
                          updateParcel(
                            parcel.id,
                            "wantsInsurance",
                            e.target.checked
                          );
                          if (!e.target.checked) {
                            updateParcel(parcel.id, "declaredShipmentValue", 0);
                          }
                        }}
                        className="w-5 h-5 text-primary-yellow border-gray-300 rounded focus:ring-2 focus:ring-primary-yellow focus:ring-offset-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <label
                        htmlFor={`insurance-checkbox-${parcel.id}`}
                        className="text-sm font-semibold text-gray-700 cursor-pointer"
                      >
                        {t.insuranceCheckbox}
                      </label>
                    </div>

                    {/* Declared Shipment Value Field - Only shown when checkbox is checked or required */}
                    {(parcel.wantsInsurance ||
                      isPhoneOrLaptop(parcel.productCategory) ||
                      parcel.isElectronicsShipment) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                      >
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t.declaredValueShipment} *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={parcel.declaredShipmentValue || ""}
                          onChange={(e) =>
                            updateParcel(
                              parcel.id,
                              "declaredShipmentValue",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                          placeholder={
                            language === "ar"
                              ? "أدخل القيمة..."
                              : "Enter value..."
                          }
                        />
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
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
