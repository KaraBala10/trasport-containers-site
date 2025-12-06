"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { apiService } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface LCLShipment {
  id: number;
  shipment_number: string;
  status: string;
  payment_status: string;
  direction: string;
  sender_name: string;
  receiver_name: string;
  total_price: number;
  created_at: string;
}

export default function CustomsDocumentsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { language, isRTL, mounted } = useLanguage();
  const router = useRouter();
  const { showSuccess, showError, showWarning } = useToast();
  const [shipments, setShipments] = useState<LCLShipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShipments, setSelectedShipments] = useState<Set<number>>(
    new Set()
  );
  const [generating, setGenerating] = useState<string | null>(null);

  const translations = useMemo(
    () => ({
      ar: {
        title: "المستندات الجمركية",
        subtitle: "إدارة المستندات الجمركية",
        backToDashboard: "العودة إلى لوحة التحكم",
        selectAll: "تحديد الكل",
        deselectAll: "إلغاء التحديد",
        generatePackingList: "إنشاء قائمة التعبئة الموحدة",
        generateExportInvoice: "إنشاء فاتورة التصدير الموحدة",
        noShipments: "لا توجد شحنات متاحة",
        selectShipments: "يرجى تحديد شحنات واحدة على الأقل",
        generating: "جاري الإنشاء...",
        shipmentNumber: "رقم الشحنة",
        status: "الحالة",
        direction: "الاتجاه",
        sender: "المرسل",
        receiver: "المستلم",
        totalPrice: "السعر الإجمالي",
        select: "تحديد",
        paidShipmentsOnly: "الشحنات المدفوعة فقط",
      },
      en: {
        title: "Customs Documents",
        subtitle: "Manage customs documents",
        backToDashboard: "Back to Dashboard",
        selectAll: "Select All",
        deselectAll: "Deselect All",
        generatePackingList: "Generate Consolidated Packing List",
        generateExportInvoice: "Generate Consolidated Export Invoice",
        noShipments: "No shipments available",
        selectShipments: "Please select at least one shipment",
        generating: "Generating...",
        shipmentNumber: "Shipment Number",
        status: "Status",
        direction: "Direction",
        sender: "Sender",
        receiver: "Receiver",
        totalPrice: "Total Price",
        select: "Select",
        paidShipmentsOnly: "Paid shipments only",
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

  // Fetch shipments
  useEffect(() => {
    const fetchShipments = async () => {
      if (!isAuthenticated || !user?.is_superuser) return;

      try {
        setLoading(true);
        const response = await apiService.getShipments();
        const shipmentsData = response.data?.results || response.data || [];

        // Filter only paid shipments
        const paidShipments = shipmentsData.filter(
          (shipment: LCLShipment) => shipment.payment_status === "paid"
        );

        setShipments(paidShipments);
      } catch (error: any) {
        console.error("Error fetching shipments:", error);
        showError(
          language === "ar"
            ? "حدث خطأ أثناء جلب الشحنات"
            : "Error fetching shipments"
        );
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.is_superuser) {
      fetchShipments();
    }
  }, [isAuthenticated, user, language, showError]);

  const toggleSelectAll = () => {
    if (selectedShipments.size === shipments.length) {
      setSelectedShipments(new Set());
    } else {
      setSelectedShipments(new Set(shipments.map((s) => s.id)));
    }
  };

  const toggleShipment = (shipmentId: number) => {
    const newSelected = new Set(selectedShipments);
    if (newSelected.has(shipmentId)) {
      newSelected.delete(shipmentId);
    } else {
      newSelected.add(shipmentId);
    }
    setSelectedShipments(newSelected);
  };

  const generateDocument = async (
    documentType: "packing_list" | "consolidated_export_invoice"
  ) => {
    if (selectedShipments.size === 0) {
      showWarning(t.selectShipments);
      return;
    }

    try {
      setGenerating(documentType);
      const response = await apiService.generateBulkCustomsDocuments({
        document_type: documentType,
        shipment_ids: Array.from(selectedShipments),
        language: "en",
      });

      // Create blob and download
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download =
        documentType === "packing_list"
          ? `Consolidated-Packing-List-${
              new Date().toISOString().split("T")[0]
            }.pdf`
          : `Consolidated-Export-Invoice-${
              new Date().toISOString().split("T")[0]
            }.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showSuccess(
        language === "ar"
          ? "تم إنشاء المستند بنجاح"
          : "Document generated successfully"
      );
    } catch (error: any) {
      console.error(`Error generating ${documentType}:`, error);
      const errorMessage =
        error.response?.data?.error ||
        (language === "ar"
          ? "حدث خطأ أثناء إنشاء المستند"
          : "Error generating document");
      showError(errorMessage);
    } finally {
      setGenerating(null);
    }
  };

  if (!mounted || authLoading) {
    return null;
  }

  if (!isAuthenticated || !user?.is_superuser) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/dashboard"
              className={`inline-flex items-center gap-2 text-primary-dark hover:text-primary-yellow transition-colors mb-4 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
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
                  d={isRTL ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
                />
              </svg>
              <span className="font-medium">{t.backToDashboard}</span>
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-primary-dark mb-2">
              {t.title}
            </h1>
            <p className="text-gray-600">{t.subtitle}</p>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleSelectAll}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
                >
                  {selectedShipments.size === shipments.length
                    ? t.deselectAll
                    : t.selectAll}
                </button>
                <span className="text-sm text-gray-600">
                  {selectedShipments.size} / {shipments.length}{" "}
                  {language === "ar" ? "محدد" : "selected"}
                </span>
              </div>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => generateDocument("packing_list")}
                  disabled={
                    selectedShipments.size === 0 ||
                    generating === "packing_list"
                  }
                  className={`px-6 py-3 font-semibold rounded-lg transition-all ${
                    selectedShipments.size === 0 ||
                    generating === "packing_list"
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
                  }`}
                >
                  {generating === "packing_list"
                    ? t.generating
                    : t.generatePackingList}
                </button>
                <button
                  onClick={() =>
                    generateDocument("consolidated_export_invoice")
                  }
                  disabled={
                    selectedShipments.size === 0 ||
                    generating === "consolidated_export_invoice"
                  }
                  className={`px-6 py-3 font-semibold rounded-lg transition-all ${
                    selectedShipments.size === 0 ||
                    generating === "consolidated_export_invoice"
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl"
                  }`}
                >
                  {generating === "consolidated_export_invoice"
                    ? t.generating
                    : t.generateExportInvoice}
                </button>
              </div>
            </div>
          </div>

          {/* Shipments List */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary-yellow mx-auto mb-4"></div>
                <p className="text-gray-600">
                  {language === "ar" ? "جاري التحميل..." : "Loading..."}
                </p>
              </div>
            ) : shipments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">{t.noShipments}</p>
                <p className="text-gray-400 text-sm mt-2">
                  {t.paidShipmentsOnly}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        <input
                          type="checkbox"
                          checked={selectedShipments.size === shipments.length}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 text-primary-yellow border-gray-300 rounded focus:ring-primary-yellow"
                        />
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        {t.shipmentNumber}
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        {t.status}
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        {t.direction}
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        {t.sender}
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        {t.receiver}
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">
                        {t.totalPrice}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {shipments.map((shipment) => (
                      <tr
                        key={shipment.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                          selectedShipments.has(shipment.id) ? "bg-blue-50" : ""
                        }`}
                      >
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={selectedShipments.has(shipment.id)}
                            onChange={() => toggleShipment(shipment.id)}
                            className="w-4 h-4 text-primary-yellow border-gray-300 rounded focus:ring-primary-yellow"
                          />
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-900">
                          {shipment.shipment_number || `#${shipment.id}`}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            {shipment.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {shipment.direction === "eu-sy"
                            ? language === "ar"
                              ? "أوروبا → سوريا"
                              : "EU → SY"
                            : language === "ar"
                            ? "سوريا → أوروبا"
                            : "SY → EU"}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {shipment.sender_name}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {shipment.receiver_name}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-gray-900">
                          €{Number(shipment.total_price || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
