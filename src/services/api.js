import axios from 'axios';

// Use proxy in development, full URL in production
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? (process.env.REACT_APP_API_URL || 'http://localhost:5000/api')
  : '/api'; // Use proxy in development

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/customer/register', userData),
  login: (credentials) => api.post('/customer/login', credentials),
  getProfile: () => api.get('/customer/profile'),
  updateProfile: (userData) => api.put('/customer/profile', userData),
  changePassword: (passwordData) => api.put('/customer/change-password', passwordData),
};

// Customer API (using profile endpoints)
export const customerAPI = {
  add: (customerData) => api.put('/customer/profile', customerData),
  get: () => api.get('/customer/profile'),
  update: (customerData) => api.put('/customer/profile', customerData),
};

// Package API
export const packageAPI = {
  getAll: (params) => api.get('/packages', { params }),
  getById: (id) => api.get(`/packages/${id}`),
  book: (bookingData) => api.post('/packages/book', bookingData),
  getMyBookings: () => api.get('/packages/bookings/my'),
  getBookingById: (id) => api.get(`/packages/bookings/${id}`),
  cancelBooking: (id) => api.put(`/packages/bookings/${id}/cancel`),
};

// Hotel API
export const hotelAPI = {
  getAll: (params) => api.get('/hotels', { params }),
  getById: (id) => api.get(`/hotels/${id}`),
  book: (bookingData) => api.post('/hotels/book', bookingData),
  getMyBookings: () => api.get('/hotels/bookings/my'),
  getBookingById: (id) => api.get(`/hotels/bookings/${id}`),
  cancelBooking: (id) => api.put(`/hotels/bookings/${id}/cancel`),
};

// Destination API
export const destinationAPI = {
  getAll: (params) => api.get('/destinations', { params }),
  getById: (id) => api.get(`/destinations/${id}`),
  getPopular: () => api.get('/destinations/popular'),
};

export default api;
