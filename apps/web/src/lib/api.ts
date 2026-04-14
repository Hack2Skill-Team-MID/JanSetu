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

// Response interceptor to handle common errors + offline queueing
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401 Unauthorized globally
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          localStorage.removeItem('auth-storage');
        }
      }
      return Promise.reject(error);
    }

    // Offline detection: queue mutating requests for auto-replay
    if (
      typeof window !== 'undefined' &&
      !error.response &&
      error.message === 'Network Error' &&
      error.config &&
      ['post', 'put', 'patch', 'delete'].includes(error.config.method?.toLowerCase())
    ) {
      try {
        const { queueRequest } = await import('./offline-queue');
        await queueRequest({
          url: error.config.baseURL + error.config.url,
          method: error.config.method.toUpperCase(),
          body: error.config.data || null,
          headers: {
            'Content-Type': 'application/json',
            Authorization: error.config.headers?.Authorization || '',
          },
          timestamp: Date.now(),
        });
        console.log('📴 Request queued for offline replay:', error.config.url);

        // Return a synthetic "queued" response so the UI doesn't crash
        return {
          data: {
            success: false,
            offline: true,
            message: 'You are offline. This action has been saved and will sync when you reconnect.',
          },
          status: 0,
          statusText: 'Offline — Queued',
          headers: {},
          config: error.config,
        };
      } catch (queueError) {
        console.error('Failed to queue offline request:', queueError);
      }
    }

    return Promise.reject(error);
  }
);
