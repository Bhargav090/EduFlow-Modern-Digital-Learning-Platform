import axios from 'axios';

// Use direct backend URL as requested (no .env)
const BASE_URL = 'https://eduflow-modern-digital-learning-platform.onrender.com/api';
//const BASE_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
