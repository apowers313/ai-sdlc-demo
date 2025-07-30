import axios from 'axios';
import { config } from '@/config/env';

export const apiClient = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
  headers: {
    'Accept': 'application/json',
    'User-Agent': config.api.headers['User-Agent'],
  },
});

// Add request interceptor for logging in development
apiClient.interceptors.request.use(
  (request) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('API Request:', request.method?.toUpperCase(), request.url);
    }
    return request;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('API Response:', response.status, response.config.url);
    }
    return response;
  },
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', error.response?.status, error.config?.url);
    }
    
    // Handle common error scenarios
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timeout'));
    }
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status } = error.response;
      
      switch (status) {
        case 429:
          return Promise.reject(new Error('Rate limit exceeded. Please try again later.'));
        case 500:
        case 502:
        case 503:
        case 504:
          return Promise.reject(new Error('Server error. Please try again later.'));
        default:
          return Promise.reject(error);
      }
    } else if (error.request) {
      // The request was made but no response was received
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }
    
    return Promise.reject(error);
  }
);