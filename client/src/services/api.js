import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const loginUser = async (data) => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

export const registerUser = async (data) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const changePassword = async (data) => {
  const response = await api.put('/auth/change-password', data);
  return response.data;
};

export const deleteAccount = async (password) => {
  const response = await api.delete('/auth/delete-account', {
    data: { password }
  });
  return response.data;
};

export default api;