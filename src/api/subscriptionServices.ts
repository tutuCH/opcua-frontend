import axios from 'axios';
import type {
  CreateSubscriptionRequest,
  CreateSubscriptionResponse,
  UpdateSubscriptionRequest,
  CancelSubscriptionRequest,
  SubscriptionResponse,
  PaymentMethod,
  SubscriptionPlan,
  ApiResponse,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_id');
      localStorage.removeItem('username');
      localStorage.removeItem('email');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const subscriptionApi = {
  // Get current user's subscription
  getCurrentSubscription: async (): Promise<SubscriptionResponse | null> => {
    try {
      const response = await api.get<any>('/api/subscription/current');
      // Handle both backend response formats
      const subscriptionData = response.data.subscription || response.data.data;
      
      if (!subscriptionData) {
        return null;
      }
      
      // Transform backend data to match frontend types
      return {
        ...subscriptionData,
        plan: {
          ...subscriptionData.plan,
          amount: subscriptionData.plan.price || subscriptionData.plan.amount,
        }
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          return null; // No subscription found
        }
        if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
          console.warn('Backend server not available for subscription check');
          return null; // Backend not running
        }
      }
      throw error;
    }
  },

  // Get available subscription plans
  getPlans: async (): Promise<SubscriptionPlan[]> => {
    const response = await api.get<any>('/api/subscription/plans');
    // Handle both backend response formats
    return response.data.plans || response.data.data || [];
  },

  // Create a new subscription
  createSubscription: async (request: CreateSubscriptionRequest): Promise<CreateSubscriptionResponse> => {
    const response = await api.post<ApiResponse<CreateSubscriptionResponse>>('/api/subscription/create', request);
    return response.data.data!;
  },

  // Update existing subscription
  updateSubscription: async (request: UpdateSubscriptionRequest): Promise<void> => {
    await api.put(`/api/subscription/${request.subscriptionId}`, request);
  },

  // Cancel subscription
  cancelSubscription: async (request: CancelSubscriptionRequest): Promise<void> => {
    await api.delete(`/api/subscription/${request.subscriptionId}`, {
      data: { immediately: request.immediately },
    });
  },

  // Get user's payment methods
  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    const response = await api.get<ApiResponse<PaymentMethod[]>>('/api/subscription/payment-methods');
    return response.data.data || [];
  },

  // Create Stripe Checkout session for subscription
  createCheckoutSession: async (lookupKey: string): Promise<{ url: string; sessionId: string }> => {
    try {
      console.log('CreateCheckoutSession: Requesting for lookupKey:', lookupKey);
      
      const response = await api.post('/api/subscription/create-checkout-session', {
        lookupKey,
        successUrl: `${window.location.origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/subscription/cancel`,
      });
      
      console.log('CreateCheckoutSession: Raw response:', {
        status: response.status,
        dataKeys: Object.keys(response.data),
        hasUrl: !!response.data.url,
        hasSessionId: !!response.data.sessionId,
        hasData: !!response.data.data,
      });
      
      let checkoutUrl: string | null = null;
      let sessionId: string | null = null;
      
      // Handle multiple response formats
      if (response.data.data && response.data.data.url) {
        // Wrapped format: { status: "success", data: { url: "...", sessionId: "..." } }
        checkoutUrl = response.data.data.url;
        sessionId = response.data.data.sessionId || response.data.data.id;
        console.log('CreateCheckoutSession: Found checkout data in data.data');
      } else if (response.data.url) {
        // Direct format: { url: "...", id: "..." }
        checkoutUrl = response.data.url;
        sessionId = response.data.id || response.data.sessionId;
        console.log('CreateCheckoutSession: Found checkout data in root');
      }
      
      if (!checkoutUrl) {
        console.error('CreateCheckoutSession: No checkout URL found in response:', response.data);
        throw new Error('Invalid checkout session response format - no URL found');
      }
      
      // Validate checkout URL format
      if (typeof checkoutUrl !== 'string' || !checkoutUrl.startsWith('https://checkout.stripe.com/')) {
        console.error('CreateCheckoutSession: Invalid checkout URL format:', checkoutUrl);
        throw new Error('Invalid checkout session URL format');
      }
      
      console.log('CreateCheckoutSession: Success, redirecting to:', checkoutUrl.substring(0, 50) + '...');
      return { url: checkoutUrl, sessionId: sessionId || '' };
    } catch (error) {
      console.error('CreateCheckoutSession API error:', error);
      
      // Add more specific error handling
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          throw new Error(`Bad request: ${error.response.data?.message || 'Invalid request parameters'}`);
        } else if (error.response?.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (error.response?.status === 403) {
          throw new Error('Access denied. Please check your permissions.');
        } else if (error.response?.status >= 500) {
          throw new Error('Server error. Please try again later.');
        }
      }
      
      throw error;
    }
  },

  // Create customer portal session for subscription management
  createCustomerPortalSession: async (): Promise<{ url: string }> => {
    try {
      console.log('CreateCustomerPortalSession: Requesting portal access');
      
      const response = await api.post('/api/subscription/create-portal-session', {
        returnUrl: `${window.location.origin}/settings`,
      });
      
      console.log('CreateCustomerPortalSession: Raw response:', {
        status: response.status,
        hasUrl: !!response.data.url,
        hasData: !!response.data.data,
      });
      
      let portalUrl: string | null = null;
      
      // Handle multiple response formats
      if (response.data.data && response.data.data.url) {
        portalUrl = response.data.data.url;
      } else if (response.data.url) {
        portalUrl = response.data.url;
      }
      
      if (!portalUrl) {
        console.error('CreateCustomerPortalSession: No portal URL found in response:', response.data);
        throw new Error('Invalid customer portal response format - no URL found');
      }
      
      console.log('CreateCustomerPortalSession: Success, redirecting to portal');
      return { url: portalUrl };
    } catch (error) {
      console.error('CreateCustomerPortalSession API error:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          throw new Error(`Bad request: ${error.response.data?.message || 'Invalid request parameters'}`);
        } else if (error.response?.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (error.response?.status === 403) {
          throw new Error('Access denied. Please check your permissions.');
        } else if (error.response?.status >= 500) {
          throw new Error('Server error. Please try again later.');
        }
      }
      
      throw error;
    }
  },

  // Confirm subscription after payment
  confirmSubscription: async (paymentIntentId: string): Promise<SubscriptionResponse> => {
    const response = await api.post<ApiResponse<SubscriptionResponse>>('/api/subscription/confirm', {
      paymentIntentId,
    });
    return response.data.data!;
  },

  // Get billing history
  getBillingHistory: async (): Promise<any[]> => {
    const response = await api.get<ApiResponse<any[]>>('/api/subscription/billing-history');
    return response.data.data || [];
  },

  // Update user profile
  updateUserProfile: async (data: { username?: string; email?: string }): Promise<void> => {
    await api.put('/api/user/profile', data);
  },

  // Change password
  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<void> => {
    await api.put('/api/user/change-password', data);
  },
};

export default subscriptionApi;