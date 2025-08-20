import { useState, useEffect, useCallback, useRef } from 'react';
import { subscriptionApi } from '../api/subscriptionServices';
import { useAuth } from '../contexts/AuthContext';
import type {
  SubscriptionResponse,
  PaymentMethod,
  SubscriptionPlan,
  CreateSubscriptionRequest,
  CreateSubscriptionResponse,
  UpdateSubscriptionRequest,
  CancelSubscriptionRequest,
} from '../types';

interface UseSubscriptionReturn {
  subscription: SubscriptionResponse | null;
  paymentMethods: PaymentMethod[];
  plans: SubscriptionPlan[];
  isLoading: boolean;
  error: string | null;
  createSubscription: (request: CreateSubscriptionRequest) => Promise<CreateSubscriptionResponse>;
  updateSubscription: (request: UpdateSubscriptionRequest) => Promise<void>;
  cancelSubscription: (request: CancelSubscriptionRequest) => Promise<void>;
  refreshSubscription: () => Promise<void>;
  refreshPaymentMethods: () => Promise<void>;
}

export const useSubscription = (): UseSubscriptionReturn => {
  const { isAuthenticated, refreshUserData } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialLoadDone = useRef(false);

  const refreshSubscription = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);

    try {
      const currentSubscription = await subscriptionApi.getCurrentSubscription();
      setSubscription(currentSubscription);
      
      // Also refresh user data in AuthContext (but don't depend on it)
      try {
        await refreshUserData();
      } catch (refreshError) {
        console.warn('Failed to refresh user data:', refreshError);
      }
    } catch (err) {
      console.error('Failed to refresh subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to load subscription');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]); // Removed refreshUserData from dependencies

  const refreshPaymentMethods = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const methods = await subscriptionApi.getPaymentMethods();
      setPaymentMethods(methods);
    } catch (err) {
      console.error('Failed to refresh payment methods:', err);
    }
  }, [isAuthenticated]);

  const loadPlans = useCallback(async () => {
    try {
      const availablePlans = await subscriptionApi.getPlans();
      setPlans(availablePlans);
    } catch (err) {
      console.error('Failed to load plans:', err);
    }
  }, []);

  const createSubscription = useCallback(async (request: CreateSubscriptionRequest): Promise<CreateSubscriptionResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await subscriptionApi.createSubscription(request);
      
      // Refresh subscription data after creation (but don't use the callback)
      try {
        const newSubscription = await subscriptionApi.getCurrentSubscription();
        setSubscription(newSubscription);
        refreshUserData().catch(err => console.warn('Failed to refresh user data:', err));
      } catch (refreshErr) {
        console.warn('Failed to refresh subscription after creation:', refreshErr);
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create subscription';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSubscription = useCallback(async (request: UpdateSubscriptionRequest): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await subscriptionApi.updateSubscription(request);
      
      // Refresh subscription data after update (but don't use the callback)
      try {
        const updatedSubscription = await subscriptionApi.getCurrentSubscription();
        setSubscription(updatedSubscription);
        refreshUserData().catch(err => console.warn('Failed to refresh user data:', err));
      } catch (refreshErr) {
        console.warn('Failed to refresh subscription after update:', refreshErr);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update subscription';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cancelSubscription = useCallback(async (request: CancelSubscriptionRequest): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await subscriptionApi.cancelSubscription(request);
      
      // Refresh subscription data after cancellation (but don't use the callback)
      try {
        const cancelledSubscription = await subscriptionApi.getCurrentSubscription();
        setSubscription(cancelledSubscription);
        refreshUserData().catch(err => console.warn('Failed to refresh user data:', err));
      } catch (refreshErr) {
        console.warn('Failed to refresh subscription after cancellation:', refreshErr);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel subscription';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load initial data only once when authenticated
  useEffect(() => {
    const loadInitialData = async () => {
      if (!isAuthenticated) {
        initialLoadDone.current = false;
        setSubscription(null);
        setPaymentMethods([]);
        setPlans([]);
        setError(null);
        return;
      }

      if (initialLoadDone.current) return;
      
      initialLoadDone.current = true;
      setIsLoading(true);
      setError(null);

      try {
        // Load all data in parallel
        const [subscriptionData, paymentMethodsData, plansData] = await Promise.allSettled([
          subscriptionApi.getCurrentSubscription(),
          subscriptionApi.getPaymentMethods(),
          subscriptionApi.getPlans(),
        ]);

        // Handle subscription data
        if (subscriptionData.status === 'fulfilled') {
          setSubscription(subscriptionData.value);
          // Refresh user data in AuthContext (fire and forget)
          refreshUserData().catch(err => console.warn('Failed to refresh user data:', err));
        } else {
          console.error('Failed to load subscription:', subscriptionData.reason);
        }

        // Handle payment methods data
        if (paymentMethodsData.status === 'fulfilled') {
          setPaymentMethods(paymentMethodsData.value);
        } else {
          console.error('Failed to load payment methods:', paymentMethodsData.reason);
        }

        // Handle plans data
        if (plansData.status === 'fulfilled') {
          setPlans(plansData.value);
        } else {
          console.error('Failed to load plans:', plansData.reason);
        }

      } catch (err) {
        console.error('Failed to load subscription data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load subscription data');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [isAuthenticated]); // Only depend on isAuthenticated

  return {
    subscription,
    paymentMethods,
    plans,
    isLoading,
    error,
    createSubscription,
    updateSubscription,
    cancelSubscription,
    refreshSubscription,
    refreshPaymentMethods,
  };
};