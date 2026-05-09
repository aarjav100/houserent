import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const propertyService = {
  getAll: async (params) => {
    const { data } = await api.get('/properties', { params });
    return data;
  },
  getById: async (id) => {
    const { data } = await api.get(`/properties/${id}`);
    return data;
  },
  create: async (propertyData) => {
    const { data } = await api.post('/properties', propertyData);
    return data;
  },
  update: async (id, propertyData) => {
    const { data } = await api.put(`/properties/${id}`, propertyData);
    return data;
  },
  delete: async (id) => {
    const { data } = await api.delete(`/properties/${id}`);
    return data;
  },
  uploadImage: async (formData) => {
    const { data } = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  }
};

export const paymentService = {
  createOrder: async (amount) => {
    const { data } = await api.post('/payment/create-order', { amount });
    return data;
  },
  verifyPayment: async (paymentData) => {
    const { data } = await api.post('/payment/verify', paymentData);
    return data;
  }
};

export const contactService = {
  getContact: async (propertyId) => {
    const { data } = await api.get(`/contact/${propertyId}`);
    return data;
  },
  unlockContact: async (unlockData) => {
    const { data } = await api.post('/contact/unlock', unlockData);
    return data;
  }
};

export const userService = {
    getProfile: async () => {
        const response = await api.get('/users/profile');
        return response.data;
    },
    updateProfile: async (data) => {
        const response = await api.put('/users/profile', data);
        return response.data;
    }
};

export default api;
