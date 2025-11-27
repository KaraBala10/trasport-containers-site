"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import apiService from "@/lib/api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface SyrianProvince {
  id: number;
  province_code: string;
  province_name_ar: string;
  province_name_en: string;
  min_price: string;
  rate_per_kg: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export default function SyriaTransportAdminPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { language, isRTL, mounted } = useLanguage();
  const router = useRouter();

  const [provinces, setProvinces] = useState<SyrianProvince[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProvince, setEditingProvince] = useState<SyrianProvince | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    province_code: "",
    province_name_ar: "",
    province_name_en: "",
    min_price: "",
    rate_per_kg: "",
    is_active: true,
    display_order: 0,
  });

  const translations = useMemo(
    () => ({
      ar: {
        title: "إدارة أسعار النقل الداخلي - سورية",
        addProvince: "إضافة محافظة جديدة",
        edit: "تعديل",
        delete: "حذف",
        save: "حفظ",
        cancel: "إلغاء",
        confirmDelete: "تأكيد الحذف",
        deleteMessage: "هل أنت متأكد من حذف هذه المحافظة؟",
        yes: "نعم",
        no: "لا",
        provinceCode: "رمز المحافظة",
        provinceNameAr: "اسم المحافظة (عربي)",
        provinceNameEn: "اسم المحافظة (انجليزي)",
        minPrice: "الحد الأدنى للسعر (€)",
        ratePerKg: "السعر بالكيلو (€/kg)",
        isActive: "نشط",
        displayOrder: "ترتيب العرض",
        loading: "جاري التحميل...",
        error: "حدث خطأ",
        success: "تم الحفظ بنجاح",
        deleteSuccess: "تم الحذف بنجاح",
        noData: "لا توجد محافظات",
        backToDashboard: "العودة إلى لوحة التحكم",
        formula: "المعادلة: السعر النهائي = max(الوزن × السعر بالكيلو، الحد الأدنى للسعر)",
        active: "نشط",
        inactive: "غير نشط",
        provincesList: "قائمة المحافظات",
      },
      en: {
        title: "Syrian Internal Transport Pricing Management",
        addProvince: "Add New Province",
        edit: "Edit",
        delete: "Delete",
        save: "Save",
        cancel: "Cancel",
        confirmDelete: "Confirm Delete",
        deleteMessage: "Are you sure you want to delete this province?",
        yes: "Yes",
        no: "No",
        provinceCode: "Province Code",
        provinceNameAr: "Province Name (Arabic)",
        provinceNameEn: "Province Name (English)",
        minPrice: "Minimum Price (€)",
        ratePerKg: "Rate per KG (€/kg)",
        isActive: "Active",
        displayOrder: "Display Order",
        loading: "Loading...",
        error: "An error occurred",
        success: "Saved successfully",
        deleteSuccess: "Deleted successfully",
        noData: "No provinces available",
        backToDashboard: "Back to Dashboard",
        formula: "Formula: final_price = max(weight × rate_per_kg, min_price)",
        active: "Active",
        inactive: "Inactive",
        provincesList: "Provinces List",
      },
    }),
    []
  );

  const t = translations[language as "ar" | "en"];

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !user?.is_superuser)) {
      router.push("/");
    }
  }, [isAuthenticated, user, authLoading, router]);

  // Fetch provinces
  const fetchProvinces = async () => {
    try {
      setLoading(true);
      const response = await apiService.adminGetAllSyrianProvinces();
      if (response.data.success) {
        setProvinces(response.data.provinces);
      }
    } catch (error) {
      console.error("Error fetching provinces:", error);
      setError(t.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.is_superuser && mounted) {
      fetchProvinces();
    }
  }, [isAuthenticated, user, mounted]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (editingProvince) {
        // Update existing province
        await apiService.adminUpdateSyrianProvince(editingProvince.id, {
          ...formData,
          min_price: parseFloat(formData.min_price),
          rate_per_kg: parseFloat(formData.rate_per_kg),
        });
      } else {
        // Create new province
        await apiService.adminCreateSyrianProvince({
          ...formData,
          min_price: parseFloat(formData.min_price),
          rate_per_kg: parseFloat(formData.rate_per_kg),
        });
      }

      // Reset form and refresh
      setShowForm(false);
      setEditingProvince(null);
      setFormData({
        province_code: "",
        province_name_ar: "",
        province_name_en: "",
        min_price: "",
        rate_per_kg: "",
        is_active: true,
        display_order: 0,
      });
      await fetchProvinces();
    } catch (error: any) {
      console.error("Error saving province:", error);
      setError(error.response?.data?.error || t.error);
    } finally {
      setSaving(false);
    }
  };

  // Handle edit
  const handleEdit = (province: SyrianProvince) => {
    setEditingProvince(province);
    setFormData({
      province_code: province.province_code,
      province_name_ar: province.province_name_ar,
      province_name_en: province.province_name_en,
      min_price: province.min_price,
      rate_per_kg: province.rate_per_kg,
      is_active: province.is_active,
      display_order: province.display_order,
    });
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    try {
      await apiService.adminDeleteSyrianProvince(id);
      setDeleteConfirm(null);
      await fetchProvinces();
    } catch (error) {
      console.error("Error deleting province:", error);
      setError(t.error);
    }
  };

  // Cancel form
  const handleCancel = () => {
    setShowForm(false);
    setEditingProvince(null);
    setFormData({
      province_code: "",
      province_name_ar: "",
      province_name_en: "",
      min_price: "",
      rate_per_kg: "",
      is_active: true,
      display_order: 0,
    });
    setError("");
  };

  if (authLoading || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">{t.loading}</div>
      </div>
    );
  }

  if (!isAuthenticated || !user?.is_superuser) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100" dir={isRTL ? "rtl" : "ltr"}>
      <Header />

      <main className="flex-grow container mx-auto px-4 pt-24 pb-12 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-primary-dark hover:text-primary-yellow mb-6 font-semibold transition-colors group"
          >
            <svg
              className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isRTL ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
              />
            </svg>
            {t.backToDashboard}
          </Link>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-2 h-12 bg-gradient-to-b from-primary-yellow to-primary-dark rounded-full"></div>
            <div>
              <h1 className="text-4xl font-bold text-primary-dark">{t.title}</h1>
              <p className="text-gray-600 mt-2 text-sm bg-yellow-50 inline-block px-4 py-2 rounded-lg border border-primary-yellow">
                💡 {t.formula}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Button */}
        {!showForm && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowForm(true)}
            className="mb-6 bg-gradient-to-r from-primary-yellow to-yellow-500 text-white px-8 py-3 rounded-xl hover:shadow-xl transition-all duration-300 font-bold flex items-center gap-2 group"
          >
            <svg
              className="w-5 h-5 transform group-hover:rotate-90 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            {t.addProvince}
          </motion.button>
        )}

        {/* Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-2xl shadow-xl p-8 mb-6 overflow-hidden border-2 border-primary-yellow"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Form Title */}
                <div className="pb-4 mb-4 border-b-2 border-gray-200">
                  <h3 className="text-2xl font-bold text-primary-dark">
                    {editingProvince ? (
                      language === 'ar' ? '✏️ تعديل المحافظة' : '✏️ Edit Province'
                    ) : (
                      language === 'ar' ? '➕ إضافة محافظة جديدة' : '➕ Add New Province'
                    )}
                  </h3>
                </div>

                {/* Province Code */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.provinceCode} *
                  </label>
                  <input
                    type="text"
                    value={formData.province_code}
                    onChange={(e) =>
                      setFormData({ ...formData, province_code: e.target.value.toUpperCase() })
                    }
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow transition-all"
                    placeholder="DAMASCUS"
                  />
                </div>

                {/* Province Names */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.provinceNameAr} *
                    </label>
                    <input
                      type="text"
                      value={formData.province_name_ar}
                      onChange={(e) =>
                        setFormData({ ...formData, province_name_ar: e.target.value })
                      }
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow transition-all"
                      placeholder="دمشق"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.provinceNameEn} *
                    </label>
                    <input
                      type="text"
                      value={formData.province_name_en}
                      onChange={(e) =>
                        setFormData({ ...formData, province_name_en: e.target.value })
                      }
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow transition-all"
                      placeholder="Damascus"
                    />
                  </div>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.minPrice} *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.min_price}
                      onChange={(e) =>
                        setFormData({ ...formData, min_price: e.target.value })
                      }
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow transition-all"
                      placeholder="10.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.ratePerKg} *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.rate_per_kg}
                      onChange={(e) =>
                        setFormData({ ...formData, rate_per_kg: e.target.value })
                      }
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow transition-all"
                      placeholder="0.07"
                    />
                  </div>
                </div>

                {/* Display Order & Active */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.displayOrder}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.display_order}
                      onChange={(e) =>
                        setFormData({ ...formData, display_order: parseInt(e.target.value) })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow transition-all"
                    />
                  </div>
                  <div className="flex items-center pt-8">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) =>
                        setFormData({ ...formData, is_active: e.target.checked })
                      }
                      className="w-5 h-5 text-primary-yellow border-gray-300 rounded focus:ring-primary-yellow"
                    />
                    <label htmlFor="is_active" className={`${isRTL ? 'mr-3' : 'ml-3'} text-sm font-semibold text-gray-700`}>
                      {t.isActive}
                    </label>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-6 mt-6 border-t-2 border-gray-200">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-gradient-to-r from-primary-yellow to-yellow-500 text-white px-6 py-3 rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold"
                  >
                    {saving ? t.loading : t.save}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-all border-2 border-gray-300 font-semibold"
                  >
                    {t.cancel}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Provinces List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-gray-200"
        >
          <div className="p-6 border-b-2 border-primary-yellow bg-gradient-to-r from-yellow-50 to-white">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-primary-yellow to-primary-dark rounded-full"></div>
              <h2 className="text-2xl font-bold text-primary-dark">{t.provincesList}</h2>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-600">{t.loading}</div>
          ) : provinces.length === 0 ? (
            <div className="p-8 text-center text-gray-600">{t.noData}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.provinceCode}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.provinceNameAr}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.provinceNameEn}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.minPrice}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.ratePerKg}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.displayOrder}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.isActive}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.edit} / {t.delete}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {provinces.map((province) => (
                    <motion.tr
                      key={province.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {province.province_code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {province.province_name_ar}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {province.province_name_en}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        €{parseFloat(province.min_price).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        €{parseFloat(province.rate_per_kg).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {province.display_order}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            province.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {province.is_active ? t.active : t.inactive}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(province)}
                          className="text-primary-dark hover:text-primary-yellow font-semibold mr-4 transition-colors"
                        >
                          ✏️ {t.edit}
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(province.id)}
                          className="text-red-600 hover:text-red-800 font-semibold transition-colors"
                        >
                          🗑️ {t.delete}
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

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
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl border-2 border-red-200"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-red-900">{t.confirmDelete}</h3>
                </div>
                <p className="text-gray-700 mb-6 text-lg">{t.deleteMessage}</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleDelete(deleteConfirm)}
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all font-bold"
                  >
                    {t.yes}
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-all border-2 border-gray-300 font-semibold"
                  >
                    {t.no}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}

