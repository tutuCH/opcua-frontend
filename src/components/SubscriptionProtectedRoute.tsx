import React, { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  CreditCard as CreditCardIcon,
  Lock as LockIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../hooks/useSubscription';

const SubscriptionRequiredPage = () => {
  const { user, refreshUserData } = useAuth();
  const { refreshSubscription } = useSubscription();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const features = [
    '無限制工廠管理',
    '實時機器監控',
    '數據分析報告', 
    '警報系統',
    '24/7 客戶支持',
    '數據導出功能',
  ];

  const handleRefreshSubscription = async () => {
    setIsRefreshing(true);
    try {
      await refreshSubscription();
      await refreshUserData();
    } catch (error) {
      console.error('Failed to refresh subscription:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box textAlign="center" mb={4}>
        <LockIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom>
          需要訂閱
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          訪問 OPC UA 儀表板需要有效的訂閱
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body1">
          您好 {user?.username}！要繼續使用我們的工業監控平台，請升級到付費訂閱。
        </Typography>
      </Alert>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom textAlign="center">
            月度訂閱方案
          </Typography>
          
          <Box display="flex" justifyContent="center" alignItems="baseline" mb={3}>
            <Typography variant="h3" component="span" color="primary">
              $29.99
            </Typography>
            <Typography variant="h6" color="text.secondary" ml={1}>
              /月
            </Typography>
          </Box>

          <Typography variant="h6" gutterBottom>
            包含功能：
          </Typography>
          
          <List>
            {features.map((feature, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <CheckIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary={feature} />
              </ListItem>
            ))}
          </List>

          <Box textAlign="center" mt={4}>
            <Button
              variant="contained"
              size="large"
              startIcon={<CreditCardIcon />}
              onClick={() => window.location.href = '/settings'}
              sx={{ px: 4, py: 1.5 }}
            >
              立即訂閱
            </Button>
          </Box>

          <Typography variant="body2" color="text.secondary" textAlign="center" mt={2}>
            隨時可以取消 • 安全支付 • 即時啟用
          </Typography>
        </CardContent>
      </Card>

      <Box textAlign="center">
        <Typography variant="body2" color="text.secondary" mb={2}>
          已經有訂閱了？請檢查您的訂閱狀態在{' '}
          <Button variant="text" onClick={() => window.location.href = '/settings'}>
            設定頁面
          </Button>
        </Typography>
        
        <Box display="flex" justifyContent="center" alignItems="center" gap={2}>
          <Button
            variant="outlined"
            size="small"
            startIcon={isRefreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
            onClick={handleRefreshSubscription}
            disabled={isRefreshing}
          >
            {isRefreshing ? '檢查中...' : '重新檢查訂閱狀態'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

interface SubscriptionProtectedRouteProps {
  children?: React.ReactNode;
}

const SubscriptionProtectedRoute: React.FC<SubscriptionProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, hasActiveSubscription, loading } = useAuth();

  // Show loading while checking auth status
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Typography>載入中...</Typography>
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Show subscription required page if no active subscription
  if (!hasActiveSubscription) {
    return <SubscriptionRequiredPage />;
  }

  // Render children or outlet if subscription is active
  return children ? <>{children}</> : <Outlet />;
};

export default SubscriptionProtectedRoute;