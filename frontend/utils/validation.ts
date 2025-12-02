/**
 * Validation utility functions for form fields
 */

// Email validation
export const validateEmail = (email: string): string | null => {
  if (!email || email.trim() === "") {
    return "Email is required";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return "Please enter a valid email address";
  }
  return null;
};

// Phone validation
export const validatePhone = (phone: string): string | null => {
  if (!phone || phone.trim() === "") {
    return "Phone number is required";
  }
  // Allow digits, spaces, +, -, (, )
  const phoneRegex = /^[\d\s\+\-\(\)]+$/;
  if (!phoneRegex.test(phone.trim())) {
    return "Phone number can only contain digits, spaces, +, -, (, )";
  }
  // Remove non-digits for length check
  const digitsOnly = phone.replace(/\D/g, "");
  if (digitsOnly.length < 7) {
    return "Phone number must be at least 7 digits";
  }
  if (digitsOnly.length > 15) {
    return "Phone number is too long (max 15 digits)";
  }
  return null;
};

// Number validation (only digits)
export const validateNumber = (
  value: string,
  fieldName: string,
  min?: number,
  max?: number
): string | null => {
  if (!value || value.trim() === "") {
    return `${fieldName} is required`;
  }
  // Check if contains only digits and optional decimal point
  const numberRegex = /^-?\d*\.?\d+$/;
  if (!numberRegex.test(value.trim())) {
    return `${fieldName} must be a number`;
  }
  const numValue = parseFloat(value.trim());
  if (isNaN(numValue)) {
    return `${fieldName} must be a valid number`;
  }
  if (min !== undefined && numValue < min) {
    return `${fieldName} must be at least ${min}`;
  }
  if (max !== undefined && numValue > max) {
    return `${fieldName} must be at most ${max}`;
  }
  return null;
};

// Integer validation (only whole numbers)
export const validateInteger = (
  value: string,
  fieldName: string,
  min?: number,
  max?: number
): string | null => {
  if (!value || value.trim() === "") {
    return `${fieldName} is required`;
  }
  // Check if contains only digits (no decimal point)
  const integerRegex = /^-?\d+$/;
  if (!integerRegex.test(value.trim())) {
    return `${fieldName} must be a whole number`;
  }
  const intValue = parseInt(value.trim(), 10);
  if (isNaN(intValue)) {
    return `${fieldName} must be a valid number`;
  }
  if (min !== undefined && intValue < min) {
    return `${fieldName} must be at least ${min}`;
  }
  if (max !== undefined && intValue > max) {
    return `${fieldName} must be at most ${max}`;
  }
  return null;
};

