// Pricing Calculation Logic
// Note: Most pricing is now handled by Backend API
// This file only contains CBM calculation as a fallback

/**
 * Calculate CBM (Cubic Meters) from dimensions in centimeters
 * This is used as a fallback if Backend API fails
 */
export function calculateCBM(length: number, width: number, height: number): number {
  // Convert from cm³ to m³
  return (length * width * height) / 1_000_000;
}
