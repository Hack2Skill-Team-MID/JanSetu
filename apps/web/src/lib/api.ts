import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the auth token to headers
api.interceptors.request.use(
  (config) => {
    // We'll get the token from localStorage
    if (typeof window !== 'undefined') {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        try {
          const { state } = JSON.parse(authStorage);
          if (state.token) {
            config.headers.Authorization = `Bearer ${state.token}`;
          }
        } catch (error) {
          console.error('Error parsing auth storage', error);
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized globally
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          // If we had a token but got 401, clear it
          localStorage.removeItem('auth-storage');
          // Optionally redirect to login, but Zustand might handle this via reactivity
        }
      }
    }
    return Promise.reject(error);
  }
);
