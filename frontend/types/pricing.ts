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

// Per-KG Product Categories (3€/kg, min 20kg)
export const PER_KG_PRODUCTS: ProductCategory[] = [
  { key: 'CLOTHES', name: 'البسة وملابس', nameEn: 'Clothes', pricingMethod: 'per-kg', pricePerKg: 3, minimumWeight: 20, hsCode: '6204/6203' },
  { key: 'SHOES', name: 'أحذية', nameEn: 'Shoes', pricingMethod: 'per-kg', pricePerKg: 3, minimumWeight: 20, hsCode: '6403' },
  { key: 'ACCESSORIES', name: 'إكسسوارات عامة', nameEn: 'Accessories', pricingMethod: 'per-kg', pricePerKg: 3, minimumWeight: 20, hsCode: '6117/6217' },
  { key: 'SMALL_APPLIANCES', name: 'أجهزة منزلية صغيرة', nameEn: 'Small Appliances', pricingMethod: 'per-kg', pricePerKg: 3, minimumWeight: 20, hsCode: '8509' },
  { key: 'COSMETICS', name: 'مستحضرات تجميل', nameEn: 'Cosmetics', pricingMethod: 'per-kg', pricePerKg: 3, minimumWeight: 20, hsCode: '3304' },
  { key: 'PERFUMES', name: 'عطور', nameEn: 'Perfumes', pricingMethod: 'per-kg', pricePerKg: 3, minimumWeight: 20, hsCode: '3303' },
  { key: 'ESSENTIAL_OILS', name: 'زيوت عطرية', nameEn: 'Essential Oils', pricingMethod: 'per-kg', pricePerKg: 3, minimumWeight: 20, hsCode: '3301' },
  { key: 'HOUSEHOLD', name: 'أدوات منزلية / مطبخ', nameEn: 'Household Items', pricingMethod: 'per-kg', pricePerKg: 3, minimumWeight: 20, hsCode: '3924' },
  { key: 'SPORTS', name: 'معدات رياضية', nameEn: 'Sports Equipment', pricingMethod: 'per-kg', pricePerKg: 3, minimumWeight: 20, hsCode: '9506' },
  { key: 'TOYS', name: 'ألعاب أطفال', nameEn: 'Toys', pricingMethod: 'per-kg', pricePerKg: 3, minimumWeight: 20, hsCode: '9503' },
  { key: 'FURNITURE_SMALL', name: 'كراسي بلاستيك / ديكور', nameEn: 'Small Furniture', pricingMethod: 'per-kg', pricePerKg: 3, minimumWeight: 20, hsCode: '9401/3926' },
  { key: 'FOOD_SNACKS', name: 'حلويات/مقرمشات مغلّفة', nameEn: 'Food & Snacks', pricingMethod: 'per-kg', pricePerKg: 3, minimumWeight: 20, hsCode: '1704/1905' },
  { key: 'TOOLS', name: 'أدوات صناعية ويدوية', nameEn: 'Tools', pricingMethod: 'per-kg', pricePerKg: 3, minimumWeight: 20, hsCode: '8205' },
  { key: 'FISHING', name: 'معدات صيد', nameEn: 'Fishing Equipment', pricingMethod: 'per-kg', pricePerKg: 3, minimumWeight: 20, hsCode: '9507' },
  { key: 'MEDICAL_GENERIC', name: 'معدات طبية عامة', nameEn: 'Medical Equipment', pricingMethod: 'per-kg', pricePerKg: 3, minimumWeight: 20, hsCode: '9018' },
  { key: 'CARPETS', name: 'سجاد/موكيت', nameEn: 'Carpets', pricingMethod: 'per-kg', pricePerKg: 3, minimumWeight: 20, hsCode: '5703' },
];

// Per-Piece Product Categories
export const PER_PIECE_PRODUCTS: ProductCategory[] = [
  { key: 'MOBILE_PHONE', name: 'موبايل', nameEn: 'Mobile Phone', pricingMethod: 'per-piece', pricePerPiece: 80, hsCode: '8517.12' },
  { key: 'LAPTOP', name: 'لابتوب', nameEn: 'Laptop', pricingMethod: 'per-piece', pricePerPiece: 100, hsCode: '8471.30' },
  { key: 'LARGE_MIRROR', name: 'مرآة كبيرة', nameEn: 'Large Mirror', pricingMethod: 'per-piece', pricePerPiece: 120, hsCode: '7009' },
];

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
  { key: 'smallBox', name: 'صندوق صغير', nameEn: 'Small Box', price: 1.5, type: 'final' },
  { key: 'mediumBox', name: 'صندوق متوسط', nameEn: 'Medium Box', price: 2.5, type: 'final' },
  { key: 'largeBox', name: 'صندوق كبير', nameEn: 'Large Box', price: 3.5, type: 'final' },
  { key: 'bubbleWrap', name: 'بلاستيك فقاعي', nameEn: 'Bubble Wrap', price: 2, type: 'final' },
  { key: 'foam', name: 'حماية فوم', nameEn: 'Foam Protection', price: 3, type: 'final' },
  { key: 'euroPallet', name: 'باليت أوروبي', nameEn: 'Euro Pallet', price: 25, type: 'final' },
  { key: 'palletBoxXL', name: 'صندوق باليت XL', nameEn: 'Pallet Box XL', price: 29, type: 'final' },
  { key: 'woodenCrate', name: 'صندوق خشبي', nameEn: 'Wooden Crate', price: 75, type: 'final' },
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

