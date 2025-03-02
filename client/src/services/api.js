import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5050/api',
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (data) => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

export const register = async (data) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const changePassword = async (data) => {
  const response = await api.post('/auth/change-password', data);
  return response.data;
};

export const deleteAccount = async (password) => {
  const response = await api.post('/auth/delete-account', { password });
  return response.data;
};

export default api;