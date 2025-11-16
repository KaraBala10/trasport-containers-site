'use client';

import { useState, useEffect } from 'react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useReCaptcha } from '@/components/ReCaptchaWrapper';

type AuthMode = 'signin' | 'signup';

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [language, setLanguage] = useState<'ar' | 'en'>('en');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRTL = language === 'ar';

  // Update document direction when language changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
      document.documentElement.lang = language;
    }
  }, [language, isRTL]);

  const translations = {
    en: {
      signIn: 'Sign In',
      signUp: 'Sign Up',
      email: 'Email',
      password: 'Password',
      fullName: 'Full Name',
      phone: 'Phone Number',
      confirmPassword: 'Confirm Password',
      forgotPassword: 'Forgot Password?',
      rememberMe: 'Remember Me',
      alreadyHaveAccount: 'Already have an account?',
      dontHaveAccount: "Don't have an account?",
      switchToSignUp: 'Sign Up',
      switchToSignIn: 'Sign In',
      submit: 'Submit',
      siteName: 'MEDO-FREIGHT.EU',
      tagline: 'Freight · Route · Deliver',
    },
    ar: {
      signIn: 'تسجيل الدخول',
      signUp: 'إنشاء حساب',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      fullName: 'الاسم الكامل',
      phone: 'رقم الهاتف',
      confirmPassword: 'تأكيد كلمة المرور',
      forgotPassword: 'نسيت كلمة المرور؟',
      rememberMe: 'تذكرني',
      alreadyHaveAccount: 'لديك حساب بالفعل؟',
      dontHaveAccount: 'ليس لديك حساب؟',
      switchToSignUp: 'إنشاء حساب',
      switchToSignIn: 'تسجيل الدخول',
      submit: 'إرسال',
      siteName: 'MEDO-FREIGHT.EU',
      tagline: 'شحن · طريق · توصيل',
    },
  };

  const t = translations[language];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Get reCAPTCHA from context - safely handles if not available
  const { executeRecaptcha } = useReCaptcha();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Verify reCAPTCHA (optional - only if available)
      let recaptchaToken = '';
      
      if (executeRecaptcha) {
        try {
          recaptchaToken = await executeRecaptcha('submit');
        } catch (recaptchaError) {
          console.warn('reCAPTCHA verification failed:', recaptchaError);
          // If reCAPTCHA key is configured, require it in production
          if (process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && process.env.NODE_ENV === 'production') {
            throw new Error('reCAPTCHA verification is required');
          }
          // Otherwise, continue without reCAPTCHA (development mode)
          console.log('Continuing without reCAPTCHA (development mode)');
        }
      } else {
        // No reCAPTCHA available - this is OK in development
        console.log('reCAPTCHA not configured, skipping verification');
      }

      // TODO: Connect to backend API with recaptchaToken
      console.log('Form submitted:', { mode, formData, hasRecaptcha: !!recaptchaToken });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success message (remove in production)
      if (language === 'ar') {
        alert('تم الإرسال بنجاح! (في الإنتاج سيتم إرسال البيانات للخادم)');
      } else {
        alert('Submitted successfully! (In production, data will be sent to server)');
      }
      
    } catch (error) {
      console.error('Form submission error:', error);
      alert(language === 'ar' ? 'حدث خطأ في التحقق. يرجى المحاولة مرة أخرى.' : 'Verification error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Language Switcher */}
        <div className={`mb-6 flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
          <LanguageSwitcher language={language} setLanguage={setLanguage} />
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Logo Placeholder */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-primary-dark mb-2">{t.siteName}</h1>
            <p className="text-sm text-gray-600">{t.tagline}</p>
          </div>

          {/* Toggle Buttons */}
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setMode('signin')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                mode === 'signin'
                  ? 'bg-primary-dark text-white shadow-md'
                  : 'text-gray-600 hover:text-primary-dark'
              }`}
            >
              {t.signIn}
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                mode === 'signup'
                  ? 'bg-primary-dark text-white shadow-md'
                  : 'text-gray-600 hover:text-primary-dark'
              }`}
            >
              {t.signUp}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    {t.fullName}
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required={mode === 'signup'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-yellow focus:border-primary-dark outline-none transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    {t.phone}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required={mode === 'signup'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-yellow focus:border-primary-dark outline-none transition-all"
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t.email}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-yellow focus:border-primary-dark outline-none transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                {t.password}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-yellow focus:border-primary-dark outline-none transition-all"
              />
            </div>

            {mode === 'signup' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  {t.confirmPassword}
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required={mode === 'signup'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-yellow focus:border-primary-dark outline-none transition-all"
                />
              </div>
            )}

            {mode === 'signin' && (
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-primary-dark border-gray-300 rounded focus:ring-primary-yellow"
                  />
                  <span className={`${isRTL ? 'mr-2' : 'ml-2'} text-sm text-gray-600`}>{t.rememberMe}</span>
                </label>
                <a href="#" className="text-sm text-primary-dark hover:text-primary-yellow transition-colors">
                  {t.forgotPassword}
                </a>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary-dark text-white py-3 px-4 rounded-md font-medium hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:ring-offset-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting 
                ? (language === 'ar' ? 'جاري الإرسال...' : 'Submitting...')
                : (mode === 'signin' ? t.signIn : t.signUp)
              }
            </button>

            <div className="text-center mt-4">
              <span className="text-sm text-gray-600">
                {mode === 'signin' ? t.dontHaveAccount : t.alreadyHaveAccount}{' '}
                <button
                  type="button"
                  onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                  className="text-primary-dark font-medium hover:text-primary-yellow transition-colors"
                >
                  {mode === 'signin' ? t.switchToSignUp : t.switchToSignIn}
                </button>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

