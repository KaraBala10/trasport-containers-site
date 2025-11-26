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
  isCustomProduct?: boolean; // Flag to indicate custom/new product
  customProductName?: string; // Custom product name if not in list
  packagingType?: string; // Packaging Price ID
  quantity: number; // Quantity of items
  repeatCount: number; // Number of times this parcel is repeated (default: 1)
  photos: File[]; // Parcel photos (3 required)
  
  // Electronics specific fields
  deviceType?: string;
  deviceModel?: string;
  declaredValue?: number; // € - Required for electronics
  hasInvoice?: boolean;
  devicePhoto?: File; // Device photo (1 required for electronics)
  isElectronicsShipment?: boolean; // Flag to identify electronics shipment cards
  electronicsName?: string; // Name/Model of the electronic device
  electronicsPicture?: File; // Picture of the electronic device
  
  // Large Items specific fields
  itemType?: string;
  unknownDimensions?: boolean;
  notes?: string;
  
  // Insurance fields
  wantsInsurance?: boolean;
  declaredShipmentValue?: number; // € - Declared shipment value for insurance
}

export interface ShipmentFormData {
  direction: ShippingDirection | null;
  shipmentTypes: ShipmentType[];
  sender: PersonInfo | null;
  receiver: PersonInfo | null;
  parcels: Parcel[];
  // More fields will be added in future steps
}

