// Enhanced token security utilities
import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

// Token validation and management
export const TokenManager = {
  // Check if token is expired
  isTokenExpired: (token) => {
    if (!token) return true;
    
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  },

  // Get token expiration time
  getTokenExpiration: (token) => {
    if (!token) return null;
    
    try {
      const decoded = jwtDecode(token);
      return new Date(decoded.exp * 1000);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  },

  // Validate token format
  isValidTokenFormat: (token) => {
    if (!token) return false;
    
    try {
      const decoded = jwtDecode(token);
      return decoded && decoded.exp && decoded.iat;
    } catch (error) {
      return false;
    }
  },

  // Clear all auth data
  clearAuthData: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('email');
    localStorage.removeItem('username');
    localStorage.removeItem('token_expiration');
  },

  // Get current user info from token
  getCurrentUser: () => {
    const token = localStorage.getItem('access_token');
    if (!token || TokenManager.isTokenExpired(token)) {
      return null;
    }

    return {
      userId: localStorage.getItem('user_id'),
      email: localStorage.getItem('email'),
      username: localStorage.getItem('username'),
      tokenExpiration: localStorage.getItem('token_expiration')
    };
  },

  // Set auth data with validation
  setAuthData: (token, userId, email, username) => {
    if (!TokenManager.isValidTokenFormat(token)) {
      throw new Error('Invalid token format');
    }

    const expirationDate = TokenManager.getTokenExpiration(token);
    if (!expirationDate) {
      throw new Error('Invalid token expiration');
    }

    localStorage.setItem('access_token', token);
    localStorage.setItem('user_id', userId);
    localStorage.setItem('email', email);
    localStorage.setItem('username', username);
    localStorage.setItem('token_expiration', expirationDate.toISOString());
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('access_token');
    return token && !TokenManager.isTokenExpired(token);
  },

  // Get time until token expires (in minutes)
  getTimeUntilExpiration: () => {
    const token = localStorage.getItem('access_token');
    if (!token) return 0;

    const expiration = TokenManager.getTokenExpiration(token);
    if (!expiration) return 0;

    const now = new Date();
    const timeDiff = expiration.getTime() - now.getTime();
    return Math.max(0, Math.floor(timeDiff / 60000)); // Convert to minutes
  },

  // Setup automatic token refresh warning
  setupTokenRefreshWarning: (onWarning, warningMinutes = 5) => {
    const checkTokenExpiration = () => {
      const minutesUntilExpiration = TokenManager.getTimeUntilExpiration();
      
      if (minutesUntilExpiration <= warningMinutes && minutesUntilExpiration > 0) {
        onWarning(minutesUntilExpiration);
      } else if (minutesUntilExpiration <= 0) {
        TokenManager.clearAuthData();
        window.location.href = '/login';
      }
    };

    // Check every minute
    const intervalId = setInterval(checkTokenExpiration, 60000);
    
    // Return cleanup function
    return () => clearInterval(intervalId);
  }
};

// Enhanced auth context with token validation
export const createSecureAuthContext = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [tokenWarning, setTokenWarning] = useState(null);

  useEffect(() => {
    // Check authentication status on mount
    const checkAuth = () => {
      if (TokenManager.isAuthenticated()) {
        setIsAuthenticated(true);
        setUser(TokenManager.getCurrentUser());
      } else {
        setIsAuthenticated(false);
        setUser(null);
        TokenManager.clearAuthData();
      }
    };

    checkAuth();

    // Setup token refresh warning
    const cleanup = TokenManager.setupTokenRefreshWarning(
      (minutes) => setTokenWarning(minutes),
      5 // Warn 5 minutes before expiration
    );

    return cleanup;
  }, []);

  const login = (token, userId, email, username) => {
    try {
      TokenManager.setAuthData(token, userId, email, username);
      setIsAuthenticated(true);
      setUser({ userId, email, username });
      setTokenWarning(null);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    TokenManager.clearAuthData();
    setIsAuthenticated(false);
    setUser(null);
    setTokenWarning(null);
  };

  const refreshToken = async () => {
    // Implement token refresh logic here
    // This would typically call your backend refresh endpoint
    throw new Error('Token refresh not implemented');
  };

  return {
    isAuthenticated,
    user,
    tokenWarning,
    login,
    logout,
    refreshToken
  };
};

// Enhanced axios interceptor with token validation
export const setupSecureAxiosInterceptors = () => {
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