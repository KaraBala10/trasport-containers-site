"use client";

import { motion } from 'framer-motion';
import { ShipmentDirection } from '@/types/shipment';

interface DirectionCardProps {
  direction: ShipmentDirection;
  icon: string;
  title: string;
  subtitle: string;
  features: string[];
  isSelected: boolean;
  onClick: () => void;
  language: 'ar' | 'en';
}

export default function DirectionCard({
  direction,
  icon,
  title,
  subtitle,
  features,
  isSelected,
  onClick,
  language,
}: DirectionCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -8 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className={`
        relative cursor-pointer rounded-3xl overflow-hidden
        transition-all duration-500 group
        ${isSelected 
          ? 'shadow-2xl ring-4 ring-primary-yellow' 
          : 'shadow-lg hover:shadow-2xl'
        }
      `}
    >
      {/* Background Gradient */}
      <div className={`
        absolute inset-0 transition-all duration-500
        ${isSelected
          ? 'bg-gradient-to-br from-primary-dark via-blue-900 to-blue-800'
          : 'bg-gradient-to-br from-white via-blue-50 to-indigo-50 group-hover:from-blue-50 group-hover:via-indigo-50 group-hover:to-purple-50'
        }
      `} />

      {/* Animated Border */}
      <div className={`
        absolute inset-0 rounded-3xl border-4 transition-colors duration-500
        ${isSelected ? 'border-primary-yellow' : 'border-gray-200 group-hover:border-primary-dark'}
      `} />

      {/* Content */}
      <div className="relative p-10">
        {/* Selected Badge */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            className="absolute top-6 right-6 bg-primary-yellow text-primary-dark rounded-full w-14 h-14 flex items-center justify-center shadow-lg z-10"
          >
            <span className="text-2xl font-bold">✓</span>
          </motion.div>
        )}

        {/* Icon with Animation */}
        <motion.div
          animate={{ 
            rotate: isSelected ? [0, -10, 10, -10, 0] : 0,
            scale: isSelected ? [1, 1.1, 1] : 1
          }}
          transition={{ duration: 0.5 }}
          className="text-8xl mb-6 text-center"
        >
          {icon}
        </motion.div>

        {/* Title */}
        <h3 className={`
          text-3xl font-black text-center mb-3 transition-colors duration-300
          ${isSelected ? 'text-white' : 'text-primary-dark'}
        `}>
          {title}
        </h3>

        {/* Subtitle */}
        <p className={`
          text-lg text-center mb-8 font-medium transition-colors duration-300
          ${isSelected ? 'text-blue-100' : 'text-blue-600'}
        `}>
          {subtitle}
        </p>

        {/* Features List */}
        <div className="space-y-4">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: language === 'ar' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                flex items-center gap-4 p-4 rounded-2xl transition-all duration-300
                ${isSelected 
                  ? 'bg-white/10 backdrop-blur-sm' 
                  : 'bg-white/50 group-hover:bg-white/80'
                }
              `}
            >
              <div className={`
                flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold
                ${isSelected ? 'bg-primary-yellow text-primary-dark' : 'bg-primary-dark text-white'}
              `}>
                ✓
              </div>
              <span className={`
                text-lg font-medium ${language === 'ar' ? 'text-right' : 'text-left'}
                ${isSelected ? 'text-white' : 'text-gray-800'}
              `}>
                {feature}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Glow Effect */}
        {isSelected && (
          <div className="absolute -inset-1 bg-gradient-to-r from-primary-yellow to-blue-400 rounded-3xl blur-2xl opacity-30 -z-10 animate-pulse" />
        )}
      </div>
    </motion.div>
  );
}

