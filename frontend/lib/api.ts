import axios from 'axios';

// Get API URL from environment or use default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

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
    return apiClient.get('/shipments/');
  },

  getShipment: (id: number) => {
    return apiClient.get(`/shipments/${id}/`);
  },

  createShipment: (data: any) => {
    return apiClient.post('/shipments/', data);
  },

  updateShipment: (id: number, data: any) => {
    return apiClient.put(`/shipments/${id}/`, data);
  },

  deleteShipment: (id: number) => {
    return apiClient.delete(`/shipments/${id}/`);
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

  initiatePayment: (id: number) => {
    return apiClient.post(`/fcl/quotes/${id}/initiate-payment/`);
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
  downloadPackingList: (shipmentId: string) => {
    return apiClient.get(`/shipments/${shipmentId}/packing-list/`, {
      responseType: 'blob',
    });
  },

  downloadCommercialInvoice: (shipmentId: string) => {
    return apiClient.get(`/shipments/${shipmentId}/commercial-invoice/`, {
      responseType: 'blob',
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
};

export default apiClient;

