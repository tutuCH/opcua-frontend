// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { TokenManager } from '../utils/tokenSecurity';
import { userLogin, userSignup } from '../api/authServices';
import type { User, AuthContextType, SignupResponse } from '../types';

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [tokenWarning, setTokenWarning] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check authentication status on mount with proper token validation
    const checkAuth = (): void => {
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
      (minutes: number) => setTokenWarning(minutes),
      5
    );
    
    setLoading(false);

    return cleanup;
  }, []);

  const login = async (email: string, password: string): Promise<string> => {
    try {
      const token = await userLogin(email, password);
      const userId = localStorage.getItem('user_id') || '';
      const username = localStorage.getItem('username') || '';
      
      setIsAuthenticated(true);
      setUser({ id: userId, email, username });
      setTokenWarning(null);
      
      return token;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (email: string, password: string, username: string): Promise<SignupResponse> => {
    return await userSignup(email, password, username);
  };

  const logout = (): void => {
    TokenManager.clearAuthData();
    setIsAuthenticated(false);
    setUser(null);
    setTokenWarning(null);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      login, 
      signup,
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};
