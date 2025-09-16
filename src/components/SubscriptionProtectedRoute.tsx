import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from 'src/components/ui/card';
import { Button } from 'src/components/ui/button';
import { Alert, AlertDescription } from 'src/components/ui/alert';
import { Skeleton } from 'src/components/ui/skeleton';
import {
  Lock,
  CreditCard,
  RefreshCw,
  Check,
  Loader2,
} from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';
import { subscriptionApi } from '../api/subscriptionServices';
import type { SubscriptionResponse, SubscriptionPlan } from '../types';

const LoadingScreen: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="w-full max-w-md space-y-6">
        {/* Loading icon */}
        <div className="flex justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
        
        {/* Loading text */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold">{t('subscription.checking')}</h2>
          <p className="text-muted-foreground">{t('subscription.loading')}</p>
        </div>
        
        {/* Loading skeleton */}
        <Card className="w-full">
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const SubscriptionRequiredPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);

  // Fetch plans on mount
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const fetchedPlans = await subscriptionApi.getPlans();
        setPlans(fetchedPlans);
      } catch (error) {
        console.error('Failed to fetch plans:', error);
        // Set default plans as fallback
        setPlans([{
          id: 'professional_monthly',
          name: t('subscription.planTitle'),
          price: 500,
          currency: 'TWD',
          interval: 'month',
          features: [],
          stripePlanId: 'professional_monthly'
        }]);
      } finally {
        setPlansLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const formatPrice = (price: number, currency: string): string => {
    const displayPrice = currency.toUpperCase() === 'TWD' ? price : price / 100;
    return currency.toUpperCase() === 'TWD' ? `NT$ ${displayPrice}` : `$${displayPrice}`;
  };

  const getDefaultFeatures = () => [
    t('subscription.features.unlimitedFactories'),
    t('subscription.features.realtimeMonitoring'),
    t('subscription.features.dataAnalysis'),
    t('subscription.features.alertSystem'),
    t('subscription.features.support24x7'),
    t('subscription.features.dataExport'),
  ];

  // Get the primary plan (first one or professional if available)
  const primaryPlan = plans.find(plan => plan.id.includes('professional')) || plans[0];
  const features = primaryPlan?.description ? [primaryPlan.description] : getDefaultFeatures();

  const handleRefreshSubscription = async (): Promise<void> => {
    setIsRefreshing(true);
    try {
      // Trigger a page reload to re-check subscription
      window.location.reload();
    } catch (error) {
      console.error('Failed to refresh subscription:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-16 px-4">
      <div className="text-center mb-8">
        <Lock className="mx-auto h-20 w-20 text-primary mb-4" />
        <h1 className="text-4xl font-bold mb-4">{t('subscription.required')}</h1>
        <p className="text-xl text-muted-foreground">
          {t('subscription.description')}
        </p>
      </div>

      <Alert className="mb-6">
        <AlertDescription>
          {t('subscription.greeting', { username: user?.username })}
        </AlertDescription>
      </Alert>

      <Card className="mb-6">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{primaryPlan?.name || t('subscription.planTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          {plansLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">{t('subscription.loadingPlans')}</span>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <span className="text-4xl font-bold text-primary">
                  {primaryPlan ? formatPrice(primaryPlan.price, primaryPlan.currency) : 'NT$ 500'}
                </span>
                <span className="text-muted-foreground ml-2">
                  /{primaryPlan?.interval === 'month' ? t('subscription.month') : t('subscription.year')}
                </span>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">{t('subscription.includesFeatures')}:</h3>
                <ul className="space-y-2">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          <div className="text-center">
            <Button
              size="lg"
              onClick={() => window.location.href = '/settings'}
              className="px-8 py-3"
            >
              <CreditCard className="h-5 w-5 mr-2" />
              {t('subscription.upgradeNow')}
            </Button>
          </div>

          <p className="text-sm text-muted-foreground text-center mt-4">
            {t('subscription.terms')}
          </p>
        </CardContent>
      </Card>

      <div className="text-center space-y-4">
        <p className="text-muted-foreground">
          {t('subscription.alreadySubscribed')}{' '}
          <Button 
            variant="link" 
            className="p-0 h-auto"
            onClick={() => window.location.href = '/settings'}
          >
            {t('subscription.settingsPage')}
          </Button>
        </p>
        
        <Button
          variant="outline"
          onClick={handleRefreshSubscription}
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          {isRefreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {isRefreshing ? t('subscription.refreshing') : t('subscription.refresh')}
        </Button>
      </div>
    </div>
  );
};

interface SubscriptionProtectedRouteProps {
  children?: React.ReactNode;
}

const SubscriptionProtectedRoute: React.FC<SubscriptionProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionResponse | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  // Check subscription when component mounts and user is authenticated
  useEffect(() => {
    const checkSubscription = async (): Promise<void> => {
      if (!isAuthenticated || loading) return;

      setSubscriptionLoading(true);

      try {
        console.log('Checking subscription status...');
        const subscription = await subscriptionApi.getCurrentSubscription();
        console.log('Subscription data received:', subscription);
        setSubscriptionData(subscription);
      } catch (error) {
        console.error('Failed to fetch subscription:', error);
        // Set no subscription data on error (assume no active subscription)
        setSubscriptionData(null);
      } finally {
        setSubscriptionLoading(false);
      }
    };

    checkSubscription();
  }, [isAuthenticated, loading]);

  // Show loading while checking auth status
  if (loading) {
    return <LoadingScreen />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Show loading while checking subscription
  if (subscriptionLoading) {
    return <LoadingScreen />;
  }

  // Check if user has active subscription
  const hasActiveSubscription = Boolean(
    subscriptionData?.status && ['active', 'trialing'].includes(subscriptionData.status)
  );

  console.log('Subscription check result:', {
    subscriptionData,
    hasActiveSubscription,
    status: subscriptionData?.status
  });

  // Show subscription required page if no active subscription
  if (!hasActiveSubscription) {
    return <SubscriptionRequiredPage />;
  }

  // Render children or outlet if subscription is active
  return children ? <>{children}</> : <Outlet />;
};

export default SubscriptionProtectedRoute;