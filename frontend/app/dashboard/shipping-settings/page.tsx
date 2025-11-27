"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import apiService from "@/lib/api";

interface ShippingSettings {
  id: number;
  sendcloud_profit_margin: number;
  created_at: string;
  updated_at: string;
}

export default function ShippingSettingsAdminPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { language, isRTL, mounted } = useLanguage();
  const router = useRouter();

  const [settings, setSettings] = useState<ShippingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profitMargin, setProfitMargin] = useState<string>("");

  const translations = useMemo(
    () => ({
      ar: {
        title: "إعدادات الشحن",
        subtitle: "إدارة هوامش الربح على أسعار Sendcloud",
        profitMargin: "هامش الربح (%)",
        profitMarginHelp: "النسبة المئوية للربح المضاف على أسعار Sendcloud. مثال: 10 تعني 10%",
        currentValue: "القيمة الحالية",
        save: "حفظ",
        saving: "جاري الحفظ...",
        cancel: "إلغاء",
        loading: "جاري التحميل...",
        error: "حدث خطأ",
        success: "تم الحفظ بنجاح",
        backToDashboard: "العودة إلى لوحة التحكم",
        example: "مثال",
        exampleText: "إذا كان سعر Sendcloud €100 وهامش الربح 10%، فإن السعر النهائي سيكون €110",
        lastUpdated: "آخر تحديث",
      },
      en: {
        title: "Shipping Settings",
        subtitle: "Manage profit margins on Sendcloud prices",
        profitMargin: "Profit Margin (%)",
        profitMarginHelp: "Profit percentage added to Sendcloud prices. Example: 10 means 10%",
        currentValue: "Current Value",
        save: "Save",
        saving: "Saving...",
        cancel: "Cancel",
        loading: "Loading...",
        error: "An error occurred",
        success: "Saved successfully",
        backToDashboard: "Back to Dashboard",
        example: "Example",
        exampleText: "If Sendcloud price is €100 and profit margin is 10%, final price will be €110",
        lastUpdated: "Last Updated",
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

  // Fetch settings
  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiService.adminGetShippingSettings();
      if (response.data.success) {
        setSettings(response.data.settings);
        setProfitMargin(response.data.settings.sendcloud_profit_margin.toString());
      }
    } catch (error: any) {
      console.error("Error fetching shipping settings:", error);
      setError(error.response?.data?.error || t.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.is_superuser && mounted) {
      fetchSettings();
    }
  }, [isAuthenticated, user, mounted]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const marginValue = parseFloat(profitMargin);
      
      if (isNaN(marginValue) || marginValue < 0) {
        setError(language === "ar" ? "الرجاء إدخال قيمة صحيحة (0 أو أكثر)" : "Please enter a valid value (0 or more)");
        setSaving(false);
        return;
      }

      const response = await apiService.adminUpdateShippingSettings({
        sendcloud_profit_margin: marginValue,
      });

      if (response.data.success) {
        setSettings(response.data.settings);
        setSuccess(t.success);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error: any) {
      console.error("Error updating shipping settings:", error);
      setError(error.response?.data?.error || t.error);
    } finally {
      setSaving(false);
    }
  };

  if (!mounted || authLoading) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-yellow mx-auto mb-4"></div>
          <p className="text-primary-dark font-semibold">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8 ${
        isRTL ? "rtl" : "ltr"
      }`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-primary-dark hover:text-primary-yellow transition-colors mb-4"
          >
            <svg
              className={`w-5 h-5 ${isRTL ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            {t.backToDashboard}
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold text-primary-dark mb-2 flex items-center gap-3">
            <div className="w-2 h-10 bg-primary-yellow rounded-full"></div>
            {t.title}
          </h1>
          <p className="text-gray-600 text-lg">{t.subtitle}</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{success}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profit Margin Input */}
            <div>
              <label className="block text-sm font-bold text-primary-dark mb-2">
                {t.profitMargin}
              </label>
              <p className="text-sm text-gray-600 mb-4">{t.profitMarginHelp}</p>
              
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={profitMargin}
                  onChange={(e) => setProfitMargin(e.target.value)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-yellow focus:ring focus:ring-primary-yellow focus:ring-opacity-20 transition-all text-lg font-semibold"
                  placeholder="10.00"
                  required
                />
                <div className="flex items-center justify-center w-12 h-12 bg-primary-yellow text-white text-2xl font-bold rounded-xl shadow-md">
                  %
                </div>
              </div>
            </div>

            {/* Example Box */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-primary-yellow rounded-2xl p-6">
              <h3 className="font-bold text-primary-dark mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                {t.example}
              </h3>
              <p className="text-gray-700">{t.exampleText}</p>
            </div>

            {/* Current Value Display */}
            {settings && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-primary-dark mb-1">{t.currentValue}</h3>
                    <p className="text-sm text-gray-600">{t.lastUpdated}: {new Date(settings.updated_at).toLocaleString(language === "ar" ? "ar-EG" : "en-US")}</p>
                  </div>
                  <div className="text-3xl font-bold text-primary-yellow">
                    {settings.sendcloud_profit_margin}%
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-primary-yellow to-yellow-500 text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    {t.saving}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
                    </svg>
                    {t.save}
                  </>
                )}
              </button>

              <Link
                href="/dashboard"
                className="px-6 py-4 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all duration-300 flex items-center justify-center"
              >
                {t.cancel}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

