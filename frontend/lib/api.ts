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
    email?: string;
    first_name?: string;
    last_name?: string;
  }) => {
    // Filter out empty strings and send only provided fields
    const filteredData: any = {};
    if (data.email !== undefined && data.email !== null && data.email !== '') {
      filteredData.email = data.email;
    }
    if (data.first_name !== undefined && data.first_name !== null) {
      filteredData.first_name = data.first_name;
    }
    if (data.last_name !== undefined && data.last_name !== null) {
      filteredData.last_name = data.last_name;
    }
    return apiClient.patch('/user/profile/', filteredData);
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

  updateFCLQuoteStatus: (id: number, status: string, offerMessage?: string) => {
    return apiClient.patch(`/fcl/quotes/${id}/status/`, {
      status: status,
      offer_message: offerMessage || '',
    });
  },

  deleteFCLQuote: (id: number) => {
    return apiClient.delete(`/fcl/quotes/${id}/`);
  },

  respondToOffer: (id: number, response: "ACCEPTED" | "REJECTED") => {
    return apiClient.patch(`/fcl/quotes/${id}/respond/`, {
      user_response: response,
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
};

export default apiClient;

