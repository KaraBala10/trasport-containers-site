// Pricing Types and Interfaces

export type PricingMethod = 'per-kg' | 'per-piece' | 'volume-based' | 'agreement';

export interface ProductCategory {
  key: string;
  name: string;
  nameEn: string;
  pricingMethod: PricingMethod;
  pricePerKg?: number; // For per-kg products
  pricePerPiece?: number; // For per-piece products
  minimumWeight?: number; // Minimum weight in kg
  minimumCBM?: number; // Minimum CBM
  hsCode: string;
}

// Note: Product prices are now managed via Backend API (Price table in Database)
// Old hardcoded PER_KG_PRODUCTS and PER_PIECE_PRODUCTS have been removed

// Packaging Options
export interface PackagingOption {
  key: string;
  name: string;
  nameEn: string;
  price: number;
  type: 'initial' | 'final';
}

export const INITIAL_PACKAGING: PackagingOption[] = [
  { key: 'basic', name: 'حماية أساسية', nameEn: 'Basic Protection', price: 1, type: 'initial' },
  { key: 'medium', name: 'حماية متوسطة', nameEn: 'Medium Protection', price: 2, type: 'initial' },
  { key: 'heavy', name: 'حماية قوية', nameEn: 'Heavy Protection', price: 4, type: 'initial' },
];

export const FINAL_PACKAGING: PackagingOption[] = [
  { key: 'smallBox', name: 'صندوق كرتون صغير (20×20×20 cm)', nameEn: 'Small Box (20×20×20 cm)', price: 1.5, type: 'final' },
  { key: 'mediumBox', name: 'صندوق كرتون متوسط (40×30×30 cm)', nameEn: 'Medium Box (40×30×30 cm)', price: 2.5, type: 'final' },
  { key: 'largeBox', name: 'صندوق كرتون كبير (60×40×40 cm)', nameEn: 'Large Box (60×40×40 cm)', price: 3.5, type: 'final' },
  { key: 'bubbleWrap', name: 'حماية إضافية (Bubble Wrap)', nameEn: 'Additional Protection (Bubble Wrap)', price: 2, type: 'final' },
  { key: 'foam', name: 'حماية فوم (Foam Protection)', nameEn: 'Foam Protection', price: 3, type: 'final' },
  { key: 'euroPallet', name: 'باليت خشبي – Euro Pallet (120×80 cm)', nameEn: 'Euro Pallet (120×80 cm)', price: 25, type: 'final' },
  { key: 'woodenCrate', name: 'صندوق خشبي تقوية – Wooden Crate', nameEn: 'Wooden Crate', price: 75, type: 'final' },
  { key: 'palletBoxXL', name: 'صندوق باليت كبير – Pallet Box XL (1185×985×870 mm)', nameEn: 'Pallet Box XL (1185×985×870 mm)', price: 29, type: 'final' },
];

// Pricing Result
export interface PricingResult {
  // Base LCL Price
  basePrice: {
    priceByWeight: number;
    priceByCBM: number;
    final: number;
  };
  
  // Parcel LCL Price
  parcelPrice: {
    total: number;
    breakdown: {
      priceByWeight: number;
      priceByCBM: number;
      priceByProduct: number;
      final: number;
    };
  };
  
  // Electronics Price
  electronicsPrice?: {
    total: number;
    breakdown: {
      piecePrice: number;
      insurance: number;
      packaging: number;
      final: number;
    };
  };
  
  // Large Items Price (approximate)
  largeItemsPrice?: {
    approximate: number;
    note: string;
  };
  
  // Additional Services
  packaging: {
    initial: number;
    final: number;
    total: number;
  };
  
  insurance: {
    optional: number;
    mandatory: number; // For electronics
    total: number;
  };
  
  // Grand Total
  grandTotal: number;
}

