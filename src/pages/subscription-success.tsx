import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../hooks/useSubscription';

export default function SubscriptionSuccess() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const { refreshUserData } = useAuth();
  const { refreshSubscription } = useSubscription();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifyAndRefreshSubscription = async () => {
      if (!sessionId) {
        setIsVerifying(false);
        setVerificationError(t('subscription.invalidSession'));
        return;
      }

      try {
        // Wait for webhook processing (2 seconds initial delay)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Refresh subscription data
        await refreshSubscription();
        await refreshUserData();
        
        setIsVerifying(false);
      } catch (error) {
        console.error('Failed to refresh subscription:', error);
        
        // Retry up to 3 times with exponential backoff
        if (retryCount < 3) {
          const delay = 2000 * 2**retryCount; // 2s, 4s, 8s
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, delay);
        } else {
          setIsVerifying(false);
          setVerificationError(t('subscription.verificationError'));
        }
      }
    };

    verifyAndRefreshSubscription();
  }, [sessionId, retryCount, refreshSubscription, refreshUserData]);

  const handleReturnToSettings = () => {
    navigate('/settings');
  };

  const handleGoToDashboard = () => {
    navigate('/');
  };

  const handleManualRefresh = async () => {
    setIsVerifying(true);
    setVerificationError(null);
    setRetryCount(0);
  };

  if (isVerifying) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        p={3}
      >
        <CircularProgress size={60} color="primary" />
        <Typography variant="h6" color="text.secondary" mt={3}>
          {t('subscription.success.verifying')}
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          {t('subscription.success.verifyingDescription')}{retryCount > 0 && ` (重試 ${retryCount}/3)`}
        </Typography>
      </Box>
    );
  }

  if (verificationError) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        p={3}
      >
        <Card sx={{ maxWidth: 600, width: '100%' }}>
          <CardContent sx={{ textAlign: 'center', p: 4 }}>
            <Alert severity="error" sx={{ mb: 3 }}>
              {verificationError}
            </Alert>
            <Typography variant="h5" gutterBottom>
              {t('subscription.success.verificationFailed')}
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
              {t('subscription.success.verificationFailedDescription')}
            </Typography>
            <Box display="flex" gap={2} justifyContent="center">
              <Button
                variant="contained"
                onClick={handleManualRefresh}
                startIcon={<RefreshIcon />}
              >
                {t('subscription.success.retryVerification')}
              </Button>
              <Button
                variant="outlined"
                onClick={handleReturnToSettings}
                startIcon={<ArrowBackIcon />}
              >
                {t('subscription.success.backToSettings')}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      p={3}
    >
      <Card sx={{ maxWidth: 600, width: '100%' }}>
        <CardContent sx={{ textAlign: 'center', p: 4 }}>
          <CheckIcon 
            sx={{ 
              fontSize: 80, 
              color: 'success.main', 
              mb: 2 
            }} 
          />
          <Typography variant="h4" gutterBottom color="success.main">
            {t('subscription.success.title')}
          </Typography>
          <Typography variant="h6" gutterBottom>
            {t('subscription.success.welcome')}
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            {t('subscription.success.description')}
          </Typography>
          
          {sessionId && (
            <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
              <Typography variant="body2">
                {t('subscription.success.subscriptionId')}: {sessionId}
              </Typography>
            </Alert>
          )}

          <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
            <Button
              variant="contained"
              size="large"
              onClick={handleGoToDashboard}
            >
              {t('subscription.success.startUsing')}
            </Button>
            <Button
              variant="outlined"
              onClick={handleReturnToSettings}
              startIcon={<ArrowBackIcon />}
            >
              {t('subscription.success.manageSubscription')}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}