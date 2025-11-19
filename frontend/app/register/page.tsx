"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();
  const { language, setLanguage, mounted, isRTL } = useLanguage();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
    first_name: "",
    last_name: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Translations
  const translations = useMemo(
    () => ({
      ar: {
        createAccount: "إنشاء حسابك",
        username: "اسم المستخدم",
        email: "البريد الإلكتروني",
        firstName: "الاسم الأول",
        lastName: "اسم العائلة",
        password: "كلمة المرور",
        confirmPassword: "تأكيد كلمة المرور",
        creatingAccount: "جاري إنشاء الحساب...",
        createAccountButton: "إنشاء حساب",
        alreadyHaveAccount: "لديك حساب بالفعل؟",
        signIn: "تسجيل الدخول",
        passwordsDoNotMatch: "كلمات المرور غير متطابقة",
        registrationFailed: "فشل التسجيل. يرجى المحاولة مرة أخرى.",
      },
      en: {
        createAccount: "Create your account",
        username: "Username",
        email: "Email",
        firstName: "First Name",
        lastName: "Last Name",
        password: "Password",
        confirmPassword: "Confirm Password",
        creatingAccount: "Creating account...",
        createAccountButton: "Create account",
        alreadyHaveAccount: "Already have an account?",
        signIn: "Sign in",
        passwordsDoNotMatch: "Passwords do not match",
        registrationFailed: "Registration failed. Please try again.",
      },
    }),
    []
  );

  const t = translations[language];

  // Redirect if already authenticated
  useEffect(() => {
    if (mounted && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [mounted, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.password2) {
      setError(t.passwordsDoNotMatch);
      return;
    }

    setLoading(true);

    const result = await register({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      password2: formData.password2,
      first_name: formData.first_name || undefined,
      last_name: formData.last_name || undefined,
    });

    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.error || t.registrationFailed);
    }

    setLoading(false);
  };

  if (!mounted) {
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

      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg w-full">
          {/* Card Container */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
            {/* Header Section with Gradient */}
            <div className="bg-gradient-to-r from-primary-dark via-primary-dark to-primary-yellow px-8 py-10 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4 backdrop-blur-sm">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {t.createAccount}
              </h2>
              <p className="text-white/90 text-sm">
                {language === "ar"
                  ? "انضم إلينا وابدأ رحلتك"
                  : "Join us and start your journey"}
              </p>
            </div>

            {/* Form Section */}
            <div className="px-8 py-8">
              <form className="space-y-5" onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r-lg flex items-start gap-3 animate-fade-in">
                    <svg
                      className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                )}

                {/* Username Field */}
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    {t.username} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
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
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-yellow focus:border-primary-dark outline-none transition-all text-gray-900 placeholder-gray-400"
                      placeholder={t.username}
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    {t.email} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-yellow focus:border-primary-dark outline-none transition-all text-gray-900 placeholder-gray-400"
                      placeholder={t.email}
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* First Name and Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="first_name"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      {t.firstName}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          className="h-5 w-5 text-gray-400"
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
                      <input
                        id="first_name"
                        name="first_name"
                        type="text"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-yellow focus:border-primary-dark outline-none transition-all text-gray-900 placeholder-gray-400"
                        placeholder={t.firstName}
                        value={formData.first_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            first_name: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="last_name"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      {t.lastName}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          className="h-5 w-5 text-gray-400"
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
                      <input
                        id="last_name"
                        name="last_name"
                        type="text"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-yellow focus:border-primary-dark outline-none transition-all text-gray-900 placeholder-gray-400"
                        placeholder={t.lastName}
                        value={formData.last_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            last_name: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    {t.password} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      minLength={8}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-yellow focus:border-primary-dark outline-none transition-all text-gray-900 placeholder-gray-400"
                      placeholder={t.password}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {language === "ar"
                      ? "يجب أن تكون كلمة المرور 8 أحرف على الأقل"
                      : "Password must be at least 8 characters"}
                  </p>
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label
                    htmlFor="password2"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    {t.confirmPassword} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    </div>
                    <input
                      id="password2"
                      name="password2"
                      type="password"
                      required
                      minLength={8}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-yellow focus:border-primary-dark outline-none transition-all text-gray-900 placeholder-gray-400"
                      placeholder={t.confirmPassword}
                      value={formData.password2}
                      onChange={(e) =>
                        setFormData({ ...formData, password2: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-base font-semibold rounded-lg text-white bg-gradient-to-r from-primary-dark to-primary-dark hover:from-primary-dark/90 hover:to-primary-dark/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-yellow disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        {t.creatingAccount}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        {t.createAccountButton}
                        <svg
                          className="w-5 h-5 group-hover:translate-x-1 transition-transform"
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
                      </span>
                    )}
                  </button>
                </div>

                {/* Sign In Link */}
                <div className="text-center pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    {t.alreadyHaveAccount}{" "}
                    <Link
                      href="/login"
                      className="font-semibold text-primary-dark hover:text-primary-yellow transition-colors inline-flex items-center gap-1"
                    >
                      {t.signIn}
                      <svg
                        className="w-4 h-4"
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
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer language={language} />
    </div>
  );
}
