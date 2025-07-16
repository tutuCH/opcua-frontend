// src/utils/axiosInterceptor.js
import axios from 'axios';
import { TokenManager } from './tokenSecurity';

export const setupAxiosInterceptors = () => {
  // Request interceptor to add token and validate
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('access_token');
      
      if (token) {
        if (TokenManager.isTokenExpired(token)) {
          TokenManager.clearAuthData();
          window.location.href = '/login';
          return Promise.reject(new Error('Token expired'));
        }
        
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor for 401 handling
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        TokenManager.clearAuthData();
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
};
