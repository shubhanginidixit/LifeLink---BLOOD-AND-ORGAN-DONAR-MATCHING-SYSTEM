import axios from 'axios';

const TOKEN_KEY = 'lifelink_token';

const API_URL = import.meta.env.VITE_API_URL || 'https://blood-and-organ-donar-matching-system.onrender.com';

const api = axios.create({
  baseURL: `${API_URL}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;