import React, { useState, useEffect } from 'react';
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
        setPlansError('無法載入訂閱方案，請稍後再試');
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
      let errorMessage = '無法創建付款頁面，請稍後再試';
      if (err instanceof Error) {
        if (err.message.includes('network') || err.message.includes('fetch')) {
          errorMessage = '網絡連接問題，請檢查網絡並重試';
        } else if (err.message.includes('401') || err.message.includes('unauthorized')) {
          errorMessage = '認證失效，請重新登錄';
        } else if (err.message.includes('Invalid checkout')) {
          errorMessage = '付款設置錯誤，請聯繫客服';
        } else if (err.message.includes('400')) {
          errorMessage = '請求參數錯誤，請稍後再試';
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
      
      let errorMessage = '無法打開管理頁面，請稍後再試';
      if (err instanceof Error) {
        if (err.message.includes('network') || err.message.includes('fetch')) {
          errorMessage = '網絡連接問題，請檢查網絡並重試';
        } else if (err.message.includes('401') || err.message.includes('unauthorized')) {
          errorMessage = '認證失效，請重新登錄';
        } else if (err.message.includes('400')) {
          errorMessage = '請求參數錯誤，請稍後再試';
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
      setActionMessage({ type: 'success', text: '訂閱已取消，將在當前付費週期結束時停止。' });
    } catch (err) {
      console.error('Failed to cancel subscription:', err);
      setActionMessage({ type: 'error', text: '取消訂閱失敗，請稍後再試' });
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
      active: { label: '活躍', variant: 'default' as const, icon: <Check className="h-3 w-3" /> },
      trialing: { label: '試用中', variant: 'secondary' as const, icon: <Check className="h-3 w-3" /> },
      past_due: { label: '逾期', variant: 'destructive' as const, icon: <AlertTriangle className="h-3 w-3" /> },
      canceled: { label: '已取消', variant: 'outline' as const, icon: <X className="h-3 w-3" /> },
      inactive: { label: '未啟用', variant: 'outline' as const, icon: <X className="h-3 w-3" /> },
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
        <h2 className="text-2xl font-semibold tracking-tight">訂閱管理</h2>
        <p className="text-muted-foreground">
          管理您的訂閱計劃和付款設定
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
            載入訂閱資訊時發生錯誤：{error}
          </AlertDescription>
        </Alert>
      )}

      {/* Current Subscription Status */}
      <Card>
        <CardHeader>
          <CardTitle>當前訂閱狀態</CardTitle>
          <CardDescription>
            查看您當前的訂閱計劃和狀態
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>載入中...</span>
            </div>
          ) : hasActiveSubscription && subscription ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">
                    {formatPrice(subscription.plan.amount, subscription.plan.currency)}
                  </span>
                  <span className="text-muted-foreground">
                    / {subscription.plan.interval === 'month' ? '月' : '年'}
                  </span>
                </div>
                {getStatusBadge(subscription.status)}
              </div>
              
              <p className="text-sm text-muted-foreground">
                當前週期：{formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
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
                  {isOpeningPortal ? '打開中...' : '管理訂閱'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCancelDialogOpen(true)}
                  className="flex items-center gap-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <X className="h-4 w-4" />
                  取消訂閱
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-2">
                您目前沒有活躍的訂閱
              </p>
              <p className="text-sm text-muted-foreground">
                選擇下方的訂閱方案開始使用我們的服務
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscription Plans */}
      {!hasActiveSubscription && (
        <Card>
          <CardHeader>
            <CardTitle>選擇訂閱方案</CardTitle>
            <CardDescription>
              選擇最適合您的訂閱計劃
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
                <span className="ml-2">載入訂閱方案...</span>
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
                            /{plan.interval === 'month' ? '月' : '年'}
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
                            跳轉中...
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-4 w-4 mr-2" />
                            立即訂閱
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
            <DialogTitle>取消訂閱</DialogTitle>
            <DialogDescription>
              您確定要取消訂閱嗎？您將可以繼續使用服務直到當前付費週期結束
              {subscription && `（${formatDate(subscription.currentPeriodEnd)}）`}，
              之後將失去對儀表板的訪問權限。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setCancelDialogOpen(false)}
            >
              保留訂閱
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelSubscription}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  取消中...
                </>
              ) : (
                '確認取消'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionSection;