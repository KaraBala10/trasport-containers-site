"use client";

import { motion } from 'framer-motion';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  language: 'ar' | 'en';
}

export default function ProgressBar({ currentStep, totalSteps, language }: ProgressBarProps) {
  const progress = (currentStep / totalSteps) * 100;

  const translations = {
    ar: {
      step: 'خطوة',
      of: 'من',
    },
    en: {
      step: 'Step',
      of: 'of',
    },
  };

  const t = translations[language];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">
          {t.step} {currentStep} {t.of} {totalSteps}
        </span>
        <span className="text-sm font-medium text-primary-dark">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-primary-dark to-primary-yellow rounded-full"
        />
      </div>
    </div>
  );
}