// Required text field validation
export const validateRequired = (
  value: string,
  fieldName: string,
  minLength?: number,
  maxLength?: number
): string | null => {
  if (!value || value.trim() === "") {
    return `${fieldName} is required`;
  }
  if (minLength !== undefined && value.trim().length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  if (maxLength !== undefined && value.trim().length > maxLength) {
    return `${fieldName} must be at most ${maxLength} characters`;
  }
  return null;
};

// Weight validation
export const validateWeight = (weight: string | number): string | null => {
  const weightStr = typeof weight === "number" ? weight.toString() : weight;
  return validateNumber(weightStr, "Weight", 0.1, 1000);
};

// Dimension validation (length, width, height)
export const validateDimension = (
  dimension: string | number,
  fieldName: string
): string | null => {
  const dimStr =
    typeof dimension === "number" ? dimension.toString() : dimension;
  return validateNumber(dimStr, fieldName, 1, 300);
};

// Postal code validation
export const validatePostalCode = (
  postalCode: string,
  country?: string
): string | null => {
  if (!postalCode || postalCode.trim() === "") {
    return "Postal code is required";
  }
  const cleaned = postalCode.trim().replace(/[\s\-]/g, "");
  
  // Country-specific validation
  if (country === "DE") {
    // Germany: 5 digits
    if (!/^\d+$/.test(cleaned)) {
      return "German postal code must contain only digits";
    }
    if (cleaned.length > 5) {
      return "German postal code must be 5 digits or less";
    }
  } else if (country === "NL") {
    // Netherlands: 4 digits + 2 letters
    if (cleaned.length === 6) {
      const digits = cleaned.substring(0, 4);
      const letters = cleaned.substring(4, 6);
      if (!/^\d{4}$/.test(digits) || !/^[A-Za-z]{2}$/.test(letters)) {
        return "Dutch postal code must be 4 digits followed by 2 letters (e.g., 1012AB)";
      }
    } else if (cleaned.length === 4 && /^\d{4}$/.test(cleaned)) {
      // Allow just 4 digits (incomplete but valid format)
      return null;
    } else {
      return "Dutch postal code must be 4 digits followed by 2 letters (e.g., 1012AB)";
    }
  }
  
  // General validation: alphanumeric, max 20 chars
  if (cleaned.length > 20) {
    return "Postal code is too long";
  }
  if (!/^[A-Za-z0-9]+$/.test(cleaned)) {
    return "Postal code contains invalid characters";
  }
  
  return null;
};

// Prevent non-numeric input
export const handleNumericInput = (
  e: React.KeyboardEvent<HTMLInputElement>
): void => {
  const key = e.key;
  const input = e.currentTarget;
  const value = input.value;
  
  // Allow: backspace, delete, tab, escape, enter
  if (
    [8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
    // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    (e.keyCode === 65 && e.ctrlKey === true) ||
    (e.keyCode === 67 && e.ctrlKey === true) ||
    (e.keyCode === 86 && e.ctrlKey === true) ||
    (e.keyCode === 88 && e.ctrlKey === true) ||
    // Allow: home, end, left, right
    (e.keyCode >= 35 && e.keyCode <= 39)
  ) {
    return;
  }
  
  // Allow decimal point (.) but only one
  if (key === '.' || key === ',') {
    // Check if decimal point already exists
    if (value.includes('.')) {
      e.preventDefault();
    }
    return;
  }
  
  // Allow numbers (0-9) from both main keyboard and numpad
  if (
    (e.keyCode >= 48 && e.keyCode <= 57) || // 0-9 on main keyboard
    (e.keyCode >= 96 && e.keyCode <= 105)   // 0-9 on numpad
  ) {
    return;
  }
  
  // Prevent all other keys
  e.preventDefault();
};

// Prevent non-integer input (no decimal point)
export const handleIntegerInput = (
  e: React.KeyboardEvent<HTMLInputElement>
): void => {
  // Allow: backspace, delete, tab, escape, enter
  if (
    [46, 8, 9, 27, 13].indexOf(e.keyCode) !== -1 ||
    // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    (e.keyCode === 65 && e.ctrlKey === true) ||
    (e.keyCode === 67 && e.ctrlKey === true) ||
    (e.keyCode === 86 && e.ctrlKey === true) ||
    (e.keyCode === 88 && e.ctrlKey === true) ||
    // Allow: home, end, left, right
    (e.keyCode >= 35 && e.keyCode <= 39)
  ) {
    return;
  }
  // Ensure that it is a number and stop the keypress
  if ((e.shiftKey || e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) {
    e.preventDefault();
  }
};

// Format phone number as user types
export const formatPhoneInput = (value: string): string => {
  // Remove all non-digit characters except +, spaces, -, (, )
  return value.replace(/[^\d\s\+\-\(\)]/g, "");
};

// Format numeric input (allow decimal)
export const formatNumericInput = (value: string): string => {
  // Remove all non-numeric characters except decimal point
  return value.replace(/[^\d.]/g, "");
};

// Format integer input (no decimal)
export const formatIntegerInput = (value: string): string => {
  // Remove all non-numeric characters
  return value.replace(/\D/g, "");
};

