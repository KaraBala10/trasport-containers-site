"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function CustomsDocumentsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { language, isRTL, mounted } = useLanguage();
  const router = useRouter();

  const translations = useMemo(
    () => ({
      ar: {
        title: "المستندات الجمركية",
        subtitle: "إدارة المستندات الجمركية",
        backToDashboard: "العودة إلى لوحة التحكم",
      },
      en: {
        title: "Customs Documents",
        subtitle: "Manage customs documents",
        backToDashboard: "Back to Dashboard",
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

          {/* Content Area - Empty for now */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-gray-400"
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
              <p className="text-gray-500 text-lg">
                {language === "ar"
                  ? "هذه الصفحة فارغة حالياً"
                  : "This page is currently empty"}
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

