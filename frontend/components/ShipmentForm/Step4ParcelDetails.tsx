"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Parcel } from "@/types/shipment";
import { apiService } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import {
  validateNumber,
  validateWeight,
  validateDimension,
  handleNumericInput,
  formatNumericInput,
} from "@/utils/validation";

interface Price {
  id: number;
  ar_item: string;
  en_item: string;
  price_per_kg: number;
  minimum_shipping_weight: number;
  minimum_shipping_unit: "per_kg" | "per_piece";
  minimum_shipping_unit_display: string;
  one_cbm: number;
  hs_code?: string;
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
  parcels,
  onParcelsChange,
  language,
  onValidationChange,
}: Step4ParcelDetailsProps) {
  const { showSuccess, showError } = useToast();
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
  const [fieldErrors, setFieldErrors] = useState<{
    [parcelId: string]: {
      length?: string;
      width?: string;
      height?: string;
      weight?: string;
    };
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
          console.log(
            "✅ Regular products loaded:",
            response.data.products.length
          );
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
          console.log(
            "✅ Per-piece products (Electronics) loaded:",
            response.data.products.length
          );
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

  // Validate parcels - comprehensive validation for all required fields
  useEffect(() => {
    const errors: { [key: string]: string } = {};
    let isValid = true;

    parcels.forEach((parcel) => {
      const parcelErrors: string[] = [];

      // For Electronics Shipment
      if (parcel.isElectronicsShipment) {
        // Electronics Name is required
        if (!parcel.electronicsName?.trim()) {
          parcelErrors.push(
            language === "ar"
              ? "اسم الجهاز/الموديل مطلوب"
              : "Device name/model is required"
          );
        }

        // Electronics Picture is required
        if (!parcel.electronicsPicture) {
          parcelErrors.push(
            language === "ar"
              ? "صورة الجهاز مطلوبة"
              : "Device picture is required"
          );
        }

        // Product Category is required
        if (!parcel.productCategory) {
          parcelErrors.push(
            language === "ar"
              ? "نوع المنتج مطلوب"
              : "Product category is required"
          );
        }
      } else {
        // For Regular Parcel
        // Dimensions are required
        if (!parcel.length || parcel.length <= 0) {
          parcelErrors.push(
            language === "ar"
              ? "الطول مطلوب (يجب أن يكون أكبر من 0)"
              : "Length is required (must be greater than 0)"
          );
        }
        if (!parcel.width || parcel.width <= 0) {
          parcelErrors.push(
            language === "ar"
              ? "العرض مطلوب (يجب أن يكون أكبر من 0)"
              : "Width is required (must be greater than 0)"
          );
        }
        if (!parcel.height || parcel.height <= 0) {
          parcelErrors.push(
            language === "ar"
              ? "الارتفاع مطلوب (يجب أن يكون أكبر من 0)"
              : "Height is required (must be greater than 0)"
          );
        }

        // Weight is required
        if (!parcel.weight || parcel.weight <= 0) {
          parcelErrors.push(
            language === "ar"
              ? "الوزن مطلوب (يجب أن يكون أكبر من 0)"
              : "Weight is required (must be greater than 0)"
          );
        }

        // Product Category is required
        if (!parcel.productCategory && !parcel.isCustomProduct) {
          parcelErrors.push(
            language === "ar"
              ? "نوع المنتج مطلوب"
              : "Product category is required"
          );
        }

        // Custom Product Name is required if custom product mode
        if (parcel.isCustomProduct && !parcel.customProductName?.trim()) {
          parcelErrors.push(
            language === "ar"
              ? "اسم المنتج المخصص مطلوب"
              : "Custom product name is required"
          );
        }

        // Quantity is required
        if (!parcel.quantity || parcel.quantity < 1) {
          parcelErrors.push(
            language === "ar"
              ? "الكمية مطلوبة (يجب أن تكون 1 على الأقل)"
              : "Quantity is required (must be at least 1)"
          );
        }

        // Photos are required (3 photos)
        if (!parcel.photos || parcel.photos.length < 3) {
          parcelErrors.push(
            language === "ar" ? "3 صور مطلوبة" : "3 photos are required"
          );
        }
      }

      // Validate against minimum shipping weight if product category is selected
      if (parcel.productCategory && !parcel.isCustomProduct) {
        const price = prices.find(
          (p) => p.id.toString() === parcel.productCategory
        );
        if (price) {
          const minWeight = parseFloat(
            price.minimum_shipping_weight.toString()
          );
          const parcelWeight = parcel.weight || 0;
          const parcelQuantity = parcel.quantity || 1;

          if (price.minimum_shipping_unit === "per_kg") {
            if (parcelWeight < minWeight) {
              parcelErrors.push(
                language === "ar"
                  ? `الوزن الأدنى المطلوب: ${minWeight} كغ`
                  : `Minimum weight required: ${minWeight} kg`
              );
            }
          } else if (price.minimum_shipping_unit === "per_piece") {
            if (parcelQuantity < minWeight) {
              parcelErrors.push(
                language === "ar"
                  ? `الكمية الأدنى المطلوبة: ${minWeight} قطعة`
                  : `Minimum quantity required: ${minWeight} piece(s)`
              );
            }
          }
        }
      }

      if (parcelErrors.length > 0) {
        errors[parcel.id] = parcelErrors.join(", ");
        isValid = false;
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
      hsCode: "رمز HS (HS Code)",
      shipmentType: "نوع الشحن",
      personal: "شخصي",
      commercial: "تجاري",
      packagingType: "نوع التغليف",
      packagingTypeOptional: "اختياري",
      additionalPackaging: "تغليف إضافي",
      basePackagingNote: "* يتضمن تغليف أساسي 5€",
      quantity: "الكمية",
      repeatCount: "عدد التكرار",
      repeatCountHint: "كم مرة تريد تكرار هذا الطرد؟",
      photos: "صور الطرد",
      photosRequired: "مطلوب: 3 صور",
      cbm: "الحجم (CBM)",
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
      hsCode: "HS Code",
      shipmentType: "Shipment Type",
      personal: "Personal",
      commercial: "Commercial",
      packagingType: "Packaging Type",
      packagingTypeOptional: "Optional",
      additionalPackaging: "Additional Packaging",
      basePackagingNote: "* Includes base packaging 5€",
      quantity: "Quantity",
      repeatCount: "Repeat Count",
      repeatCountHint: "How many times to repeat this parcel?",
      photos: "Parcel Photos",
      photosRequired: "Required: 3 photos",
      cbm: "Volume (CBM)",
      insurance: "Insurance",
      insuranceCheckbox: "I want insurance for the shipment",
      insuranceDesc:
        "You can choose additional insurance on shipment value (1.5% of declared value + calculation)",
      declaredValueShipment: "Declared Shipment Value (€)",
      note: "Note: Insurance is optional. Insurance will be calculated in the Pricing Summary page.",
    },
  };

  const t = translations[language];

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
      shipmentType: "personal",
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
      shipmentType: "personal",
    };
    onParcelsChange([...parcels, newParcel]);
  };

  const removeParcel = (id: string) => {
    onParcelsChange(parcels.filter((p) => p.id !== id));
  };

  // Validate parcel field
  const validateParcelField = (
    parcelId: string,
    field: "length" | "width" | "height" | "weight",
    value: number | string
  ): string | null => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    const fieldName =
      field === "length"
        ? language === "ar"
          ? "الطول"
          : "Length"
        : field === "width"
        ? language === "ar"
          ? "العرض"
          : "Width"
        : field === "height"
        ? language === "ar"
          ? "الارتفاع"
          : "Height"
        : language === "ar"
        ? "الوزن"
        : "Weight";

    if (field === "weight") {
      return validateWeight(numValue);
    } else {
      return validateDimension(numValue, fieldName);
    }
  };

  const updateParcel = async (id: string, field: keyof Parcel, value: any) => {
    // Format numeric fields
    let formattedValue = value;
    if (
      (field === "length" ||
        field === "width" ||
        field === "height" ||
        field === "weight") &&
      typeof value === "string"
    ) {
      formattedValue = parseFloat(formatNumericInput(value)) || 0;
    }

    const updatedParcels = await Promise.all(
      parcels.map(async (parcel) => {
        if (parcel.id === id) {
          const updatedParcel = { ...parcel, [field]: formattedValue };

          // Clear field error when user starts typing
          if (
            (field === "length" ||
              field === "width" ||
              field === "height" ||
              field === "weight") &&
            fieldErrors[id]?.[field]
          ) {
            setFieldErrors({
              ...fieldErrors,
              [id]: {
                ...fieldErrors[id],
                [field]: undefined,
              },
            });
          }

          // Automatically calculate CBM when any dimension changes
          if (field === "length" || field === "width" || field === "height") {
            const length = field === "length" ? value : parcel.length || 0;
            const width = field === "width" ? value : parcel.width || 0;
            const height = field === "height" ? value : parcel.height || 0;

            // Calculate CBM using Backend API only
            try {
              const response = await apiService.calculateCBM(
                length,
                width,
                height
              );
              if (response.data.success) {
                updatedParcel.cbm = response.data.cbm;
                console.log(
                  "✅ CBM calculated from Backend API:",
                  response.data.cbm
                );
              } else {
                console.error(
                  "❌ Backend API returned error for CBM calculation"
                );
                updatedParcel.cbm = 0;
              }
            } catch (error) {
              console.error(
                "❌ Backend API failed for CBM calculation:",
                error
              );
              updatedParcel.cbm = 0;
            }
          }

          // Force enable insurance for MOBILE_PHONE and LAPTOP
          // Also auto-fill HS Code when product is selected
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

            // Auto-fill HS Code from selected product
            if (value) {
              const selectedProduct =
                prices.find((p) => p.id.toString() === value) ||
                regularProducts.find((p) => p.id.toString() === value) ||
                perPieceProducts.find((p) => p.id.toString() === value);

              if (selectedProduct && selectedProduct.hs_code) {
                updatedParcel.hs_code = selectedProduct.hs_code;
              } else {
                // Clear HS Code if product doesn't have one
                updatedParcel.hs_code = undefined;
              }
            } else {
              // Clear HS Code if no product selected
              updatedParcel.hs_code = undefined;
            }
          }

          return updatedParcel;
        }
        return parcel;
      })
    );
    onParcelsChange(updatedParcels);
  };

  const handlePhotoUpload = (id: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const updatedParcels = parcels.map((parcel) => {
      if (parcel.id === id) {
        return { ...parcel, photos: Array.from(files) };
      }
      return parcel;
    });
    onParcelsChange(updatedParcels);
  };

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
                      type="text"
                      inputMode="decimal"
                      value={parcel.length || ""}
                      onChange={(e) => {
                        const formatted = formatNumericInput(e.target.value);
                        updateParcel(parcel.id, "length", formatted);
                      }}
                      onBlur={() => {
                        const error = validateParcelField(
                          parcel.id,
                          "length",
                          parcel.length || 0
                        );
                        setFieldErrors({
                          ...fieldErrors,
                          [parcel.id]: {
                            ...fieldErrors[parcel.id],
                            length: error || undefined,
                          },
                        });
                      }}
                      onKeyDown={handleNumericInput}
                      placeholder={
                        language === "ar" ? "مثال: 30.5" : "e.g., 30.5"
                      }
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-primary-yellow ${
                        fieldErrors[parcel.id]?.length ||
                        (validationErrors[parcel.id] && !parcel.length)
                          ? "border-red-500 focus:border-red-500"
                          : "border-gray-300 focus:border-primary-yellow"
                      }`}
                    />
                    {fieldErrors[parcel.id]?.length && (
                      <p className="mt-1 text-sm text-red-600">
                        {fieldErrors[parcel.id].length}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.width} *
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={parcel.width || ""}
                      onChange={(e) => {
                        const formatted = formatNumericInput(e.target.value);
                        updateParcel(parcel.id, "width", formatted);
                      }}
                      onBlur={() => {
                        const error = validateParcelField(
                          parcel.id,
                          "width",
                          parcel.width || 0
                        );
                        setFieldErrors({
                          ...fieldErrors,
                          [parcel.id]: {
                            ...fieldErrors[parcel.id],
                            width: error || undefined,
                          },
                        });
                      }}
                      onKeyDown={handleNumericInput}
                      placeholder={
                        language === "ar" ? "مثال: 25.0" : "e.g., 25.0"
                      }
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-primary-yellow ${
                        fieldErrors[parcel.id]?.width ||
                        (validationErrors[parcel.id] && !parcel.width)
                          ? "border-red-500 focus:border-red-500"
                          : "border-gray-300 focus:border-primary-yellow"
                      }`}
                    />
                    {fieldErrors[parcel.id]?.width && (
                      <p className="mt-1 text-sm text-red-600">
                        {fieldErrors[parcel.id].width}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.height} *
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={parcel.height || ""}
                      onChange={(e) => {
                        const formatted = formatNumericInput(e.target.value);
                        updateParcel(parcel.id, "height", formatted);
                      }}
                      onBlur={() => {
                        const error = validateParcelField(
                          parcel.id,
                          "height",
                          parcel.height || 0
                        );
                        setFieldErrors({
                          ...fieldErrors,
                          [parcel.id]: {
                            ...fieldErrors[parcel.id],
                            height: error || undefined,
                          },
                        });
                      }}
                      onKeyDown={handleNumericInput}
                      placeholder={
                        language === "ar" ? "مثال: 15.2" : "e.g., 15.2"
                      }
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-primary-yellow ${
                        fieldErrors[parcel.id]?.height ||
                        (validationErrors[parcel.id] && !parcel.height)
                          ? "border-red-500 focus:border-red-500"
                          : "border-gray-300 focus:border-primary-yellow"
                      }`}
                    />
                    {fieldErrors[parcel.id]?.height && (
                      <p className="mt-1 text-sm text-red-600">
                        {fieldErrors[parcel.id].height}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.weight} *
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={parcel.weight || ""}
                      onChange={(e) => {
                        const formatted = formatNumericInput(e.target.value);
                        updateParcel(parcel.id, "weight", formatted);
                      }}
                      onBlur={() => {
                        const error = validateParcelField(
                          parcel.id,
                          "weight",
                          parcel.weight || 0
                        );
                        setFieldErrors({
                          ...fieldErrors,
                          [parcel.id]: {
                            ...fieldErrors[parcel.id],
                            weight: error || undefined,
                          },
                        });
                      }}
                      onKeyDown={handleNumericInput}
                      placeholder={
                        language === "ar" ? "مثال: 2.5" : "e.g., 2.5"
                      }
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-primary-yellow ${
                        fieldErrors[parcel.id]?.weight ||
                        (validationErrors[parcel.id] && !parcel.weight)
                          ? "border-red-500 focus:border-red-500"
                          : "border-gray-300 focus:border-primary-yellow"
                      }`}
                    />
                    {fieldErrors[parcel.id]?.weight && (
                      <p className="mt-1 text-sm text-red-600">
                        {fieldErrors[parcel.id].weight}
                      </p>
                    )}
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
                              showSuccess(
                                language === "ar"
                                  ? `تم إرسال طلبك بنجاح! سيقوم الأدمن بمراجعة طلبك وإضافة المنتج "${parcel.customProductName}" مع السعر. سنقوم بإرسال بريد إلكتروني لك عند إضافة المنتج. شكراً لك!`
                                  : `Request sent successfully! The admin will review your request and add the product "${parcel.customProductName}" with pricing. We will send you an email when the product is added. Thank you!`
                              );

                              // Remove this parcel card
                              const updatedParcels = parcels.filter(
                                (p) => p.id !== parcel.id
                              );
                              onParcelsChange(updatedParcels);
                            }
                          } catch (error) {
                            console.error("Error requesting product:", error);
                            showError(
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

              {/* HS Code */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.hsCode}
                </label>
                <input
                  type="text"
                  value={parcel.hs_code || ""}
                  onChange={(e) =>
                    updateParcel(
                      parcel.id,
                      "hs_code",
                      e.target.value || undefined
                    )
                  }
                  placeholder={
                    language === "ar" ? "مثال: 85171200" : "e.g., 85171200"
                  }
                  maxLength={20}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {language === "ar"
                    ? "رمز HS للجمارك (يتم ملؤه تلقائياً عند اختيار المنتج)"
                    : "HS Code for customs (auto-filled when product is selected)"}
                </p>
              </div>

              {/* Shipment Type */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.shipmentType} *
                </label>
                <select
                  value={parcel.shipmentType || "personal"}
                  onChange={(e) =>
                    updateParcel(
                      parcel.id,
                      "shipmentType",
                      e.target.value as "personal" | "commercial"
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow bg-white"
                  required
                >
                  <option value="personal">{t.personal}</option>
                  <option value="commercial">{t.commercial}</option>
                </select>
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
                      className={`w-full px-4 py-3 rounded-xl border-2 ${
                        validationErrors[parcel.id] &&
                        !parcel.electronicsName?.trim()
                          ? "border-red-500"
                          : "border-blue-300"
                      } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white`}
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
                    placeholder={language === "ar" ? "مثال: 1" : "e.g., 1"}
                    className={`w-full px-4 py-3 rounded-xl border-2 ${
                      validationErrors[parcel.id] &&
                      (!parcel.quantity || parcel.quantity < 1)
                        ? "border-red-500"
                        : "border-gray-300"
                    } focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow`}
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
                          const newValue = e.target.checked;
                          // Update immediately for checkbox (synchronous)
                          const updatedParcels = parcels.map((p) => {
                            if (p.id === parcel.id) {
                              const updated = {
                                ...p,
                                wantsInsurance: newValue,
                              };
                              if (!newValue) {
                                updated.declaredShipmentValue = 0;
                              }
                              return updated;
                            }
                            return p;
                          });
                          onParcelsChange(updatedParcels);
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
