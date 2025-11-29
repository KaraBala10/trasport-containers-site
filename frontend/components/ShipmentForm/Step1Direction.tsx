"use client";

import { motion } from "framer-motion";
import { ShippingDirection } from "@/types/shipment";

interface Step1DirectionProps {
  direction: ShippingDirection | null;
  onDirectionChange: (direction: ShippingDirection) => void;
  language: "ar" | "en";
}

export default function Step1Direction({
  direction,
  onDirectionChange,
  language,
}: Step1DirectionProps) {
  const translations = {
    ar: {
      euToSy: {
        title: "من أوروبا إلى الشرق الأوسط",
        description:
          "تجميع من أوروبا، الشحن إلى Bergen op Zoom (هولندا)، ثم إلى الشرق الأوسط",
      },
      syToEu: {
        title: "من الشرق الأوسط إلى أوروبا",
        description:
          "تجميع من المحافظات، حلب، الشحن إلى Bergen op Zoom (هولندا)، ثم إلى أوروبا",
      },
      continue: "متابعة",
    },
    en: {
      euToSy: {
        title: "Europe to Middle East",
        description:
          "Collection from Europe, shipping to Bergen op Zoom (Netherlands), then to Middle East",
      },
      syToEu: {
        title: "Middle East to Europe",
        description:
          "Collection from Provinces, Aleppo, shipping to Bergen op Zoom (Netherlands), then to Europe",
      },
      continue: "Continue",
    },
  };

  const t = translations[language];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
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
      className="space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* EU → SY Option */}
        <motion.button
          variants={cardVariants}
          onClick={() => onDirectionChange("eu-sy")}
          className={`
            group relative w-full p-10 rounded-3xl border-2 transition-all duration-500
            overflow-hidden
            ${
              direction === "eu-sy"
                ? "border-primary-yellow bg-gradient-to-br from-primary-yellow/10 to-primary-yellow/5 shadow-2xl shadow-primary-yellow/20"
                : "border-gray-200 bg-white hover:border-primary-dark/30 hover:shadow-xl"
            }
          `}
          whileHover={{
            scale: direction === "eu-sy" ? 1 : 1.02,
            y: direction === "eu-sy" ? 0 : -5,
          }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Background gradient effect */}
          <div
            className={`
            absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
            bg-gradient-to-br from-primary-dark/5 to-transparent
            ${direction === "eu-sy" ? "opacity-100" : ""}
          `}
          />

          {/* Content */}
          <div className="relative z-10">
            {/* Icon */}
            <div className="mb-6 flex justify-center">
              <motion.div
                className={`
                  w-20 h-20 rounded-full flex items-center justify-center
                  transition-all duration-500
                  ${
                    direction === "eu-sy"
                      ? "bg-primary-yellow text-primary-dark"
                      : "bg-gray-100 text-gray-400 group-hover:bg-primary-dark/10 group-hover:text-primary-dark"
                  }
                `}
                animate={{
                  rotate: direction === "eu-sy" ? [0, 5, -5, 0] : 0,
                }}
                transition={{
                  duration: 2,
                  repeat: direction === "eu-sy" ? Infinity : 0,
                  repeatDelay: 3,
                }}
              >
                <svg
                  className="w-10 h-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                  />
                </svg>
              </motion.div>
            </div>

            {/* Title */}
            <h3
              className={`
              text-2xl font-bold mb-3 text-center transition-colors duration-300
              ${
                direction === "eu-sy"
                  ? "text-primary-dark"
                  : "text-gray-800 group-hover:text-primary-dark"
              }
            `}
            >
              {t.euToSy.title}
            </h3>

            {/* Description */}
            <p
              className={`
              text-sm text-center leading-relaxed transition-colors duration-300
              ${
                direction === "eu-sy"
                  ? "text-gray-700"
                  : "text-gray-500 group-hover:text-gray-700"
              }
            `}
            >
              {t.euToSy.description}
            </p>

            {/* Checkmark indicator */}
            {direction === "eu-sy" && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                className="absolute top-4 right-4 w-8 h-8 bg-primary-yellow rounded-full flex items-center justify-center shadow-lg"
              >
                <svg
                  className="w-5 h-5 text-primary-dark"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </motion.div>
            )}
          </div>
        </motion.button>

        {/* SY → EU Option */}
        <motion.button
          variants={cardVariants}
          onClick={() => onDirectionChange("sy-eu")}
          className={`
            group relative w-full p-10 rounded-3xl border-2 transition-all duration-500
            overflow-hidden
            ${
              direction === "sy-eu"
                ? "border-primary-yellow bg-gradient-to-br from-primary-yellow/10 to-primary-yellow/5 shadow-2xl shadow-primary-yellow/20"
                : "border-gray-200 bg-white hover:border-primary-dark/30 hover:shadow-xl"
            }
          `}
          whileHover={{
            scale: direction === "sy-eu" ? 1 : 1.02,
            y: direction === "sy-eu" ? 0 : -5,
          }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Background gradient effect */}
          <div
            className={`
            absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
            bg-gradient-to-br from-primary-dark/5 to-transparent
            ${direction === "sy-eu" ? "opacity-100" : ""}
          `}
          />

          {/* Content */}
          <div className="relative z-10">
            {/* Icon */}
            <div className="mb-6 flex justify-center">
              <motion.div
                className={`
                  w-20 h-20 rounded-full flex items-center justify-center
                  transition-all duration-500
                  ${
                    direction === "sy-eu"
                      ? "bg-primary-yellow text-primary-dark"
                      : "bg-gray-100 text-gray-400 group-hover:bg-primary-dark/10 group-hover:text-primary-dark"
                  }
                `}
                animate={{
                  rotate: direction === "sy-eu" ? [0, -5, 5, 0] : 0,
                }}
                transition={{
                  duration: 2,
                  repeat: direction === "sy-eu" ? Infinity : 0,
                  repeatDelay: 3,
                }}
              >
                <svg
                  className="w-10 h-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                  />
                </svg>
              </motion.div>
            </div>

            {/* Title */}
            <h3
              className={`
              text-2xl font-bold mb-3 text-center transition-colors duration-300
              ${
                direction === "sy-eu"
                  ? "text-primary-dark"
                  : "text-gray-800 group-hover:text-primary-dark"
              }
            `}
            >
              {t.syToEu.title}
            </h3>

            {/* Description */}
            <p
              className={`
              text-sm text-center leading-relaxed transition-colors duration-300
              ${
                direction === "sy-eu"
                  ? "text-gray-700"
                  : "text-gray-500 group-hover:text-gray-700"
              }
            `}
            >
              {t.syToEu.description}
            </p>

            {/* Checkmark indicator */}
            {direction === "sy-eu" && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                className="absolute top-4 right-4 w-8 h-8 bg-primary-yellow rounded-full flex items-center justify-center shadow-lg"
              >
                <svg
                  className="w-5 h-5 text-primary-dark"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </motion.div>
            )}
          </div>
        </motion.button>
      </div>
    </motion.div>
  );
}
