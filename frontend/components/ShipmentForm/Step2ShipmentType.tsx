"use client";

import { motion } from 'framer-motion';
import { ShipmentType } from '@/types/shipment';

interface Step2ShipmentTypeProps {
  selectedTypes: ShipmentType[];
  onTypesChange: (types: ShipmentType[]) => void;
  language: 'ar' | 'en';
}

export default function Step2ShipmentType({
  selectedTypes,
  onTypesChange,
  language,
}: Step2ShipmentTypeProps) {
  const translations = {
    ar: {
      title: 'اختر نوع الشحنة',
      parcelLCL: {
        title: 'طرود LCL',
        description: 'طرود عادية، ملابس، أحذية، أغراض شخصية',
        icon: '📦',
      },
      electronics: {
        title: 'إلكترونيات',
        description: 'موبايل، لابتوب، كاميرا، أجهزة إلكترونية',
        icon: '📱',
      },
      largeItems: {
        title: 'قطع كبيرة',
        description: 'أثاث، أجهزة منزلية كبيرة، براد، غسالة',
        icon: '🪑',
      },
      businessLCL: {
        title: 'شحن تجاري LCL',
        description: 'بضائع تجارية، باليتات، شحنات شركات',
        icon: '🏢',
      },
    },
    en: {
      title: 'Select Shipment Type',
      parcelLCL: {
        title: 'Parcel LCL',
        description: 'Regular parcels, clothes, shoes, personal items',
        icon: '📦',
      },
      electronics: {
        title: 'Electronics',
        description: 'Mobile phones, laptops, cameras, electronic devices',
        icon: '📱',
      },
      largeItems: {
        title: 'Large Items',
        description: 'Furniture, large appliances, refrigerator, washing machine',
        icon: '🪑',
      },
      businessLCL: {
        title: 'Business LCL',
        description: 'Commercial goods, pallets, company shipments',
        icon: '🏢',
      },
    },
  };

  const t = translations[language];

  const shipmentTypes: { id: ShipmentType; translations: typeof t.parcelLCL }[] = [
    { id: 'parcel-lcl', translations: t.parcelLCL },
    { id: 'electronics', translations: t.electronics },
    { id: 'large-items', translations: t.largeItems },
    { id: 'business-lcl', translations: t.businessLCL },
  ];

  const toggleType = (type: ShipmentType) => {
    if (selectedTypes.includes(type)) {
      onTypesChange(selectedTypes.filter(t => t !== type));
    } else {
      onTypesChange([...selectedTypes, type]);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {shipmentTypes.map((type) => {
          const isSelected = selectedTypes.includes(type.id);
          
          return (
            <motion.div
              key={type.id}
              variants={cardVariants}
              onClick={() => toggleType(type.id)}
              className={`
                relative cursor-pointer rounded-2xl p-6 border-2 transition-all duration-300
                ${isSelected
                  ? 'bg-gradient-to-br from-primary-yellow/20 to-primary-yellow/10 border-primary-yellow shadow-xl scale-105'
                  : 'bg-white border-gray-200 hover:border-primary-dark/30 hover:shadow-lg'
                }
              `}
              whileHover={{ scale: isSelected ? 1.05 : 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-4 right-4 w-8 h-8 bg-primary-yellow rounded-full flex items-center justify-center shadow-lg"
                >
                  <motion.svg
                    className="w-5 h-5 text-primary-dark"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </motion.svg>
                </motion.div>
              )}

              {/* Icon */}
              <div className="text-5xl mb-4">{type.translations.icon}</div>

              {/* Title */}
              <h3 className={`text-xl font-bold mb-2 ${isSelected ? 'text-primary-dark' : 'text-gray-800'}`}>
                {type.translations.title}
              </h3>

              {/* Description */}
              <p className={`text-sm ${isSelected ? 'text-gray-700' : 'text-gray-600'}`}>
                {type.translations.description}
              </p>

              {/* Hover Glow Effect */}
              {!isSelected && (
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-primary-yellow/0 hover:bg-primary-yellow/5 transition-colors duration-300"
                  initial={false}
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

