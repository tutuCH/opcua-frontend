// src/utils/axiosInterceptor.ts
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { TokenManager } from './tokenSecurity';
import type { ApiError } from '../types';

export const setupAxiosInterceptors = (): void => {
  // Request interceptor to add token and validate
  axios.interceptors.request.use(
    (config: AxiosRequestConfig) => {
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
    (error: AxiosError) => Promise.reject(error)
  );

  // Response interceptor for 401 handling
  axios.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError<ApiError>) => {
      if (error.response && error.response.status === 401) {
        TokenManager.clearAuthData();
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
};
