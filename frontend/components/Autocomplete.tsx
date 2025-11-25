"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AutocompleteOption {
  value: string;
  label: string;
  labelAr?: string;
}

interface AutocompleteProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: AutocompleteOption[];
  placeholder: string;
  disabled?: boolean;
  error?: string;
  language?: "ar" | "en";
  required?: boolean;
}

export default function Autocomplete({
  name,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  error,
  language = "en",
  required = false,
}: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get display label for selected value
  const getDisplayLabel = (val: string) => {
    if (!val) return "";
    const option = options.find((opt) => opt.value === val);
    // If not in options, return the value as-is (free text)
    if (!option) return val;
    return language === "ar" && option.labelAr ? option.labelAr : option.label;
  };

  // Filter options based on search term
  const filteredOptions = options.filter((option) => {
    const searchLower = searchTerm.toLowerCase();
    const labelToSearch =
      language === "ar" && option.labelAr ? option.labelAr : option.label;
    return (
      labelToSearch.toLowerCase().includes(searchLower) ||
      option.value.toLowerCase().includes(searchLower)
    );
  });

  // Update search term when value changes externally
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm(getDisplayLabel(value));
    }
  }, [value, isOpen, language]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm(getDisplayLabel(value));
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setIsOpen(true);
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex].value);
        } else if (searchTerm) {
          // Accept free text input
          onChange(searchTerm);
          setIsOpen(false);
          inputRef.current?.blur();
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSearchTerm(getDisplayLabel(value));
        break;
    }
  };

  // Handle option selection
  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setSearchTerm(getDisplayLabel(selectedValue));
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.blur();
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setIsOpen(true);
    setHighlightedIndex(-1);

    // Update value directly - allow free text
    onChange(newValue);
  };

  // Handle input focus
  const handleFocus = () => {
    if (!disabled) {
      setIsOpen(true);
      // Keep current search term to allow editing
    }
  };

  // Handle input blur - save whatever is typed
  const handleBlur = () => {
    setTimeout(() => {
      setIsOpen(false);
      // Keep the search term as-is (allows free text)
      if (searchTerm) {
        onChange(searchTerm);
      }
    }, 200); // Delay to allow click on option
  };

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[
        highlightedIndex
      ] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [highlightedIndex]);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          name={name}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-4 py-3 pr-10 border rounded-xl transition-all focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow ${
            error
              ? "border-red-500 bg-red-50"
              : "border-gray-300 hover:border-primary-yellow/50"
          } ${
            disabled
              ? "bg-gray-100 cursor-not-allowed opacity-60"
              : "bg-white"
          }`}
          autoComplete="off"
        />
        
        {/* Dropdown Icon */}
        <button
          type="button"
          onClick={() => {
            if (!disabled) {
              if (isOpen) {
                setIsOpen(false);
              } else {
                setIsOpen(true);
                inputRef.current?.focus();
              }
            }
          }}
          disabled={disabled}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          tabIndex={-1}
        >
          <motion.svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </motion.svg>
        </button>
      </div>

      {/* Dropdown List */}
      <AnimatePresence>
        {isOpen && filteredOptions.length > 0 && (
          <motion.div
            ref={listRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-xl shadow-2xl max-h-64 overflow-y-auto"
          >
            {filteredOptions.map((option, index) => {
              const displayLabel =
                language === "ar" && option.labelAr
                  ? option.labelAr
                  : option.label;
              const isSelected = option.value === value;
              const isHighlighted = index === highlightedIndex;

              return (
                <motion.button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`w-full px-4 py-3 text-left hover:bg-primary-yellow/10 transition-colors flex items-center justify-between ${
                    isHighlighted ? "bg-primary-yellow/20" : ""
                  } ${isSelected ? "bg-primary-yellow/30 font-semibold" : ""}`}
                  whileHover={{ x: language === "ar" ? -4 : 4 }}
                >
                  <span className="text-gray-800">{displayLabel}</span>
                  {isSelected && (
                    <svg
                      className="w-5 h-5 text-primary-dark"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Results Message */}
      <AnimatePresence>
        {isOpen && filteredOptions.length === 0 && searchTerm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-xl shadow-2xl p-4 text-center"
          >
            <p className="text-gray-500 mb-1">
              {language === "ar" ? "لا توجد نتائج مطابقة" : "No matching results"}
            </p>
            <p className="text-sm text-primary-dark font-semibold">
              {language === "ar" 
                ? `✓ سيتم استخدام: "${searchTerm}"` 
                : `✓ Will use: "${searchTerm}"`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-600 text-sm mt-1 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </motion.p>
      )}

      {/* Helper Text */}
      {!error && !disabled && (
        <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {language === "ar" 
            ? "يمكنك الاختيار من القائمة أو كتابة اسم جديد" 
            : "You can select from list or type a new name"}
        </p>
      )}
    </div>
  );
}

