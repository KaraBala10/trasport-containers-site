"use client";

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface FormContainerProps {
  children: ReactNode;
}

export default function FormContainer({ children }: FormContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-7xl mx-auto px-4 py-8"
    >
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-gray-100">
        <div className="p-8 md:p-12">
          {children}
        </div>
      </div>
    </motion.div>
  );
}

