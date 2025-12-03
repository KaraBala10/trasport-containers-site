"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (value: string) => void;
  title: string;
  message?: string;
  placeholder?: string;
  defaultValue?: string;
  type?: "text" | "number" | "textarea";
  required?: boolean;
  language?: "ar" | "en";
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

export default function Dialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  placeholder,
  defaultValue = "",
  type = "text",
  required = false,
  language = "en",
  confirmText,
  cancelText,
  showCancel = true,
}: DialogProps) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const [inputValue, setInputValue] = useState(defaultValue);
  const isRTL = language === "ar";

  useEffect(() => {
    if (isOpen) {
      setInputValue(defaultValue);
      // Focus input after animation
      setTimeout(() => {
        inputRef.current?.focus();
        if (inputRef.current && type === "text") {
          (inputRef.current as HTMLInputElement).select();
        }
      }, 100);
    }
  }, [isOpen, defaultValue, type]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleConfirm = () => {
    if (required && !inputValue.trim()) {
      return;
    }
    if (onConfirm) {
      onConfirm(inputValue);
    }
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancel}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full max-w-md bg-white rounded-2xl shadow-2xl border-2 border-gray-200 overflow-hidden ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <h3 className="text-xl font-bold text-white">{title}</h3>
                {message && (
                  <p className="text-sm text-blue-100 mt-1">{message}</p>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                {type === "textarea" ? (
                  <textarea
                    ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.ctrlKey) {
                        handleConfirm();
                      }
                    }}
                    placeholder={placeholder}
                    rows={6}
                    className={`w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  />
                ) : (
                  <input
                    ref={inputRef as React.RefObject<HTMLInputElement>}
                    type={type}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleConfirm();
                      }
                    }}
                    placeholder={placeholder}
                    className={`w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  />
                )}
              </div>

              {/* Footer */}
              <div
                className={`px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 ${
                  isRTL ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {showCancel && (
                  <button
                    onClick={handleCancel}
                    className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                  >
                    {cancelText || (language === "ar" ? "إلغاء" : "Cancel")}
                  </button>
                )}
                <button
                  onClick={handleConfirm}
                  disabled={required && !inputValue.trim()}
                  className={`px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                    isRTL ? "mr-auto" : "ml-auto"
                  }`}
                >
                  {confirmText || (language === "ar" ? "تأكيد" : "Confirm")}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

