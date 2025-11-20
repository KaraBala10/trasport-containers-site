"use client";

import { motion } from 'framer-motion';

interface NavigationButtonsProps {
  onPrevious?: () => void;
  onNext?: () => void;
  onSubmit?: () => void;
  showPrevious?: boolean;
  showNext?: boolean;
  showSubmit?: boolean;
  nextDisabled?: boolean;
  submitDisabled?: boolean;
  language: 'ar' | 'en';
  isLoading?: boolean;
}

export default function NavigationButtons({
  onPrevious,
  onNext,
  onSubmit,
  showPrevious = false,
  showNext = true,
  showSubmit = false,
  nextDisabled = false,
  submitDisabled = false,
  language,
  isLoading = false,
}: NavigationButtonsProps) {
  const translations = {
    ar: {
      previous: 'السابق',
      next: 'متابعة',
      submit: 'تأكيد الشحنة',
    },
    en: {
      previous: 'Previous',
      next: 'Continue',
      submit: 'Confirm Shipment',
    },
  };

  const t = translations[language];

  return (
    <div className={`flex gap-4 mt-12 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
      {showPrevious && onPrevious && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onPrevious}
          className="flex-1 px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <span className="flex items-center justify-center gap-2">
            {language === 'ar' ? '→' : '←'} {t.previous}
          </span>
        </motion.button>
      )}

      {showNext && onNext && (
        <motion.button
          whileHover={{ scale: nextDisabled ? 1 : 1.02 }}
          whileTap={{ scale: nextDisabled ? 1 : 0.98 }}
          onClick={onNext}
          disabled={nextDisabled}
          className={`
            flex-1 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg
            ${nextDisabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-primary-dark to-blue-700 hover:from-blue-700 hover:to-primary-dark text-white shadow-2xl hover:shadow-primary-yellow/50'
            }
          `}
        >
          <span className="flex items-center justify-center gap-2">
            {t.next} {language === 'ar' ? '←' : '→'}
          </span>
        </motion.button>
      )}

      {showSubmit && onSubmit && (
        <motion.button
          whileHover={{ scale: submitDisabled || isLoading ? 1 : 1.02 }}
          whileTap={{ scale: submitDisabled || isLoading ? 1 : 0.98 }}
          onClick={onSubmit}
          disabled={submitDisabled || isLoading}
          className={`
            flex-1 px-8 py-5 rounded-2xl font-black text-xl transition-all duration-300 shadow-2xl
            ${submitDisabled || isLoading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-emerald-600 hover:to-green-500 text-white animate-pulse hover:animate-none shadow-green-500/50'
            }
          `}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 border-4 border-white border-t-transparent rounded-full"
              />
              {language === 'ar' ? 'جاري المعالجة...' : 'Processing...'}
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              ✓ {t.submit}
            </span>
          )}
        </motion.button>
      )}
    </div>
  );
}

