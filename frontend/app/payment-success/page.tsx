"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiService } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import { useLanguage } from "@/hooks/useLanguage";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showSuccess, showError } = useToast();
  const { language } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const confirmPayment = async () => {
      const type = searchParams.get("type");
      const shipmentId = searchParams.get("shipment_id");
      const quoteId = searchParams.get("quote_id");
      const sessionId = searchParams.get("session_id");

      if (type === "shipment" && shipmentId) {
        try {
          // Make POST request to confirm payment
          const response = await apiService.confirmShipmentPayment({
            shipment_id: parseInt(shipmentId, 10),
            session_id: sessionId || undefined,
          });

          if (response.data?.success) {
            showSuccess(
              language === "ar"
                ? "تم تأكيد الدفع بنجاح"
                : "Payment confirmed successfully"
            );
            // Redirect to dashboard after a short delay
            setTimeout(() => {
              router.push("/dashboard");
            }, 1500);
          } else {
            showError(
              response.data?.error ||
                (language === "ar"
                  ? "فشل تأكيد الدفع"
                  : "Failed to confirm payment")
            );
            // Still redirect to dashboard
            setTimeout(() => {
              router.push("/dashboard");
            }, 2000);
          }
        } catch (error: any) {
          console.error("Error confirming payment:", error);
          showError(
            error.response?.data?.error ||
              (language === "ar"
                ? "حدث خطأ أثناء تأكيد الدفع"
                : "An error occurred while confirming payment")
          );
          // Still redirect to dashboard
          setTimeout(() => {
            router.push("/dashboard");
          }, 2000);
        } finally {
          setIsProcessing(false);
        }
      } else if (type === "quote" && quoteId) {
        try {
          // Make POST request to confirm FCL quote payment
          const response = await apiService.confirmFCLQuotePayment({
            quote_id: parseInt(quoteId, 10),
            session_id: sessionId || undefined,
          });

          if (response.data?.success) {
            showSuccess(
              language === "ar"
                ? "تم تأكيد الدفع بنجاح"
                : "Payment confirmed successfully"
            );
            // Redirect to dashboard after a short delay
            setTimeout(() => {
              router.push("/dashboard");
            }, 1500);
          } else {
            showError(
              response.data?.error ||
                (language === "ar"
                  ? "فشل تأكيد الدفع"
                  : "Failed to confirm payment")
            );
            // Still redirect to dashboard
            setTimeout(() => {
              router.push("/dashboard");
            }, 2000);
          }
        } catch (error: any) {
          console.error("Error confirming payment:", error);
          showError(
            error.response?.data?.error ||
              (language === "ar"
                ? "حدث خطأ أثناء تأكيد الدفع"
                : "An error occurred while confirming payment")
          );
          // Still redirect to dashboard
          setTimeout(() => {
            router.push("/dashboard");
          }, 2000);
        } finally {
          setIsProcessing(false);
        }
      } else {
        // Not a recognized payment type, redirect to dashboard
        router.push("/dashboard");
      }
    };

    confirmPayment();
  }, [searchParams, router, language, showSuccess, showError]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="text-center">
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-yellow mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">
              {language === "ar"
                ? "جاري تأكيد الدفع..."
                : "Confirming payment..."}
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-gray-600 text-lg">
              {language === "ar"
                ? "جاري التوجيه إلى لوحة التحكم..."
                : "Redirecting to dashboard..."}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

