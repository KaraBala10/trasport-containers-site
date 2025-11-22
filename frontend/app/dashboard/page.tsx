"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { apiService } from "@/lib/api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface FCLQuote {
  id: number;
  quote_number?: string;
  port_of_loading: string;
  port_of_discharge: string;
  container_type: string;
  number_of_containers: number;
  total_price: number | null;
  price_per_container: number | null;
  is_processed: boolean;
  created_at: string;
}

export default function DashboardPage() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const { language, isRTL, mounted } = useLanguage();
  const router = useRouter();
  const [fclQuotes, setFclQuotes] = useState<FCLQuote[]>([]);
  const [quotesLoading, setQuotesLoading] = useState(true);

  const translations = useMemo(
    () => ({
      ar: {
        dashboard: "لوحة التحكم",
        welcome: "مرحباً",
        welcomeBack: "مرحباً بعودتك",
        loading: "جاري التحميل...",
        logout: "تسجيل الخروج",
        goToHome: "الذهاب إلى الصفحة الرئيسية",
        quickActions: "إجراءات سريعة",
        createLCLShipment: "إنشاء شحنة LCL إلى سوريا",
        createLCLShipmentDesc: "إنشاء طلب شحنة LCL جديد إلى سوريا",
        trackShipment: "تتبع الشحنة",
        trackShipmentDesc: "تتبع شحناتك الحالية",
        fclQuote: "طلب عرض سعر FCL",
        fclQuoteDesc: "طلب عرض سعر لحاوية كاملة (FCL)",
        getQuote: "الحصول على عرض سعر",
        getQuoteDesc: "طلب عرض سعر للشحن",
        profile: "الملف الشخصي",
        profileDesc: "إدارة إعدادات حسابك",
        accountInfo: "معلومات الحساب",
        email: "البريد الإلكتروني",
        username: "اسم المستخدم",
        memberSince: "عضو منذ",
        myFCLQuotes: "طلبات عرض السعر FCL الخاصة بي",
        noQuotes: "لا توجد طلبات عرض سعر حتى الآن",
        quoteNumber: "رقم الطلب",
        route: "المسار",
        containerType: "نوع الحاوية",
        containers: "عدد الحاويات",
        status: "الحالة",
        price: "السعر",
        date: "التاريخ",
        pending: "قيد الانتظار",
        processed: "تمت المعالجة",
        viewDetails: "عرض التفاصيل",
      },
      en: {
        dashboard: "Dashboard",
        welcome: "Welcome",
        welcomeBack: "Welcome back",
        loading: "Loading...",
        logout: "Logout",
        goToHome: "Go to Home",
        quickActions: "Quick Actions",
        createLCLShipment: "Create LCL Shipment to Syria",
        createLCLShipmentDesc: "Create a new LCL shipment request to Syria",
        trackShipment: "Track Shipment",
        trackShipmentDesc: "Track your existing shipments",
        fclQuote: "Request FCL Quote",
        fclQuoteDesc: "Request a quote for a full container load (FCL)",
        getQuote: "Get Quote",
        getQuoteDesc: "Request a shipping quote",
        profile: "Profile",
        profileDesc: "Manage your account settings",
        accountInfo: "Account Information",
        email: "Email",
        username: "Username",
        memberSince: "Member since",
        myFCLQuotes: "My FCL Quote Requests",
        noQuotes: "No quote requests yet",
        quoteNumber: "Quote Number",
        route: "Route",
        containerType: "Container Type",
        containers: "Containers",
        status: "Status",
        price: "Price",
        date: "Date",
        pending: "Pending",
        processed: "Processed",
        viewDetails: "View Details",
      },
    }),
    []
  );

  const t = translations[language];

  useEffect(() => {
    if (mounted && !loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [mounted, loading, isAuthenticated, router]);

  // Fetch user's FCL quotes
  useEffect(() => {
    const fetchFCLQuotes = async () => {
      if (!isAuthenticated || !mounted) return;

      try {
        setQuotesLoading(true);
        const response = await apiService.getFCLQuotes();
        // Handle both paginated and non-paginated responses
        const quotes = response.data?.results || response.data || [];
        setFclQuotes(Array.isArray(quotes) ? quotes : []);
      } catch (error: any) {
        console.error("Error fetching FCL quotes:", error);
        if (error.response?.status === 401) {
          // User not authenticated, redirect to login
          router.push("/login");
        } else {
          setFclQuotes([]);
        }
      } finally {
        setQuotesLoading(false);
      }
    };

    fetchFCLQuotes();
  }, [isAuthenticated, mounted, router]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-dark mx-auto"></div>
          <p className="mt-4 text-gray-600">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Format member since date
  const memberSinceDate = user?.date_joined
    ? new Date(user.date_joined).toLocaleDateString(
        language === "ar" ? "ar-SA" : "en-US",
        {
          year: "numeric",
          month: "long",
        }
      )
    : null;

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
          <div className="max-w-6xl mx-auto">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-primary-dark via-primary-dark to-primary-yellow rounded-2xl shadow-2xl p-8 md:p-10 mb-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-yellow/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>

              <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    {t.welcome},{" "}
                    {user?.first_name || user?.username || t.welcomeBack}!
                  </h1>
                  <p className="text-white/90 text-lg">{user?.email}</p>
                  {memberSinceDate && (
                    <p className="text-white/80 text-sm mt-2">
                      {t.memberSince} {memberSinceDate}
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/"
                    className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/30 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2 border border-white/30"
                  >
                    <svg
                      className="w-5 h-5"
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
                    {t.goToHome}
                  </Link>
                  <button
                    onClick={logout}
                    className="px-6 py-3 bg-red-600/90 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-red-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    {t.logout}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions Section */}
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary-dark mb-6 flex items-center gap-3">
                <div className="w-1 h-8 bg-primary-yellow rounded-full"></div>
                {t.quickActions}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Create LCL Shipment */}
                <Link
                  href="/create-shipment"
                  className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border-t-4 border-primary-yellow transform hover:-translate-y-2"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-primary-yellow/10 rounded-lg flex items-center justify-center group-hover:bg-primary-yellow/20 transition-colors">
                      <svg
                        className="w-6 h-6 text-primary-dark"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400 group-hover:text-primary-yellow transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={
                          isRTL
                            ? "M10 19l-7-7m0 0l7-7m-7 7h18"
                            : "M14 5l7 7m0 0l-7 7m7-7H3"
                        }
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-primary-dark mb-2 group-hover:text-primary-yellow transition-colors">
                    {t.createLCLShipment}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {t.createLCLShipmentDesc}
                  </p>
                </Link>

                {/* FCL Quote */}
                <Link
                  href="/fcl-quote"
                  className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border-t-4 border-blue-500 transform hover:-translate-y-2"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                      <svg
                        className="w-6 h-6 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={
                          isRTL
                            ? "M10 19l-7-7m0 0l7-7m-7 7h18"
                            : "M14 5l7 7m0 0l-7 7m7-7H3"
                        }
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-primary-dark mb-2 group-hover:text-blue-600 transition-colors">
                    {t.fclQuote}
                  </h3>
                  <p className="text-gray-600 text-sm">{t.fclQuoteDesc}</p>
                </Link>

                {/* Track Shipment */}
                <Link
                  href="/tracking"
                  className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border-t-4 border-green-500 transform hover:-translate-y-2"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                      <svg
                        className="w-6 h-6 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={
                          isRTL
                            ? "M10 19l-7-7m0 0l7-7m-7 7h18"
                            : "M14 5l7 7m0 0l-7 7m7-7H3"
                        }
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-primary-dark mb-2 group-hover:text-green-600 transition-colors">
                    {t.trackShipment}
                  </h3>
                  <p className="text-gray-600 text-sm">{t.trackShipmentDesc}</p>
                </Link>

                {/* Get Quote */}
                <Link
                  href="/quote"
                  className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border-t-4 border-purple-500 transform hover:-translate-y-2"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                      <svg
                        className="w-6 h-6 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={
                          isRTL
                            ? "M10 19l-7-7m0 0l7-7m-7 7h18"
                            : "M14 5l7 7m0 0l-7 7m7-7H3"
                        }
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-primary-dark mb-2 group-hover:text-purple-600 transition-colors">
                    {t.getQuote}
                  </h3>
                  <p className="text-gray-600 text-sm">{t.getQuoteDesc}</p>
                </Link>

                {/* Profile */}
                <Link
                  href="/profile"
                  className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border-t-4 border-indigo-500 transform hover:-translate-y-2"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-lg flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                      <svg
                        className="w-6 h-6 text-indigo-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={
                          isRTL
                            ? "M10 19l-7-7m0 0l7-7m-7 7h18"
                            : "M14 5l7 7m0 0l-7 7m7-7H3"
                        }
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-primary-dark mb-2 group-hover:text-indigo-600 transition-colors">
                    {t.profile}
                  </h3>
                  <p className="text-gray-600 text-sm">{t.profileDesc}</p>
                </Link>
              </div>
            </div>

            {/* My FCL Quotes Section */}
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary-dark mb-6 flex items-center gap-3">
                <div className="w-1 h-8 bg-primary-yellow rounded-full"></div>
                {t.myFCLQuotes}
              </h2>

              {quotesLoading ? (
                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-dark mx-auto"></div>
                  <p className="mt-4 text-gray-600">{t.loading}</p>
                </div>
              ) : fclQuotes.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                  <svg
                    className="w-16 h-16 text-gray-400 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-gray-600 text-lg">{t.noQuotes}</p>
                  <Link
                    href="/fcl-quote"
                    className="mt-4 inline-block px-6 py-3 bg-primary-yellow text-primary-dark rounded-lg font-semibold hover:bg-primary-yellow/90 transition-all"
                  >
                    {t.fclQuote}
                  </Link>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            {t.quoteNumber}
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            {t.route}
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            {t.containerType}
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            {t.containers}
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            {t.price}
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            {t.status}
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            {t.date}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {fclQuotes.map((quote) => (
                          <tr
                            key={quote.id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-medium text-primary-dark">
                                {quote.quote_number ||
                                  `FCL-${quote.id.toString().padStart(6, "0")}`}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                                {quote.port_of_loading} →{" "}
                                {quote.port_of_discharge}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-700">
                                {quote.container_type}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-700">
                                {quote.number_of_containers}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {quote.total_price ? (
                                <span className="text-sm font-semibold text-primary-dark">
                                  €
                                  {parseFloat(
                                    quote.total_price.toString()
                                  ).toFixed(2)}
                                </span>
                              ) : (
                                <span className="text-sm text-gray-400 italic">
                                  {language === "ar" ? "قيد الحساب" : "Pending"}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                  quote.is_processed
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {quote.is_processed ? t.processed : t.pending}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(quote.created_at).toLocaleDateString(
                                language === "ar" ? "ar-SA" : "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Account Information Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
              <h2 className="text-2xl font-bold text-primary-dark mb-6 flex items-center gap-3">
                <div className="w-1 h-8 bg-primary-yellow rounded-full"></div>
                {t.accountInfo}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                    {t.username}
                  </label>
                  <p className="text-lg font-medium text-gray-900">
                    {user?.username}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                    {t.email}
                  </label>
                  <p className="text-lg font-medium text-gray-900">
                    {user?.email}
                  </p>
                </div>
                {user?.first_name && (
                  <div>
                    <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                      {language === "ar" ? "الاسم الأول" : "First Name"}
                    </label>
                    <p className="text-lg font-medium text-gray-900">
                      {user.first_name}
                    </p>
                  </div>
                )}
                {user?.last_name && (
                  <div>
                    <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                      {language === "ar" ? "اسم العائلة" : "Last Name"}
                    </label>
                    <p className="text-lg font-medium text-gray-900">
                      {user.last_name}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer language={language} />
    </div>
  );
}
