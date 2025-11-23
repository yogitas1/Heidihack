import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Order API functions
export const ordersApi = {
  create: (orderData) => apiClient.post('/api/orders', orderData),
  getByPatient: (patientId) => apiClient.get(`/api/orders/${patientId}`),
  getAll: (params = {}) => apiClient.get('/api/orders', { params }),
  getById: (orderId) => apiClient.get(`/api/orders/detail/${orderId}`),
  updateStatus: (orderId, status, userId, userName, notes) =>
    apiClient.patch(`/api/orders/${orderId}/status`, null, {
      params: { new_status: status, user_id: userId, user_name: userName, notes }
    }),
  cancel: (orderId, userId, userName, reason) =>
    apiClient.delete(`/api/orders/${orderId}`, {
      params: { user_id: userId, user_name: userName, reason }
    }),
  getAuditTrail: (orderId) => apiClient.get(`/api/orders/${orderId}/audit`),
};

export default apiClient;
