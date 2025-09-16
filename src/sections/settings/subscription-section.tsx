import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from 'src/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from 'src/components/ui/card';
import { Button } from 'src/components/ui/button';
import { Badge } from 'src/components/ui/badge';
import { Alert, AlertDescription } from 'src/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from 'src/components/ui/dialog';
import {
  Check,
  X,
  CreditCard,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../hooks/useSubscription';
import { subscriptionApi } from '../../api/subscriptionServices';
import type { SubscriptionPlan } from '../../types';


interface ActionMessage {
  type: 'success' | 'error';
  text: string;
}


const SubscriptionSection: React.FC = () => {
  const { t } = useTranslation();
  const { hasActiveSubscription } = useAuth();
  const { subscription, isLoading, error, cancelSubscription } = useSubscription();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [actionMessage, setActionMessage] = useState<ActionMessage | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState<string | null>(null);

  // Fetch plans when component mounts
  useEffect(() => {
    const fetchPlans = async (): Promise<void> => {
      setPlansLoading(true);
      setPlansError(null);
      try {
        const fetchedPlans = await subscriptionApi.getPlans();
        // Transform plans to include stripePlanId
        const transformedPlans = fetchedPlans.map(plan => ({
          ...plan,
          stripePlanId: plan.id, // Use the plan id as the Stripe lookup key
          features: plan.description ? [plan.description] : [], // Use description as feature
        }));
        setPlans(transformedPlans);
      } catch (err) {
        console.error('Failed to fetch plans:', err);
        setPlansError(t('subscription.errors.loadPlans'));
      } finally {
        setPlansLoading(false);
      }
    };

    if (!hasActiveSubscription) {
      fetchPlans();
    }
  }, [hasActiveSubscription]);

  const handleSubscribeClick = async (plan: SubscriptionPlan): Promise<void> => {
    setIsCreatingCheckout(true);
    setActionMessage(null);

    console.log('Creating Stripe Checkout session for plan:', plan.stripePlanId);

    try {
      const response = await subscriptionApi.createCheckoutSession(plan.stripePlanId);
      console.log('Checkout session created successfully, redirecting to:', response.url);
      
      // Redirect to Stripe Checkout
      window.location.href = response.url;
    } catch (err) {
      console.error('Failed to create checkout session:', err);
      
      // Provide more detailed error messages
      let errorMessage = t('subscription.errors.createCheckout');
      if (err instanceof Error) {
        if (err.message.includes('network') || err.message.includes('fetch')) {
          errorMessage = t('subscription.errors.networkError');
        } else if (err.message.includes('401') || err.message.includes('unauthorized')) {
          errorMessage = t('subscription.errors.authError');
        } else if (err.message.includes('Invalid checkout')) {
          errorMessage = t('subscription.errors.paymentSetupError');
        } else if (err.message.includes('400')) {
          errorMessage = t('subscription.errors.requestError');
        }
      }
      
      setActionMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsCreatingCheckout(false);
    }
  };

  const handleManageSubscription = async (): Promise<void> => {
    setIsOpeningPortal(true);
    setActionMessage(null);

    console.log('Opening customer portal for subscription management');

    try {
      const response = await subscriptionApi.createCustomerPortalSession();
      console.log('Customer portal session created, redirecting to:', response.url);
      
      // Redirect to Stripe Customer Portal
      window.location.href = response.url;
    } catch (err) {
      console.error('Failed to open customer portal:', err);
      
      let errorMessage = t('subscription.errors.openPortal');
      if (err instanceof Error) {
        if (err.message.includes('network') || err.message.includes('fetch')) {
          errorMessage = t('subscription.errors.networkError');
        } else if (err.message.includes('401') || err.message.includes('unauthorized')) {
          errorMessage = t('subscription.errors.authError');
        } else if (err.message.includes('400')) {
          errorMessage = t('subscription.errors.requestError');
        }
      }
      
      setActionMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsOpeningPortal(false);
    }
  };

  const handleCancelSubscription = async (): Promise<void> => {
    if (!subscription) return;

    setIsCancelling(true);
    setActionMessage(null);

    try {
      await cancelSubscription({
        subscriptionId: subscription.id,
        immediately: false,
      });
      setCancelDialogOpen(false);
      setActionMessage({ type: 'success', text: t('subscription.actions.cancelSuccess') });
    } catch (err) {
      console.error('Failed to cancel subscription:', err);
      setActionMessage({ type: 'error', text: t('subscription.errors.cancelError') });
    } finally {
      setIsCancelling(false);
    }
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatPrice = (price: number, currency: string): string => {
    // Handle the pricing display issue - price is in cents for some currencies
    const displayPrice = currency.toUpperCase() === 'TWD' ? price : price / 100;
    return currency.toUpperCase() === 'TWD' ? `NT$ ${displayPrice}` : `$${displayPrice}`;
  };

  const getStatusBadge = (status: string): React.ReactNode => {
    const statusMap = {
      active: { label: t('subscription.status.active'), variant: 'default' as const, icon: <Check className="h-3 w-3" /> },
      trialing: { label: t('subscription.status.trialing'), variant: 'secondary' as const, icon: <Check className="h-3 w-3" /> },
      past_due: { label: t('subscription.status.pastDue'), variant: 'destructive' as const, icon: <AlertTriangle className="h-3 w-3" /> },
      canceled: { label: t('subscription.status.canceled'), variant: 'outline' as const, icon: <X className="h-3 w-3" /> },
      inactive: { label: t('subscription.status.inactive'), variant: 'outline' as const, icon: <X className="h-3 w-3" /> },
    };

    const config = statusMap[status as keyof typeof statusMap] || statusMap.inactive;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{t('settings.tabs.subscription')}</h2>
        <p className="text-muted-foreground">
          {t('subscription.sectionDescription')}
        </p>
      </div>

      {actionMessage && (
        <Alert className={cn(
          actionMessage.type === 'error' && "border-destructive/50 text-destructive dark:border-destructive"
        )}>
          <AlertDescription>
            {actionMessage.text}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="border-destructive/50 text-destructive dark:border-destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {t('subscription.errors.loadSubscription')}: {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Current Subscription Status */}
      <Card>
        <CardHeader>
          <CardTitle>{t('subscription.currentStatus.title')}</CardTitle>
          <CardDescription>
            {t('subscription.currentStatus.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{t('subscription.loading')}</span>
            </div>
          ) : hasActiveSubscription && subscription ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">
                    {formatPrice(subscription.plan.amount, subscription.plan.currency)}
                  </span>
                  <span className="text-muted-foreground">
                    / {subscription.plan.interval === 'month' ? t('subscription.month') : t('subscription.year')}
                  </span>
                </div>
                {getStatusBadge(subscription.status)}
              </div>
              
              <p className="text-sm text-muted-foreground">
                {t('subscription.currentPeriod')}: {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
              </p>

              <div className="flex gap-2">
                <Button
                  onClick={handleManageSubscription}
                  disabled={isOpeningPortal}
                  className="flex items-center gap-2"
                >
                  {isOpeningPortal ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CreditCard className="h-4 w-4" />
                  )}
                  {isOpeningPortal ? t('subscription.actions.opening') : t('subscription.actions.manageSubscription')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCancelDialogOpen(true)}
                  className="flex items-center gap-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <X className="h-4 w-4" />
                  {t('subscription.cancelSubscription')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-2">
                {t('subscription.noActiveSubscription')}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('subscription.selectPlanToStart')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscription Plans */}
      {!hasActiveSubscription && (
        <Card>
          <CardHeader>
            <CardTitle>{t('subscription.planSelection.title')}</CardTitle>
            <CardDescription>
              {t('subscription.planSelection.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {plansError && (
              <Alert className="border-destructive/50 text-destructive dark:border-destructive mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {plansError}
                </AlertDescription>
              </Alert>
            )}
            
            {plansLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">{t('subscription.loadingPlans')}</span>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {plans.map((plan) => (
                  <Card key={plan.id} className="relative">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{plan.name}</span>
                        <div className="text-right">
                          <span className="text-2xl font-bold">
                            {formatPrice(plan.price, plan.currency)}
                          </span>
                          <span className="text-muted-foreground text-sm ml-1">
                            /{plan.interval === 'month' ? t('subscription.month') : t('subscription.year')}
                          </span>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {plan.description && (
                        <div className="text-sm text-muted-foreground">
                          {plan.description}
                        </div>
                      )}
                      {plan.features.length > 0 && (
                        <ul className="space-y-2">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-primary" />
                              <span className="text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      <Button
                        className="w-full"
                        onClick={() => handleSubscribeClick(plan)}
                        disabled={isCreatingCheckout}
                      >
                        {isCreatingCheckout ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            {t('subscription.redirecting')}
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-4 w-4 mr-2" />
                            {t('subscription.upgradeNow')}
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Cancel Subscription Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('subscription.cancelSubscription')}</DialogTitle>
            <DialogDescription>
              {t('subscription.cancelConfirmation')}
              {subscription && `（${formatDate(subscription.currentPeriodEnd)}）`}，
              {t('subscription.cancelWarning')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setCancelDialogOpen(false)}
            >
              {t('subscription.keepSubscription')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelSubscription}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {t('subscription.cancelling')}
                </>
              ) : (
                t('subscription.actions.confirmCancel')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionSection;