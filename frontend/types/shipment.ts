// Shipment Types
export type ShipmentDirection = 'eu-sy' | 'sy-eu';

export type ShipmentType = 'personal' | 'commercial';

export type PaymentMethod = 'cash' | 'transfer' | 'mollie' | 'bank';

export type TransferType = 'exchange' | 'bank' | 'transfer_company';

export interface ClientInfo {
  // Sender
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  senderIdNumber: string;
  senderPassportNumber?: string;
  senderCountry: string;
  senderCity: string;
  senderPostalCode?: string;
  senderAddress: string;
  senderGovernorate?: string;

  // Receiver
  receiverName: string;
  receiverEmail: string;
  receiverPhone: string;
  receiverIdNumber: string;
  receiverPassportNumber?: string;
  receiverCountry: string;
  receiverCity: string;
  receiverPostalCode?: string;
  receiverAddress: string;
  receiverGovernorate?: string;
}

export interface Parcel {
  id: string;
  description: string;
  weight: number; // kg
  length: number; // cm
  width: number; // cm
  height: number; // cm
  cbm: number; // calculated
  fragile: boolean;
}

export interface PackagingOption {
  type: string;
  quantity: number;
  pricePerUnit: number;
}

export interface AdditionalServices {
  packaging?: PackagingOption;
  syriaDelivery?: {
    governorate: string;
    minPrice: number;
    pricePerKg: number;
  };
  euTransport?: {
    country: string;
    minPrice: number;
    pricePerKg: number;
  };
  insurance: boolean;
  notes?: string;
}

export interface PricingDetails {
  priceByWeight: number;
  priceByVolume: number;
  basePrice: number;
  packagingCost: number;
  syriaDeliveryCost: number;
  euTransportCost: number;
  insuranceCost: number;
  totalPrice: number;
}

export interface PaymentInfo {
  method: PaymentMethod;
  transferType?: TransferType;
  transferSenderName?: string;
  transferReference?: string;
  transferSlipFile?: File;
}

export interface ShipmentFormData {
  direction: ShipmentDirection;
  shipmentType: ShipmentType;
  clientInfo: ClientInfo;
  parcels: Parcel[];
  parcelPhotos: File[];
  contentPhotos: File[];
  additionalServices: AdditionalServices;
  pricing: PricingDetails;
  payment: PaymentInfo;
  agreedToTerms: boolean;
  agreedToPrivacy: boolean;
  agreedToProhibited: boolean;
}

export interface ShipmentResponse {
  success: boolean;
  shipmentId: string;
  shipmentNumber: string;
  status: 'PENDING_PAYMENT' | 'PENDING_DROP_OFF' | 'PENDING_TRANSFER';
  labelUrl?: string;
  invoiceUrl?: string;
  message: string;
}

