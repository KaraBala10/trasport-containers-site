"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { apiService } from "@/lib/api";

interface FCLQuote {
  id: number;
  quote_number: string;
  status: string;
  origin_city: string;
  origin_country: string;
  destination_city: string;
  destination_country: string;
  port_of_loading: string;
  port_of_discharge: string;
  container_type: string;
  number_of_containers: number;
  created_at: string;
  total_price?: number;
  amount_paid?: number;
}

interface TrackingStep {
  key: string;
  label: { ar: string; en: string };
  status: "completed" | "current" | "pending";
}

export default function TrackingPage() {
  const { language, mounted } = useLanguage();
  const { isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const quoteId = searchParams.get("id");

  const [quote, setQuote] = useState<FCLQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const translations = useMemo(
    () => ({
      ar: {
        title: "تتبع الشحنة",
        description: "تتبع شحنتك في الوقت الفعلي",
        loading: "جاري التحميل...",
        error: "حدث خطأ",
        notFound: "لم يتم العثور على الشحنة",
        quoteNumber: "رقم العرض",
        status: "الحالة",
        origin: "المنشأ",
        destination: "الوجهة",
        backToDashboard: "العودة إلى لوحة التحكم",
        trackAnother: "تتبع شحنة أخرى",
        // Status steps
        created: "تم الإنشاء",
        offerSent: "تم إرسال العرض",
        pendingPayment: "في انتظار الدفع",
        pendingPickup: "في انتظار الاستلام",
        inTransitToWattweg5: "في الطريق إلى واتفيج 5",
        arrivedWattweg5: "وصل إلى واتفيج 5",
        sortingWattweg5: "فرز في واتفيج 5",
        readyForExport: "جاهز للتصدير",
        inTransitToSyria: "في الطريق إلى سوريا",
        arrivedSyria: "وصل إلى سوريا",
        syriaSorting: "فرز في سوريا",
        readyForDelivery: "جاهز للتسليم",
        outForDelivery: "خارج للتسليم",
        delivered: "تم التسليم",
        cancelled: "ملغى",
        completed: "مكتمل",
        current: "حالي",
        pending: "قيد الانتظار",
      },
      en: {
        title: "Track Shipment",
        description: "Track your shipment in real-time",
        loading: "Loading...",
        error: "An error occurred",
        notFound: "Quote not found",
        quoteNumber: "Quote Number",
        status: "Status",
        origin: "Origin",
        destination: "Destination",
        backToDashboard: "Back to Dashboard",
        trackAnother: "Track Another Quote",
        // Status steps
        created: "Created",
        offerSent: "Offer Sent",
        pendingPayment: "Pending Payment",
        pendingPickup: "Pending Pickup",
        inTransitToWattweg5: "In Transit to Wattweg 5",
        arrivedWattweg5: "Arrived Wattweg 5",
        sortingWattweg5: "Sorting Wattweg 5",
        readyForExport: "Ready for Export",
        inTransitToSyria: "In Transit to Syria",
        arrivedSyria: "Arrived Syria",
        syriaSorting: "Syria Sorting",
        readyForDelivery: "Ready for Delivery",
        outForDelivery: "Out for Delivery",
        delivered: "Delivered",
        cancelled: "Cancelled",
        completed: "Completed",
        current: "Current",
        pending: "Pending",
      },
    }),
    []
  );

  // Prevent hydration mismatch by using static text during SSR
  const t = mounted ? translations[language] : translations.en;

  useEffect(() => {
    if (!mounted) return;

    if (!quoteId) {
      setError(mounted ? t.notFound : "Quote not found");
      setLoading(false);
      return;
    }

    const fetchQuote = async () => {
      try {
        setLoading(true);
        setError(null);
        const quoteIdNum = parseInt(quoteId || "0");

        if (isNaN(quoteIdNum) || quoteIdNum <= 0) {
          setError(t.notFound);
          setLoading(false);
          return;
        }

        console.log("Fetching quote with ID:", quoteIdNum);
        const response = await apiService.getFCLQuote(quoteIdNum);
        console.log("Quote response:", response);
        console.log("Quote data:", response.data);

        // DRF RetrieveUpdateDestroyAPIView returns data directly in response.data
        if (response.data && response.data.id) {
          setQuote(response.data);
        } else {
          console.error("No valid data in response:", response);
          setError(t.notFound);
        }
      } catch (err: any) {
        console.error("Error fetching quote:", err);
        console.error("Error status:", err.response?.status);
        console.error("Error response:", err.response?.data);

        if (err.response?.status === 404) {
          setError(t.notFound);
        } else if (err.response?.status === 403) {
          setError(
            language === "ar"
              ? "ليس لديك صلاحية لعرض هذا العرض"
              : "You don't have permission to view this quote"
          );
        } else if (err.response?.status === 401) {
          setError(
            language === "ar"
              ? "يرجى تسجيل الدخول لعرض هذا العرض"
              : "Please log in to view this quote"
          );
        } else {
          setError(
            err.response?.data?.error ||
              err.response?.data?.detail ||
              err.message ||
              t.error
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, [quoteId, language, mounted, isAuthenticated, t.notFound, t.error]);

  // Define all tracking steps in order
  const allSteps: TrackingStep[] = useMemo(() => {
    const steps = [
      { key: "CREATED", label: { ar: t.created, en: t.created } },
      { key: "OFFER_SENT", label: { ar: t.offerSent, en: t.offerSent } },
      {
        key: "PENDING_PAYMENT",
        label: { ar: t.pendingPayment, en: t.pendingPayment },
      },
      {
        key: "PENDING_PICKUP",
        label: { ar: t.pendingPickup, en: t.pendingPickup },
      },
      {
        key: "IN_TRANSIT_TO_WATTWEG_5",
        label: { ar: t.inTransitToWattweg5, en: t.inTransitToWattweg5 },
      },
      {
        key: "ARRIVED_WATTWEG_5",
        label: { ar: t.arrivedWattweg5, en: t.arrivedWattweg5 },
      },
      {
        key: "SORTING_WATTWEG_5",
        label: { ar: t.sortingWattweg5, en: t.sortingWattweg5 },
      },
      {
        key: "READY_FOR_EXPORT",
        label: { ar: t.readyForExport, en: t.readyForExport },
      },
      {
        key: "IN_TRANSIT_TO_SYRIA",
        label: { ar: t.inTransitToSyria, en: t.inTransitToSyria },
      },
      {
        key: "ARRIVED_SYRIA",
        label: { ar: t.arrivedSyria, en: t.arrivedSyria },
      },
      {
        key: "SYRIA_SORTING",
        label: { ar: t.syriaSorting, en: t.syriaSorting },
      },
      {
        key: "READY_FOR_DELIVERY",
        label: { ar: t.readyForDelivery, en: t.readyForDelivery },
      },
      {
        key: "OUT_FOR_DELIVERY",
        label: { ar: t.outForDelivery, en: t.outForDelivery },
      },
      { key: "DELIVERED", label: { ar: t.delivered, en: t.delivered } },
    ];

    const currentStatus = quote?.status || "CREATED";
    const statusIndex = steps.findIndex((step) => step.key === currentStatus);

    return steps.map((step, index) => {
      let status: "completed" | "current" | "pending" = "pending";

      if (currentStatus === "CANCELLED") {
        status = "pending";
      } else if (index < statusIndex) {
        status = "completed";
      } else if (index === statusIndex) {
        status = "current";
      }

      return {
        ...step,
        status,
      };
    });
  }, [quote?.status, t]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-dark mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </main>
        <Footer language={mounted ? language : "en"} />
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 text-lg mb-4">{error || t.notFound}</p>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-6 py-2 bg-primary-dark text-white rounded-lg hover:bg-primary-yellow hover:text-primary-dark transition-colors"
            >
              {t.backToDashboard}
            </button>
          </div>
        </main>
        <Footer language={language} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header />

      <main className="flex-grow">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-primary-dark via-primary-dark to-primary-yellow py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {t.title}
            </h1>
            <p className="text-white/90">{t.description}</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Quote Info Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  {t.quoteNumber}
                </p>
                <p className="text-lg font-bold text-primary-dark font-mono">
                  {quote.quote_number ||
                    `FCL-${quote.id.toString().padStart(6, "0")}`}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  {t.origin}
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {quote.origin_city}, {quote.origin_country}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  POL: {quote.port_of_loading}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  {t.destination}
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {quote.destination_city}, {quote.destination_country}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  POD: {quote.port_of_discharge}
                </p>
              </div>
            </div>
          </div>

          {/* Tracking Stepper */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-primary-dark mb-8">
              {language === "ar" ? "حالة الشحنة" : "Shipment Status"}
            </h2>

            <div className="relative">
              {/* Vertical Line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

              {/* Steps */}
              <div className="space-y-8">
                {allSteps.map((step, index) => (
                  <div
                    key={step.key}
                    className="relative flex items-start gap-6"
                  >
                    {/* Step Icon */}
                    <div className="relative z-10 flex-shrink-0">
                      {step.status === "completed" ? (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                          <svg
                            className="w-6 h-6 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      ) : step.status === "current" ? (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-yellow to-primary-dark flex items-center justify-center shadow-lg animate-pulse">
                          <div className="w-4 h-4 rounded-full bg-white"></div>
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 border-4 border-white flex items-center justify-center shadow">
                          <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                        </div>
                      )}
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 pt-2">
                      <div
                        className={`p-4 rounded-xl ${
                          step.status === "completed"
                            ? "bg-green-50 border-2 border-green-200"
                            : step.status === "current"
                            ? "bg-gradient-to-r from-primary-yellow/20 to-primary-dark/20 border-2 border-primary-yellow"
                            : "bg-gray-50 border-2 border-gray-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3
                              className={`text-lg font-bold ${
                                step.status === "completed"
                                  ? "text-green-800"
                                  : step.status === "current"
                                  ? "text-primary-dark"
                                  : "text-gray-500"
                              }`}
                            >
                              {step.label[language]}
                            </h3>
                            {step.status === "current" && (
                              <p className="text-sm text-primary-dark mt-1 font-medium">
                                {t.current}
                              </p>
                            )}
                            {step.status === "completed" && (
                              <p className="text-sm text-green-700 mt-1 font-medium">
                                {t.completed}
                              </p>
                            )}
                          </div>
                          {step.status === "current" && (
                            <span className="px-3 py-1 text-xs font-bold text-white bg-gradient-to-r from-primary-yellow to-primary-dark rounded-full">
                              {t.current}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => router.push("/dashboard")}
              className="px-6 py-3 bg-gradient-to-r from-primary-dark to-primary-dark hover:from-primary-yellow hover:to-primary-yellow text-white hover:text-primary-dark font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {t.backToDashboard}
            </button>
            {isAuthenticated && (
              <button
                onClick={() => router.push("/dashboard")}
                className="px-6 py-3 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-800 font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {t.trackAnother}
              </button>
            )}
          </div>
        </div>
      </main>

      <Footer language={language} />
    </div>
  );
}
