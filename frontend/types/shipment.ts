export type ShippingDirection = 'eu-sy' | 'sy-eu';
export type ShipmentType = 'parcel-lcl' | 'electronics' | 'large-items' | 'business-lcl';

export interface PersonInfo {
  fullName: string;
  phone: string;
  email: string;
  street: string;
  streetNumber: string;
  city: string;
  postalCode: string;
  country?: string; // For EU
  province?: string; // For Syria
  idNumber?: string; // ID or Passport number (GDPR compliant)
}

export interface Parcel {
  id: string;
  length: number; // cm
  width: number; // cm
  height: number; // cm
  weight: number; // kg
  cbm: number; // calculated automatically
  productCategory: string; // Product key (e.g., 'CLOTHES', 'MOBILE_PHONE')
  quantity: number; // Quantity of items
  repeatCount: number; // Number of times this parcel is repeated (default: 1)
  photos: File[]; // Parcel photos (3 required)
  
  // Electronics specific fields
  deviceType?: string;
  deviceModel?: string;
  declaredValue?: number; // € - Required for electronics
  hasInvoice?: boolean;
  devicePhoto?: File; // Device photo (1 required for electronics)
  
  // Large Items specific fields
  itemType?: string;
  unknownDimensions?: boolean;
  notes?: string;
}

export interface ShipmentFormData {
  direction: ShippingDirection | null;
  shipmentTypes: ShipmentType[];
  sender: PersonInfo | null;
  receiver: PersonInfo | null;
  parcels: Parcel[];
  // More fields will be added in future steps
}

