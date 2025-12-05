import axios from 'axios';

// Get API URL from environment or use default
let API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Normalize API URL: ensure absolute URLs end with /api
// Relative paths (like /api) are left as-is for development
if ((API_BASE_URL.startsWith('http://') || API_BASE_URL.startsWith('https://')) && !API_BASE_URL.endsWith('/api')) {
  // Absolute URL: remove trailing slash and append /api if not present
  API_BASE_URL = API_BASE_URL.replace(/\/$/, '');
  API_BASE_URL = `${API_BASE_URL}/api`;
}

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (typeof window !== 'undefined') {
        const refreshToken = localStorage.getItem('refresh_token');

        if (refreshToken) {
          try {
            const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);

            // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
            return apiClient(originalRequest);
      } catch (refreshError) {
            // Refresh token failed, logout user
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
            window.location.href = '/auth';
            return Promise.reject(refreshError);
          }
        }
      }
    }

    return Promise.reject(error);
  }
);

// API Service
export const apiService = {
  // Auth endpoints
  login: (data: { username: string; password: string }) => {
    return apiClient.post('/login/', data);
  },

  register: (data: {
    username: string;
    email: string;
    password: string;
    password2: string;
    first_name?: string;
    last_name?: string;
  }) => {
    return apiClient.post('/register/', data);
  },

  logout: (refreshToken: string) => {
    return apiClient.post('/logout/', { refresh: refreshToken });
  },

  getCurrentUser: () => {
    return apiClient.get('/user/', {});
  },

  updateProfile: (data: {
    first_name?: string;
    last_name?: string;
    email?: string;
  }) => {
    return apiClient.put('/user/profile/', data);
  },

  refreshToken: (refreshToken: string) => {
    return apiClient.post('/token/refresh/', { refresh: refreshToken });
  },

  // Shipment endpoints
  getShipments: () => {
    return apiClient.get('/shipments/list/');
  },

  getShipment: (id: number) => {
    return apiClient.get(`/shipments/${id}/`);
  },

  createShipment: (data: any) => {
    // If data is FormData, don't set Content-Type header (let browser set it with boundary)
    if (data instanceof FormData) {
      // Get auth token if available
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      
      // Create headers without Content-Type (browser will add it with boundary)
      const headers: any = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      return axios.post(`${API_BASE_URL}/shipments/`, data, {
        headers: headers,
      });
    }
    // Otherwise, send as JSON
    return apiClient.post('/shipments/', data);
  },

  updateShipment: (id: number, data: any) => {
    return apiClient.put(`/shipments/${id}/`, data);
  },

  approveEUShipping: (shipmentId: number) => {
    return apiClient.post(`/shipments/${shipmentId}/approve-eu-shipping/`);
  },

  deleteEUShipping: (shipmentId: number) => {
    return apiClient.post(`/shipments/${shipmentId}/delete-eu-shipping/`);
  },

  downloadSendcloudLabel: (shipmentId: number, labelType: 'normal_printer' | 'label' = 'normal_printer') => {
    return apiClient.get(`/shipments/${shipmentId}/download-sendcloud-label/`, {
      params: { type: labelType },
      responseType: 'blob',
    });
  },

  deleteShipment: (id: number) => {
    return apiClient.delete(`/shipments/${id}/`);
  },

  updateShipmentStatus: (
    id: number,
    status?: string,
    amountPaid?: number,
    trackingNumber?: string
  ) => {
    const payload: any = {};
    if (status) payload.status = status;
    if (amountPaid !== undefined) payload.amount_paid = amountPaid;
    if (trackingNumber !== undefined) payload.tracking_number = trackingNumber;
    return apiClient.patch(`/shipments/${id}/status/`, payload);
  },

  trackShipment: (trackingNumber: string) => {
    return apiClient.get(`/shipments/track/${trackingNumber}/`);
  },

  // Contact endpoints
  createContactMessage: (data: any) => {
    return apiClient.post('/contact/', data);
  },

  // FCL endpoints
  getFCLPricing: () => {
    return apiClient.get('/fcl/pricing/');
  },

  calculateFCLPrice: (data: {
    port_of_loading: string;
    port_of_discharge: string;
    container_type: string;
    number_of_containers: number;
  }) => {
    return apiClient.post('/fcl/calculate/', data);
  },

  createFCLQuote: (formData: FormData) => {
    // Don't set Content-Type - let axios set it automatically with boundary for FormData
    // This preserves the Authorization header from the interceptor
    return apiClient.post('/fcl/quote/', formData);
  },

  getFCLQuotes: () => {
    return apiClient.get('/fcl/quotes/');
  },

  getFCLQuote: (id: number) => {
    return apiClient.get(`/fcl/quotes/${id}/`);
  },

  updateFCLQuote: (id: number, formData: FormData) => {
    // Don't set Content-Type - let axios set it automatically with boundary for FormData
    return apiClient.put(`/fcl/quotes/${id}/`, formData);
  },

  updateFCLQuoteStatus: (id: number, status: string, offerMessage?: string, amountPaid?: number, totalPrice?: number) => {
    const payload: any = {
      status: status,
      offer_message: offerMessage || '',
    };
    if (amountPaid !== undefined) {
      payload.amount_paid = amountPaid;
    }
    if (totalPrice !== undefined) {
      payload.total_price = totalPrice;
    }
    return apiClient.patch(`/fcl/quotes/${id}/status/`, payload);
  },

  deleteFCLQuote: (id: number) => {
    return apiClient.delete(`/fcl/quotes/${id}/`);
  },

  respondToOffer: (id: number, response: "ACCEPTED" | "REJECTED" | "EDIT_REQUESTED", editMessage?: string) => {
    const payload: any = {
      user_response: response,
    };
    if (response === "EDIT_REQUESTED" && editMessage) {
      payload.edit_request_message = editMessage;
    }
    return apiClient.patch(`/fcl/quotes/${id}/respond/`, payload);
  },

  sendEditRequestReply: (id: number, message: string) => {
    return apiClient.post(`/fcl/quotes/${id}/edit-request/reply/`, { message });
  },

  approveOrDeclineEditRequest: (id: number, action: "approve" | "decline", message?: string) => {
    const payload: any = { action };
    if (message) {
      payload.message = message;
    }
    return apiClient.post(`/fcl/quotes/${id}/edit-request/approve-decline/`, payload);
  },

  sendPaymentReminder: (id: number) => {
    return apiClient.post(`/fcl/quotes/${id}/send-payment-reminder/`);
  },

  sendShipmentPaymentReminder: (id: number) => {
    return apiClient.post(`/shipments/${id}/send-payment-reminder/`);
  },

  initiatePayment: (id: number) => {
    return apiClient.post(`/fcl/quotes/${id}/initiate-stripe-payment/`);
  },

  createShipmentCheckout: (data: {
    shipment_id: number;
    amount: number;
    currency: string;
    success_url?: string;
    cancel_url?: string;
    metadata?: Record<string, string>;
  }) => {
    return apiClient.post('/shipments/create-checkout-session/', data);
  },

  confirmShipmentPayment: (data: {
    shipment_id: number;
    session_id?: string;
  }) => {
    return apiClient.post('/shipments/confirm-payment/', data);
  },

  getPaymentStatus: (id: number) => {
    return apiClient.get(`/fcl/quotes/${id}/payment-status/`);
  },

  // Price endpoints
  getPrices: () => {
    return apiClient.get('/prices/');
  },

  getPackagingPrices: () => {
    return apiClient.get('/packaging-prices/');
  },

  getRegularProducts: () => {
    return apiClient.get('/regular-products/');
  },

  getPerPieceProducts: () => {
    return apiClient.get('/per-piece-products/');
  },

  // Request new product
  requestNewProduct: (data: { productName: string; language: string }) => {
    return apiClient.post('/request-product/', data);
  },

  // Admin CRUD endpoints for Price
  adminGetPrices: () => {
    return apiClient.get('/admin/prices/');
  },
  adminCreatePrice: (data: {
    ar_item: string;
    en_item: string;
    price_per_kg: number;
    minimum_shipping_weight: number;
    minimum_shipping_unit: 'per_kg' | 'per_piece';
    one_cbm: number;
  }) => {
    return apiClient.post('/admin/prices/', data);
  },
  adminUpdatePrice: (id: number, data: Partial<{
    ar_item: string;
    en_item: string;
    price_per_kg: number;
    minimum_shipping_weight: number;
    minimum_shipping_unit: 'per_kg' | 'per_piece';
    one_cbm: number;
  }>) => {
    return apiClient.put(`/admin/prices/${id}/`, data);
  },
  adminDeletePrice: (id: number) => {
    return apiClient.delete(`/admin/prices/${id}/`);
  },

  // Admin CRUD endpoints for PackagingPrice
  adminGetPackagingPrices: () => {
    return apiClient.get('/admin/packaging-prices/');
  },
  adminCreatePackagingPrice: (data: {
    ar_option: string;
    en_option: string;
    dimension: string;
    price: number;
  }) => {
    return apiClient.post('/admin/packaging-prices/', data);
  },
  adminUpdatePackagingPrice: (id: number, data: Partial<{
    ar_option: string;
    en_option: string;
    dimension: string;
    price: number;
  }>) => {
    return apiClient.put(`/admin/packaging-prices/${id}/`, data);
  },
  adminDeletePackagingPrice: (id: number) => {
    return apiClient.delete(`/admin/packaging-prices/${id}/`);
  },

  // Calculate pricing
  calculatePricing: (parcels: Array<{
    weight: number;
    cbm: number;
    repeatCount?: number;
    productCategory?: string;
    packagingType?: string;
  }>, language?: string, declaredShipmentValue?: number) => {
    return apiClient.post('/calculate-pricing/', { 
      parcels, 
      language,
      declaredShipmentValue: declaredShipmentValue || 0
    });
  },

  // Document endpoints
  downloadCommercialInvoice: (shipmentId: string) => {
    return apiClient.get(`/shipments/${shipmentId}/commercial-invoice/`, {
      responseType: 'blob',
    });
  },

  downloadInvoice: (shipmentId: string | number, language?: string) => {
    return apiClient.get(`/shipments/${shipmentId}/invoice/`, {
      responseType: 'blob',
      params: language ? { language } : {},
    });
  },

  downloadConsolidatedExportInvoice: (shipmentId: string | number, language?: string) => {
    return apiClient.get(`/shipments/${shipmentId}/consolidated-export-invoice/`, {
      responseType: 'blob',
      params: language ? { language } : {},
    });
  },

  downloadPackingList: (shipmentId: string | number, language?: string) => {
    return apiClient.get(`/shipments/${shipmentId}/packing-list/`, {
      responseType: 'blob',
      params: language ? { language } : {},
    });
  },

  downloadReceipt: (shipmentId: string | number, language?: string) => {
    return apiClient.get(`/shipments/${shipmentId}/receipt/`, {
      responseType: 'blob',
      params: language ? { language } : {},
    });
  },

  downloadShippingLabels: (shipmentId: string | number, language?: string, numLabels?: number) => {
    const params: any = {};
    if (language) params.language = language;
    if (numLabels !== undefined && numLabels > 0) params.num_labels = numLabels;
    
    return apiClient.get(`/shipments/${shipmentId}/shipping-labels/`, {
      responseType: 'blob',
      params,
    });
  },

  // Location endpoints
  getCountries: () => {
    return apiClient.get('/countries/');
  },
  getCities: (countryCode?: string) => {
    return apiClient.get('/cities/', {
      params: countryCode ? { country: countryCode } : {},
    });
  },
  getPorts: (countryCode?: string) => {
    return apiClient.get('/ports/', {
      params: countryCode ? { country: countryCode } : {},
    });
  },

  // Product request endpoints
  getUserProductRequests: () => {
    return apiClient.get('/user/product-requests/');
  },
  getAllProductRequests: () => {
    return apiClient.get('/admin/product-requests/');
  },
  updateProductRequest: (requestId: number, data: { status?: string; admin_notes?: string }) => {
    return apiClient.patch(`/admin/product-requests/${requestId}/`, data);
  },
  deleteProductRequest: (requestId: number) => {
    return apiClient.delete(`/admin/product-requests/${requestId}/delete/`);
  },

  // CBM Calculation API
  calculateCBM: (length: number, width: number, height: number) => {
    return apiClient.post('/calculate-cbm/', { length, width, height });
  },

  // Sendcloud EU Shipping API
  calculateEUShipping: (data: {
    sender_address: string;
    sender_city: string;
    sender_postal_code: string;
    sender_country: string;
    receiver_address: string;
    receiver_city: string;
    receiver_postal_code: string;
    receiver_country: string;
    weight: number;
    length?: number;
    width?: number;
    height?: number;
  }) => {
    return apiClient.post('/calculate-eu-shipping/', data);
  },

  // Get shipping methods (simple - filtered by weight and country)
  getShippingMethodsSimple: (weight: number, country: string) => {
    return apiClient.get('/sendcloud/shipping-methods-simple/', {
      params: { weight, country },
    });
  },

  // ============================================================================
  // SYRIAN INTERNAL TRANSPORT API
  // ============================================================================

  // Get all active Syrian provinces
  getSyrianProvinces: () => {
    return apiClient.get('/syrian-provinces/');
  },

  // Calculate Syrian internal transport price
  calculateSyriaTransport: (data: { province_code: string; weight: number }) => {
    return apiClient.post('/calculate-syria-transport/', data);
  },

  // ============================================================================
  // ADMIN SYRIAN PROVINCES CRUD
  // ============================================================================

  // Get all provinces (admin only - includes inactive)
  adminGetAllSyrianProvinces: () => {
    return apiClient.get('/admin/syrian-provinces/');
  },

  // Create new province (admin only)
  adminCreateSyrianProvince: (data: {
    province_code: string;
    province_name_ar: string;
    province_name_en: string;
    min_price: number;
    rate_per_kg: number;
    is_active?: boolean;
    display_order?: number;
  }) => {
    return apiClient.post('/admin/syrian-provinces/', data);
  },

  // Get single province (admin only)
  adminGetSyrianProvince: (id: number) => {
    return apiClient.get(`/admin/syrian-provinces/${id}/`);
  },

  // Update province (admin only)
  adminUpdateSyrianProvince: (id: number, data: {
    province_code?: string;
    province_name_ar?: string;
    province_name_en?: string;
    min_price?: number;
    rate_per_kg?: number;
    is_active?: boolean;
    display_order?: number;
  }) => {
    return apiClient.put(`/admin/syrian-provinces/${id}/`, data);
  },

  // Delete province (admin only)
  adminDeleteSyrianProvince: (id: number) => {
    return apiClient.delete(`/admin/syrian-provinces/${id}/`);
  },

  // ============================================
  // SHIPPING SETTINGS (Admin Only)
  // ============================================
  
  // Get shipping settings
  adminGetShippingSettings: () => {
    return apiClient.get("/admin/shipping-settings/");
  },

  // Update shipping settings
  adminUpdateShippingSettings: (data: { sendcloud_profit_margin: number }) => {
    return apiClient.put("/admin/shipping-settings/", data);
  },
};

export default apiService;

