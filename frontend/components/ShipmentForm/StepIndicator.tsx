"use client";

import { motion } from 'framer-motion';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  language: 'ar' | 'en';
}

export default function StepIndicator({ currentStep, totalSteps, language }: StepIndicatorProps) {
  const steps = [
    { ar: 'الاتجاه', en: 'Direction', icon: '🔄' },
    { ar: 'العميل', en: 'Client', icon: '👤' },
    { ar: 'الطرود', en: 'Packages', icon: '📦' },
    { ar: 'الخدمات', en: 'Services', icon: '⚙️' },
    { ar: 'السعر', en: 'Price', icon: '💰' },
    { ar: 'المراجعة', en: 'Review', icon: '✓' },
    { ar: 'الدفع', en: 'Payment', icon: '💳' },
  ];

  return (
    <div className="w-full py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Progress Bar */}
        <div className="relative mb-8">
          {/* Background Track */}
          <div className="absolute top-6 left-0 right-0 h-2 bg-gray-200 rounded-full" />
          
          {/* Active Progress */}
          <motion.div
            className="absolute top-6 left-0 h-2 bg-gradient-to-r from-primary-dark via-blue-600 to-primary-yellow rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />

          {/* Steps */}
          <div className="relative flex justify-between">
            {steps.map((step, index) => {
              const stepNumber = index + 1;
              const isCompleted = stepNumber < currentStep;
              const isCurrent = stepNumber === currentStep;
              const isPending = stepNumber > currentStep;

              return (
                <div key={index} className="flex flex-col items-center">
                  {/* Circle */}
                  <motion.div
                    initial={false}
                    animate={{
                      scale: isCurrent ? [1, 1.2, 1] : 1,
                      rotate: isCurrent ? [0, 10, -10, 0] : 0,
                    }}
                    transition={{ duration: 0.5 }}
                    className={`
                      relative z-10 w-14 h-14 rounded-full flex items-center justify-center
                      font-bold text-lg transition-all duration-300 shadow-lg
                      ${isCompleted 
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white ring-4 ring-green-200' 
                        : isCurrent
                        ? 'bg-gradient-to-br from-primary-dark to-blue-700 text-white ring-4 ring-primary-yellow shadow-2xl'
                        : 'bg-white text-gray-400 border-4 border-gray-300'
                      }
                    `}
                  >
                    {isCompleted ? (
                      <motion.span
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-2xl"
                      >
                        ✓
                      </motion.span>
                    ) : (
                      <span className="text-2xl">{step.icon}</span>
                    )}
                    
                    {/* Pulse Animation for Current Step */}
                    {isCurrent && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-primary-yellow opacity-30"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </motion.div>

                  {/* Label */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`
                      mt-3 text-center font-bold transition-all duration-300
                      ${isCurrent ? 'text-primary-dark text-lg scale-110' : 'text-gray-600 text-sm'}
                    `}
                  >
                    {language === 'ar' ? step.ar : step.en}
                  </motion.div>

                  {/* Step Number Badge */}
                  {!isCompleted && (
                    <div className={`
                      mt-1 text-xs font-bold px-2 py-1 rounded-full
                      ${isCurrent ? 'bg-primary-yellow text-primary-dark' : 'bg-gray-200 text-gray-500'}
                    `}>
                      {stepNumber}/{totalSteps}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress Percentage */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-block bg-gradient-to-r from-primary-dark to-blue-700 text-white px-6 py-2 rounded-full shadow-lg"
          >
            <span className="font-bold text-lg">
              {Math.round((currentStep / totalSteps) * 100)}%{' '}
              {language === 'ar' ? 'مكتمل' : 'Complete'}
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
