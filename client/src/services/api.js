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
  }
};

export default api;
