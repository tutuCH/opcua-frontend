// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { TokenManager } from '../utils/tokenSecurity';
import { userLogin, userSignup } from '../api/authServices';
import { subscriptionApi } from '../api/subscriptionServices';
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
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [tokenWarning, setTokenWarning] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check authentication status on mount with proper token validation
    const checkAuth = async (): Promise<void> => {
      try {
        if (TokenManager.isAuthenticated()) {
          setIsAuthenticated(true);
          const currentUser = TokenManager.getCurrentUser();
          
          try {
            // Fetch latest subscription data
            const subscription = await subscriptionApi.getCurrentSubscription();
            const userWithSubscription: User = {
              ...currentUser,
              subscriptionStatus: subscription?.status as User['subscriptionStatus'],
              subscriptionId: subscription?.id,
              planType: subscription?.plan.interval === 'month' ? 'monthly' : 'yearly',
              subscriptionEndDate: subscription && subscription.currentPeriodEnd 
                ? new Date(subscription.currentPeriodEnd * 1000).toISOString() 
                : undefined,
            };
            setUser(userWithSubscription);
          } catch (error) {
            console.warn('Failed to fetch subscription data (backend may not be running):', error);
            // Set user without subscription data if API is not available
            const userWithoutSubscription: User = {
              ...currentUser,
              subscriptionStatus: 'inactive',
              subscriptionId: undefined,
              planType: undefined,
              subscriptionEndDate: undefined,
            };
            setUser(userWithoutSubscription);
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
          TokenManager.clearAuthData();
        }
      } finally {
        // Always set loading to false after auth/subscription check completes
        setLoading(false);
      }
    };

    checkAuth();

    // Setup token refresh warning (warn 5 minutes before expiration)
    const cleanup = TokenManager.setupTokenRefreshWarning(
      (minutes: number) => setTokenWarning(minutes),
      5
    );

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
      
      // Navigate to factory page after successful login
      navigate('/factory', { replace: true });
      
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
    
    // Navigate to login page after logout
    navigate('/login', { replace: true });
  };

  const refreshUserData = async (): Promise<void> => {
    if (!isAuthenticated) return;
    
    try {
      const currentUser = TokenManager.getCurrentUser();
      const subscription = await subscriptionApi.getCurrentSubscription();
      const userWithSubscription: User = {
        ...currentUser,
        subscriptionStatus: subscription?.status as User['subscriptionStatus'],
        subscriptionId: subscription?.id,
        planType: subscription?.plan.interval === 'month' ? 'monthly' : 'yearly',
        subscriptionEndDate: subscription && subscription.currentPeriodEnd 
          ? new Date(subscription.currentPeriodEnd * 1000).toISOString() 
          : undefined,
      };
      setUser(userWithSubscription);
    } catch (error) {
      console.warn('Failed to refresh user data (backend may not be running):', error);
      // Set user without subscription data if API is not available
      const currentUser = TokenManager.getCurrentUser();
      const userWithoutSubscription: User = {
        ...currentUser,
        subscriptionStatus: 'inactive',
        subscriptionId: undefined,
        planType: undefined,
        subscriptionEndDate: undefined,
      };
      setUser(userWithoutSubscription);
    }
  };

  const hasActiveSubscription = Boolean(
    user?.subscriptionStatus && ['active', 'trialing'].includes(user.subscriptionStatus)
  );

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      login, 
      signup,
      logout,
      loading,
      hasActiveSubscription,
      refreshUserData
    }}>
      {children}
    </AuthContext.Provider>
  );
};
