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

interface LCLShipment {
  id: number;
  shipment_number: string;
  status: string;
  direction: "eu-sy" | "sy-eu";
  sender_city: string;
  sender_country: string;
  receiver_city: string;
  receiver_country: string;
  created_at: string;
  total_price?: number;
  amount_paid?: number;
  tracking_number?: string;
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
  const shipmentId = searchParams.get("shipment_id");

  const [quotes, setQuotes] = useState<FCLQuote[]>([]);
  const [shipments, setShipments] = useState<LCLShipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedQuotes, setExpandedQuotes] = useState<Set<number>>(new Set());
  const [expandedShipments, setExpandedShipments] = useState<Set<number>>(new Set());

  const translations = useMemo(
    () => ({
      ar: {
        title: "تتبع الشحنة",
        description: "تتبع شحناتك في الوقت الفعلي",
        loading: "جاري التحميل...",
        error: "حدث خطأ",
        notFound: "لم يتم العثور على الشحنة",
        noQuotes: "لا توجد شحنات حتى الآن",
        quoteNumber: "رقم العرض",
        trackingNumber: "رقم التتبع",
        status: "الحالة",
        origin: "المنشأ",
        destination: "الوجهة",
        backToDashboard: "العودة إلى لوحة التحكم",
        trackAnother: "تتبع شحنة أخرى",
        shipmentStatus: "حالة الشحنة",
        // Status steps
        created: "تم الإنشاء",
        offerSent: "تم إرسال العرض",
        pendingPayment: "في انتظار الدفع",
        pendingPickup: "في انتظار الاستلام",
        inTransitToWattweg5: "في الطريق إلى واتفيج 5",
        arrivedWattweg5: "وصل إلى واتفيج 5",
        sortingWattweg5: "فرز في واتفيج 5",
        readyForExport: "جاهز للتصدير",
        inTransitToDestination: "في الطريق إلى الوجهة",
        arrivedDestination: "وصل إلى الوجهة",
        destinationSorting: "فرز في الوجهة",
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
        description: "Track your shipments in real-time",
        loading: "Loading...",
        error: "An error occurred",
        notFound: "Quote not found",
        noQuotes: "No shipments yet",
        quoteNumber: "Quote Number",
        trackingNumber: "Tracking Number",
        status: "Status",
        origin: "Origin",
        destination: "Destination",
        backToDashboard: "Back to Dashboard",
        trackAnother: "Track Another Quote",
        shipmentStatus: "Shipment Status",
        // Status steps
        created: "Created",
        offerSent: "Offer Sent",
        pendingPayment: "Pending Payment",
        pendingPickup: "Pending Pickup",
        inTransitToWattweg5: "In Transit to Wattweg 5",
        arrivedWattweg5: "Arrived Wattweg 5",
        sortingWattweg5: "Sorting Wattweg 5",
        readyForExport: "Ready for Export",
        inTransitToDestination: "In Transit to Destination",
        arrivedDestination: "Arrived at Destination",
        destinationSorting: "Sorting at Destination",
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

  // Function to get tracking steps (works for both FCL quotes and LCL shipments)
  const getTrackingSteps = (item: FCLQuote | LCLShipment): TrackingStep[] => {
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
        key: "IN_TRANSIT_TO_DESTINATION",
        label: { ar: t.inTransitToDestination, en: t.inTransitToDestination },
      },
      {
        key: "ARRIVED_DESTINATION",
        label: { ar: t.arrivedDestination, en: t.arrivedDestination },
      },
      {
        key: "DESTINATION_SORTING",
        label: { ar: t.destinationSorting, en: t.destinationSorting },
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

    const currentStatus = item?.status || "CREATED";
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
  };

  // Fetch all quotes and shipments
  useEffect(() => {
    if (!mounted || !isAuthenticated) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("🔍 Fetching data - quoteId:", quoteId, "shipmentId:", shipmentId);
        
        // Fetch FCL quotes
        const quotesResponse = await apiService.getFCLQuotes();
        const quotesData = quotesResponse.data?.results || quotesResponse.data || [];
        setQuotes(Array.isArray(quotesData) ? quotesData : []);
        console.log("✅ Fetched FCL quotes:", quotesData.length);

        // Fetch LCL shipments
        try {
          const shipmentsResponse = await apiService.getShipments();
          const shipmentsData = shipmentsResponse.data?.results || shipmentsResponse.data || [];
          const processedShipments = Array.isArray(shipmentsData) ? shipmentsData : [];
          console.log("📦 Fetched LCL shipments:", processedShipments.length, processedShipments);
          setShipments(processedShipments);

          // If there's a shipmentId in URL, expand it
          if (shipmentId) {
            const shipmentIdNum = parseInt(shipmentId);
            console.log("🔍 Looking for shipment ID:", shipmentIdNum, "in shipments:", processedShipments.map(s => s.id));
            if (!isNaN(shipmentIdNum) && shipmentIdNum > 0) {
              // Check if shipment exists
              const shipmentExists = processedShipments.some(s => s.id === shipmentIdNum);
              console.log("✅ Shipment exists:", shipmentExists);
              if (shipmentExists) {
                setExpandedShipments(new Set([shipmentIdNum]));
                // Scroll to the shipment after a short delay
                setTimeout(() => {
                  const element = document.getElementById(`shipment-${shipmentIdNum}`);
                  console.log("📍 Scrolling to element:", element);
                  if (element) {
                    element.scrollIntoView({ behavior: "smooth", block: "start" });
                  } else {
                    console.warn("⚠️ Element not found: shipment-" + shipmentIdNum);
                  }
                }, 500);
              } else {
                console.warn("⚠️ Shipment not found with ID:", shipmentIdNum);
              }
            }
          }
        } catch (shipmentError: any) {
          console.error("❌ Error fetching shipments:", shipmentError);
          setShipments([]);
        }

        // If there's a quoteId in URL, expand it
        if (quoteId) {
          const quoteIdNum = parseInt(quoteId);
          if (!isNaN(quoteIdNum) && quoteIdNum > 0) {
            setExpandedQuotes(new Set([quoteIdNum]));
            // Scroll to the quote after a short delay
            setTimeout(() => {
              const element = document.getElementById(`quote-${quoteIdNum}`);
              if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }, 300);
          }
        }
      } catch (err: any) {
        console.error("Error fetching data:", err);
        if (err.response?.status === 401) {
          setError(
            language === "ar"
              ? "يرجى تسجيل الدخول لعرض الشحنات"
              : "Please log in to view shipments"
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

    fetchData();
  }, [mounted, isAuthenticated, quoteId, shipmentId, language, t.error]);

  const toggleQuote = (quoteId: number) => {
    setExpandedQuotes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(quoteId)) {
        newSet.delete(quoteId);
      } else {
        newSet.add(quoteId);
      }
      return newSet;
    });
  };

  const toggleShipment = (shipmentId: number) => {
    setExpandedShipments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(shipmentId)) {
        newSet.delete(shipmentId);
      } else {
        newSet.add(shipmentId);
      }
      return newSet;
    });
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-dark mx-auto"></div>
            <p className="mt-4 text-gray-600">{t.loading}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header />

      <main className="flex-grow">
        {/* Spacer for fixed header */}
        <div className="h-20" aria-hidden="true" />

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
          {/* Back to Dashboard Button */}
          <div className="mb-6">
            <button
              onClick={() => router.push("/dashboard")}
              className="px-6 py-3 bg-gradient-to-r from-primary-dark to-primary-dark hover:from-primary-yellow hover:to-primary-yellow text-white hover:text-primary-dark font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
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
                  d={language === "ar" ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
                />
              </svg>
              {t.backToDashboard}
            </button>
          </div>

          {error ? (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <p className="text-red-600 text-lg mb-4">{error}</p>
            </div>
          ) : quotes.length === 0 && shipments.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <p className="text-gray-600 text-lg">{t.noQuotes}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* FCL Quotes */}
              {quotes.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-primary-dark mb-4">
                    {language === "ar" ? "عروض FCL" : "FCL Quotes"}
                  </h2>
                </div>
              )}
              {quotes.map((quote) => {
                const isExpanded = expandedQuotes.has(quote.id);
                const steps = getTrackingSteps(quote);

                return (
                  <div
                    key={quote.id}
                    id={`quote-${quote.id}`}
                    className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
                  >
                    {/* Quote Header */}
                    <button
                      onClick={() => toggleQuote(quote.id)}
                      className="w-full p-6 hover:bg-gray-50 transition-colors flex items-center justify-between text-left"
                      type="button"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <p className="text-lg font-bold text-primary-dark font-mono">
                            {quote.quote_number ||
                              `FCL-${quote.id.toString().padStart(6, "0")}`}
                          </p>
                          <span
                            className={`px-3 py-1 text-xs font-bold rounded-full ${
                              quote.status === "DELIVERED"
                                ? "bg-green-100 text-green-800"
                                : quote.status === "CANCELLED"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {quote.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {quote.port_of_loading} → {quote.port_of_discharge}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {quote.origin_city}, {quote.origin_country} →{" "}
                          {quote.destination_city}, {quote.destination_country}
                        </p>
                      </div>
                      <svg
                        className={`w-6 h-6 text-gray-400 transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {/* Tracking Steps */}
                    {isExpanded && (
                      <div className="px-6 pb-6 border-t border-gray-200">
                        <h3 className="text-xl font-bold text-primary-dark mb-6 mt-6">
                          {t.shipmentStatus}
                        </h3>

                        <div className="relative">
                          {/* Vertical Line */}
                          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                          {/* Steps */}
                          <div className="space-y-6">
                            {steps.map((step, index) => (
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
                    )}
                  </div>
                );
              })}

              {/* LCL Shipments */}
              {shipments.length > 0 && (
                <div className="mb-6 mt-8">
                  <h2 className="text-2xl font-bold text-primary-dark mb-4">
                    {language === "ar" ? "شحنات LCL" : "LCL Shipments"}
                  </h2>
                </div>
              )}
              {shipments.map((shipment) => {
                const isExpanded = expandedShipments.has(shipment.id);
                const steps = getTrackingSteps(shipment);
                const directionDisplay =
                  shipment.direction === "eu-sy"
                    ? language === "ar"
                      ? "أوروبا → سوريا"
                      : "Europe → Syria"
                    : language === "ar"
                    ? "سوريا → أوروبا"
                    : "Syria → Europe";

                return (
                  <div
                    key={shipment.id}
                    id={`shipment-${shipment.id}`}
                    className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
                  >
                    {/* Shipment Header */}
                    <button
                      onClick={() => toggleShipment(shipment.id)}
                      className="w-full p-6 hover:bg-gray-50 transition-colors flex items-center justify-between text-left"
                      type="button"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <p className="text-lg font-bold text-primary-dark font-mono">
                            {shipment.shipment_number ||
                              `LCL-${shipment.id.toString().padStart(6, "0")}`}
                          </p>
                          <span
                            className={`px-3 py-1 text-xs font-bold rounded-full ${
                              shipment.status === "DELIVERED"
                                ? "bg-green-100 text-green-800"
                                : shipment.status === "CANCELLED"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {shipment.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{directionDisplay}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {shipment.sender_city}, {shipment.sender_country} →{" "}
                          {shipment.receiver_city}, {shipment.receiver_country}
                        </p>
                        {shipment.tracking_number && (
                          <p className="text-xs text-primary-dark mt-1 font-mono">
                            {t.trackingNumber}: {shipment.tracking_number}
                          </p>
                        )}
                      </div>
                      <svg
                        className={`w-6 h-6 text-gray-400 transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {/* Tracking Steps */}
                    {isExpanded && (
                      <div className="px-6 pb-6 border-t border-gray-200">
                        <h3 className="text-xl font-bold text-primary-dark mb-6 mt-6">
                          {t.shipmentStatus}
                        </h3>

                        <div className="relative">
                          {/* Vertical Line */}
                          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                          {/* Steps */}
                          <div className="space-y-6">
                            {steps.map((step, index) => (
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
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
