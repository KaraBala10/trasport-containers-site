"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { apiService } from "@/lib/api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Price {
  id: number;
  ar_item: string;
  en_item: string;
  price_per_kg: number;
  minimum_shipping_weight: number;
  minimum_shipping_unit: "per_kg" | "per_piece";
  one_cbm: number;
  hs_code?: string;
  created_at: string;
  updated_at: string;
}

interface PackagingPrice {
  id: number;
  ar_option: string;
  en_option: string;
  dimension: string;
  price: number;
  created_at: string;
  updated_at: string;
}

export default function AdminPricingPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { language, isRTL, mounted } = useLanguage();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"prices" | "packaging">("prices");
  const [prices, setPrices] = useState<Price[]>([]);
  const [packagingPrices, setPackagingPrices] = useState<PackagingPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPrice, setEditingPrice] = useState<Price | null>(null);
  const [editingPackagingPrice, setEditingPackagingPrice] =
    useState<PackagingPrice | null>(null);
  const [showPriceForm, setShowPriceForm] = useState(false);
  const [showPackagingForm, setShowPackagingForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: "price" | "packaging";
    id: number;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectedUnit, setSelectedUnit] = useState<"per_kg" | "per_piece">("per_kg");

  const translations = useMemo(
    () => ({
      ar: {
        title: "إدارة الأسعار",
        pricesTab: "أسعار المنتجات",
        packagingTab: "أسعار التغليف",
        addPrice: "إضافة سعر جديد",
        addPackaging: "إضافة تغليف جديد",
        edit: "تعديل",
        delete: "حذف",
        save: "حفظ",
        cancel: "إلغاء",
        confirmDelete: "تأكيد الحذف",
        deleteMessage: "هل أنت متأكد من حذف هذا العنصر؟",
        yes: "نعم",
        no: "لا",
        arabicName: "الاسم بالعربية",
        englishName: "الاسم بالإنجليزية",
        pricePerKg: "السعر بالكيلو (€)",
        minShippingWeight: "الوزن الأدنى للشحن",
        minShippingUnit: "وحدة الوزن الأدنى",
        perKg: "بالكيلو",
        perPiece: "بالقطعة",
        oneCbm: "سعر 1 CBM (€)",
        hsCode: "رمز HS (HS Code)",
        dimension: "الأبعاد",
        price: "السعر (€)",
        loading: "جاري التحميل...",
        error: "حدث خطأ",
        success: "تم الحفظ بنجاح",
        deleteSuccess: "تم الحذف بنجاح",
        noData: "لا توجد بيانات",
        backToDashboard: "العودة إلى لوحة التحكم",
      },
      en: {
        title: "Pricing Management",
        pricesTab: "Product Prices",
        packagingTab: "Packaging Prices",
        addPrice: "Add New Price",
        addPackaging: "Add New Packaging",
        edit: "Edit",
        delete: "Delete",
        save: "Save",
        cancel: "Cancel",
        confirmDelete: "Confirm Delete",
        deleteMessage: "Are you sure you want to delete this item?",
        yes: "Yes",
        no: "No",
        arabicName: "Arabic Name",
        englishName: "English Name",
        pricePerKg: "Price Per KG (€)",
        minShippingWeight: "Minimum Shipping Weight",
        minShippingUnit: "Minimum Shipping Unit",
        perKg: "Per KG",
        perPiece: "Per Piece",
        oneCbm: "One CBM Price (€)",
        hsCode: "HS Code",
        dimension: "Dimension",
        price: "Price (€)",
        loading: "Loading...",
        error: "An error occurred",
        success: "Saved successfully",
        deleteSuccess: "Deleted successfully",
        noData: "No data available",
        backToDashboard: "Back to Dashboard",
      },
    }),
    []
  );

  const t = translations[language];

  // Check if user is admin
  const isAdmin = user?.is_superuser || false;

  useEffect(() => {
    if (!mounted || authLoading) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!isAdmin) {
      router.push("/dashboard");
      return;
    }
  }, [mounted, isAuthenticated, isAdmin, authLoading, router]);

  const fetchData = useCallback(async () => {
    if (!isAdmin) return;

    setLoading(true);
    setError("");
    try {
      if (activeTab === "prices") {
        const response = await apiService.adminGetPrices();
        // DRF ListCreateAPIView with pagination returns {count, next, previous, results: [...]}
        // Without pagination, it returns array directly
        let data = [];
        if (response.data && Array.isArray(response.data)) {
          data = response.data;
        } else if (
          response.data &&
          response.data.results &&
          Array.isArray(response.data.results)
        ) {
          data = response.data.results;
        }
        setPrices(data);
      } else {
        const response = await apiService.adminGetPackagingPrices();
        // DRF ListCreateAPIView with pagination returns {count, next, previous, results: [...]}
        // Without pagination, it returns array directly
        let data = [];
        if (response.data && Array.isArray(response.data)) {
          data = response.data;
        } else if (
          response.data &&
          response.data.results &&
          Array.isArray(response.data.results)
        ) {
          data = response.data.results;
        }
        setPackagingPrices(data);
      }
    } catch (err: any) {
      console.error("Error fetching data:", err);
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.message ||
        t.error;
      setError(errorMessage);
      // Set empty arrays on error
      if (activeTab === "prices") {
        setPrices([]);
      } else {
        setPackagingPrices([]);
      }
    } finally {
      setLoading(false);
    }
  }, [isAdmin, activeTab, t.error]);

  useEffect(() => {
    if (isAdmin && mounted) {
      fetchData();
    }
  }, [isAdmin, mounted, fetchData]);

  const handleSavePrice = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      ar_item: formData.get("ar_item") as string,
      en_item: formData.get("en_item") as string,
      price_per_kg: parseFloat(formData.get("price_per_kg") as string),
      minimum_shipping_weight: parseFloat(
        formData.get("minimum_shipping_weight") as string
      ),
      minimum_shipping_unit: formData.get("minimum_shipping_unit") as
        | "per_kg"
        | "per_piece",
      one_cbm: parseFloat(formData.get("one_cbm") as string),
      hs_code: (formData.get("hs_code") as string) || null,
    };

    try {
      if (editingPrice) {
        await apiService.adminUpdatePrice(editingPrice.id, data);
      } else {
        await apiService.adminCreatePrice(data);
      }
      setShowPriceForm(false);
      setEditingPrice(null);
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || t.error);
    } finally {
      setSaving(false);
    }
  };

  const handleSavePackagingPrice = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      ar_option: formData.get("ar_option") as string,
      en_option: formData.get("en_option") as string,
      dimension: formData.get("dimension") as string,
      price: parseFloat(formData.get("price") as string),
    };

    try {
      if (editingPackagingPrice) {
        await apiService.adminUpdatePackagingPrice(
          editingPackagingPrice.id,
          data
        );
      } else {
        await apiService.adminCreatePackagingPrice(data);
      }
      setShowPackagingForm(false);
      setEditingPackagingPrice(null);
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || t.error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    setSaving(true);
    setError("");

    try {
      if (deleteConfirm.type === "price") {
        await apiService.adminDeletePrice(deleteConfirm.id);
      } else {
        await apiService.adminDeletePackagingPrice(deleteConfirm.id);
      }
      setDeleteConfirm(null);
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || t.error);
    } finally {
      setSaving(false);
    }
  };

  const handleEditPrice = (price: Price) => {
    setEditingPrice(price);
    setSelectedUnit(price.minimum_shipping_unit);
    setShowPriceForm(true);
  };

  const handleEditPackagingPrice = (packagingPrice: PackagingPrice) => {
    setEditingPackagingPrice(packagingPrice);
    setShowPackagingForm(true);
  };

  const handleCancel = () => {
    setShowPriceForm(false);
    setShowPackagingForm(false);
    setEditingPrice(null);
    setEditingPackagingPrice(null);
    setSelectedUnit("per_kg");
    setError("");
  };

  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">{t.loading}</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50"
    >
      <Header />

      {/* Spacer for fixed header */}
      <div className="h-20" aria-hidden="true" />

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl md:text-4xl font-bold text-primary-dark">
                  {t.title}
                </h1>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 font-semibold transition-colors"
                >
                  {t.backToDashboard}
                </Link>
              </div>

              {/* Tabs */}
              <div className="flex gap-4 border-b border-gray-300">
                <button
                  onClick={() => {
                    setActiveTab("prices");
                    setError(""); // Clear error when switching tabs
                  }}
                  className={`px-6 py-3 font-semibold transition-colors ${
                    activeTab === "prices"
                      ? "border-b-2 border-primary-yellow text-primary-yellow"
                      : "text-gray-600 hover:text-primary-yellow"
                  }`}
                >
                  {t.pricesTab}
                </button>
                <button
                  onClick={() => {
                    setActiveTab("packaging");
                    setError(""); // Clear error when switching tabs
                  }}
                  className={`px-6 py-3 font-semibold transition-colors ${
                    activeTab === "packaging"
                      ? "border-b-2 border-primary-yellow text-primary-yellow"
                      : "text-gray-600 hover:text-primary-yellow"
                  }`}
                >
                  {t.packagingTab}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* Content */}
            {loading ? (
              <div className="text-center py-12 text-gray-500">{t.loading}</div>
            ) : (
              <>
                {/* Prices Tab */}
                {activeTab === "prices" && (
                  <div>
                    <div className="mb-4 flex justify-end">
                      <button
                        onClick={() => {
                          setEditingPrice(null);
                          setSelectedUnit("per_kg");
                          setShowPriceForm(true);
                        }}
                        className="px-6 py-3 bg-primary-yellow hover:bg-yellow-500 text-white font-semibold rounded-lg transition-colors"
                      >
                        {t.addPrice}
                      </button>
                    </div>

                    {/* Price Form */}
                    <AnimatePresence>
                      {showPriceForm && (
                        <motion.div
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="mb-6 bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200"
                        >
                          <h2 className="text-xl font-bold mb-4 text-primary-dark">
                            {editingPrice ? t.edit : t.addPrice}
                          </h2>
                          <form onSubmit={handleSavePrice}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  {t.arabicName} *
                                </label>
                                <input
                                  type="text"
                                  name="ar_item"
                                  defaultValue={editingPrice?.ar_item || ""}
                                  required
                                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  {t.englishName} *
                                </label>
                                <input
                                  type="text"
                                  name="en_item"
                                  defaultValue={editingPrice?.en_item || ""}
                                  required
                                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  {t.pricePerKg} *
                                </label>
                                <input
                                  type="number"
                                  step="0.01"
                                  name="price_per_kg"
                                  defaultValue={
                                    editingPrice?.price_per_kg || ""
                                  }
                                  required
                                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                                />
                                {selectedUnit === "per_piece" && (
                                  <p className="mt-2 text-sm text-orange-600 bg-orange-50 border border-orange-200 rounded-lg p-3">
                                    💡 <strong>{language === "ar" ? "للإلكترونيات:" : "For Electronics:"}</strong>{" "}
                                    {language === "ar"
                                      ? "هنا سعر القطعة الواحدة (مثلاً: 100€ للموبايل)"
                                      : "This is the price per piece (e.g., 100€ for a mobile phone)"}
                                  </p>
                                )}
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  {t.minShippingWeight} *
                                </label>
                                <input
                                  type="number"
                                  step="0.01"
                                  name="minimum_shipping_weight"
                                  defaultValue={
                                    editingPrice?.minimum_shipping_weight || ""
                                  }
                                  required
                                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                                />
                                {selectedUnit === "per_piece" && (
                                  <p className="mt-2 text-sm text-orange-600 bg-orange-50 border border-orange-200 rounded-lg p-3">
                                    💡 <strong>{language === "ar" ? "للإلكترونيات:" : "For Electronics:"}</strong>{" "}
                                    {language === "ar"
                                      ? "الحد الأدنى للكمية (مثلاً: 1 = قطعة واحدة على الأقل)"
                                      : "Minimum quantity (e.g., 1 = at least one piece)"}
                                  </p>
                                )}
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  {t.minShippingUnit} *
                                </label>
                                <select
                                  name="minimum_shipping_unit"
                                  defaultValue={
                                    editingPrice?.minimum_shipping_unit ||
                                    "per_kg"
                                  }
                                  onChange={(e) =>
                                    setSelectedUnit(e.target.value as "per_kg" | "per_piece")
                                  }
                                  required
                                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                                >
                                  <option value="per_kg">{t.perKg}</option>
                                  <option value="per_piece">
                                    {t.perPiece}
                                  </option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  {t.oneCbm}
                                </label>
                                <input
                                  type="number"
                                  step="0.01"
                                  name="one_cbm"
                                  defaultValue={editingPrice?.one_cbm || ""}
                                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                  {language === "ar"
                                    ? "⚠️ غير مستخدم في الحساب (يتم استخدام سعر الكيلو للمنتج)"
                                    : "⚠️ Not used in calculation (product price per kg is used instead)"}
                                </p>
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  {t.hsCode}
                                </label>
                                <input
                                  type="text"
                                  name="hs_code"
                                  defaultValue={editingPrice?.hs_code || ""}
                                  placeholder={language === "ar" ? "مثال: 85171200" : "e.g., 85171200"}
                                  maxLength={20}
                                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                  {language === "ar"
                                    ? "رمز HS للجمارك (اختياري)"
                                    : "HS Code for customs (optional)"}
                                </p>
                              </div>
                            </div>
                            <div className="mt-6 flex gap-4 justify-end">
                              <button
                                type="button"
                                onClick={handleCancel}
                                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
                              >
                                {t.cancel}
                              </button>
                              <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2 bg-primary-yellow hover:bg-yellow-500 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                              >
                                {saving ? t.loading : t.save}
                              </button>
                            </div>
                          </form>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Prices Table */}
                    <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                                {t.arabicName}
                              </th>
                              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                                {t.englishName}
                              </th>
                              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                                {t.pricePerKg}
                              </th>
                              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                                {t.minShippingWeight}
                              </th>
                              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                                {t.oneCbm}
                              </th>
                              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                                {t.edit}
                              </th>
                              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                                {t.delete}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {prices.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={7}
                                  className="px-4 py-8 text-center text-gray-500"
                                >
                                  {t.noData}
                                </td>
                              </tr>
                            ) : (
                              prices.map((price) => (
                                <tr
                                  key={price.id}
                                  className="border-t border-gray-200 hover:bg-gray-50"
                                >
                                  <td className="px-4 py-3 text-sm text-gray-700">
                                    {price.ar_item}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-700">
                                    {price.en_item}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-700">
                                    €{price.price_per_kg}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-700">
                                    {price.minimum_shipping_weight}{" "}
                                    {price.minimum_shipping_unit === "per_kg"
                                      ? t.perKg
                                      : t.perPiece}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-700">
                                    €{price.one_cbm}
                                  </td>
                                  <td className="px-4 py-3">
                                    <button
                                      onClick={() => handleEditPrice(price)}
                                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition-colors"
                                    >
                                      {t.edit}
                                    </button>
                                  </td>
                                  <td className="px-4 py-3">
                                    <button
                                      onClick={() =>
                                        setDeleteConfirm({
                                          type: "price",
                                          id: price.id,
                                        })
                                      }
                                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition-colors"
                                    >
                                      {t.delete}
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Packaging Prices Tab */}
                {activeTab === "packaging" && (
                  <div>
                    <div className="mb-4 flex justify-end">
                      <button
                        onClick={() => {
                          setEditingPackagingPrice(null);
                          setShowPackagingForm(true);
                        }}
                        className="px-6 py-3 bg-primary-yellow hover:bg-yellow-500 text-white font-semibold rounded-lg transition-colors"
                      >
                        {t.addPackaging}
                      </button>
                    </div>

                    {/* Packaging Form */}
                    <AnimatePresence>
                      {showPackagingForm && (
                        <motion.div
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="mb-6 bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200"
                        >
                          <h2 className="text-xl font-bold mb-4 text-primary-dark">
                            {editingPackagingPrice ? t.edit : t.addPackaging}
                          </h2>
                          <form onSubmit={handleSavePackagingPrice}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  {t.arabicName} *
                                </label>
                                <input
                                  type="text"
                                  name="ar_option"
                                  defaultValue={
                                    editingPackagingPrice?.ar_option || ""
                                  }
                                  required
                                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  {t.englishName} *
                                </label>
                                <input
                                  type="text"
                                  name="en_option"
                                  defaultValue={
                                    editingPackagingPrice?.en_option || ""
                                  }
                                  required
                                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  {t.dimension} *
                                </label>
                                <input
                                  type="text"
                                  name="dimension"
                                  defaultValue={
                                    editingPackagingPrice?.dimension || ""
                                  }
                                  required
                                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  {t.price} *
                                </label>
                                <input
                                  type="number"
                                  step="0.01"
                                  name="price"
                                  defaultValue={
                                    editingPackagingPrice?.price || ""
                                  }
                                  required
                                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                                />
                              </div>
                            </div>
                            <div className="mt-6 flex gap-4 justify-end">
                              <button
                                type="button"
                                onClick={handleCancel}
                                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
                              >
                                {t.cancel}
                              </button>
                              <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2 bg-primary-yellow hover:bg-yellow-500 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                              >
                                {saving ? t.loading : t.save}
                              </button>
                            </div>
                          </form>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Packaging Prices Table */}
                    <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                                {t.arabicName}
                              </th>
                              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                                {t.englishName}
                              </th>
                              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                                {t.dimension}
                              </th>
                              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                                {t.price}
                              </th>
                              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                                {t.edit}
                              </th>
                              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                                {t.delete}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {packagingPrices.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={6}
                                  className="px-4 py-8 text-center text-gray-500"
                                >
                                  {t.noData}
                                </td>
                              </tr>
                            ) : (
                              packagingPrices.map((packagingPrice) => (
                                <tr
                                  key={packagingPrice.id}
                                  className="border-t border-gray-200 hover:bg-gray-50"
                                >
                                  <td className="px-4 py-3 text-sm text-gray-700">
                                    {packagingPrice.ar_option}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-700">
                                    {packagingPrice.en_option}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-700">
                                    {packagingPrice.dimension}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-700">
                                    €{packagingPrice.price}
                                  </td>
                                  <td className="px-4 py-3">
                                    <button
                                      onClick={() =>
                                        handleEditPackagingPrice(packagingPrice)
                                      }
                                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition-colors"
                                    >
                                      {t.edit}
                                    </button>
                                  </td>
                                  <td className="px-4 py-3">
                                    <button
                                      onClick={() =>
                                        setDeleteConfirm({
                                          type: "packaging",
                                          id: packagingPrice.id,
                                        })
                                      }
                                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition-colors"
                                    >
                                      {t.delete}
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
            >
              <h3 className="text-xl font-bold mb-4 text-primary-dark">
                {t.confirmDelete}
              </h3>
              <p className="mb-6 text-gray-700">{t.deleteMessage}</p>
              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
                >
                  {t.no}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? t.loading : t.yes}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
