// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { TokenManager } from '../utils/tokenSecurity';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [tokenWarning, setTokenWarning] = useState(null);

  useEffect(() => {
    // Check authentication status on mount with proper token validation
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

    // Setup token refresh warning (warn 5 minutes before expiration)
    const cleanup = TokenManager.setupTokenRefreshWarning(
      (minutes) => setTokenWarning(minutes),
      5
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

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      tokenWarning, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
