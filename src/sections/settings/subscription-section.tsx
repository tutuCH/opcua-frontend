import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  CreditCard as CreditCardIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../hooks/useSubscription';
import { subscriptionApi } from '../../api/subscriptionServices';
import type { SubscriptionPlan } from '../../types';

const mockPlans: SubscriptionPlan[] = [
  {
    id: 'Basic Plan',
    name: '基礎方案',
    price: 9.99,
    currency: 'usd',
    interval: 'month',
    stripePlanId: 'prod_SsYMbLHMTpux8x', // This will be used as lookup_key
    features: [
      '1 個工廠管理',
      '實時機器監控',
      '數據分析報告',
      '警報系統',
    ],
  },
  {
    id: 'Professional Plan',
    name: '專業方案',
    price: 29.99,
    currency: 'usd',
    interval: 'month',
    stripePlanId: 'prod_SsYNJuQnqrekCW', // This will be used as lookup_key
    features: [
      '無限制工廠管理',
      '實時機器監控',
      '數據分析報告',
      '警報系統',
      '24/7 客戶支持',
      '數據導出功能',
    ],
  },
  {
    id: 'enterprise_monthly',
    name: '企業方案',
    price: 99.99,
    currency: 'usd',
    interval: 'month',
    stripePlanId: 'enterprise_monthly', // This will be used as lookup_key
    features: [
      '無限制工廠管理',
      '實時機器監控',
      '數據分析報告',
      '警報系統',
      '24/7 客戶支持',
      '數據導出功能',
      'AI 智能助手',
      '專屬客戶經理',
    ],
  },
];

export default function SubscriptionSection() {
  const { user, hasActiveSubscription } = useAuth();
  const { subscription, isLoading, error, cancelSubscription } = useSubscription();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubscribeClick = async (plan: SubscriptionPlan) => {
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

  const handleManageSubscription = async () => {
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

  const handleCancelSubscription = async () => {
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

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusChip = (status: string) => {
    const statusMap = {
      active: { label: '活躍', color: 'success' as const, icon: <CheckIcon /> },
      trialing: { label: '試用中', color: 'info' as const, icon: <CheckIcon /> },
      past_due: { label: '逾期', color: 'warning' as const, icon: <WarningIcon /> },
      canceled: { label: '已取消', color: 'error' as const, icon: <CancelIcon /> },
      inactive: { label: '未啟用', color: 'default' as const, icon: <CancelIcon /> },
    };

    const config = statusMap[status as keyof typeof statusMap] || statusMap.inactive;
    
    return (
      <Chip
        label={config.label}
        color={config.color}
        icon={config.icon}
        size="small"
      />
    );
  };

  return (
    <Box p={3}>
      <Typography variant="h6" gutterBottom>
        訂閱管理
      </Typography>

      {actionMessage && (
        <Alert severity={actionMessage.type} sx={{ mb: 3 }}>
          {actionMessage.text}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          載入訂閱資訊時發生錯誤：{error}
        </Alert>
      )}

      {/* Current Subscription Status */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            當前訂閱狀態
          </Typography>
          
          {isLoading ? (
            <Box display="flex" alignItems="center" gap={2}>
              <CircularProgress size={20} />
              <Typography>載入中...</Typography>
            </Box>
          ) : hasActiveSubscription && subscription ? (
            <Box>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Typography variant="h6">
                  ${subscription.plan.amount / 100} {subscription.plan.currency.toUpperCase()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  / {subscription.plan.interval === 'month' ? '月' : '年'}
                </Typography>
                {getStatusChip(subscription.status)}
              </Box>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                當前週期：{formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
              </Typography>

              <Box mt={2} display="flex" gap={2}>
                <Button
                  variant="contained"
                  onClick={handleManageSubscription}
                  disabled={isOpeningPortal}
                  startIcon={isOpeningPortal ? <CircularProgress size={20} /> : <CreditCardIcon />}
                >
                  {isOpeningPortal ? '打開中...' : '管理訂閱'}
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setCancelDialogOpen(true)}
                  startIcon={<CancelIcon />}
                >
                  取消訂閱
                </Button>
              </Box>
            </Box>
          ) : (
            <Box>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                您目前沒有活躍的訂閱
              </Typography>
              <Typography variant="body2" color="text.secondary">
                選擇下方的訂閱方案開始使用我們的服務
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Subscription Plans */}
      {!hasActiveSubscription && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              選擇訂閱方案
            </Typography>
            
            <Grid container spacing={3} mt={1}>
              {mockPlans.map((plan) => (
                <Grid item xs={12} md={6} key={plan.id}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h5" component="div">
                          {plan.name}
                        </Typography>
                        <Box display="flex" alignItems="baseline">
                          <Typography variant="h4" component="span" color="primary">
                            ${plan.price}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" ml={1}>
                            /{plan.interval === 'month' ? '月' : '年'}
                          </Typography>
                        </Box>
                      </Box>

                      <List dense>
                        {plan.features.map((feature, index) => (
                          <ListItem key={index} sx={{ px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <CheckIcon color="primary" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={feature} />
                          </ListItem>
                        ))}
                      </List>

                      <Box mt={3}>
                        <Button
                          variant="contained"
                          fullWidth
                          size="large"
                          onClick={() => handleSubscribeClick(plan)}
                          disabled={isCreatingCheckout}
                          startIcon={isCreatingCheckout ? <CircularProgress size={20} /> : <CreditCardIcon />}
                        >
                          {isCreatingCheckout ? '跳轉中...' : '立即訂閱'}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}


      {/* Cancel Subscription Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>取消訂閱</DialogTitle>
        <DialogContent>
          <Typography>
            您確定要取消訂閱嗎？您將可以繼續使用服務直到當前付費週期結束（{subscription && formatDate(subscription.currentPeriodEnd)}），
            之後將失去對儀表板的訪問權限。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>
            保留訂閱
          </Button>
          <Button
            onClick={handleCancelSubscription}
            color="error"
            disabled={isCancelling}
            startIcon={isCancelling ? <CircularProgress size={20} /> : null}
          >
            {isCancelling ? '取消中...' : '確認取消'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}