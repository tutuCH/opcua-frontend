import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import {
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

export default function SubscriptionCancel() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleReturnToSettings = () => {
    navigate('/settings');
  };

  const handleTryAgain = () => {
    navigate('/settings');
  };

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
          <CancelIcon 
            sx={{ 
              fontSize: 80, 
              color: 'warning.main', 
              mb: 2 
            }} 
          />
          <Typography variant="h4" gutterBottom color="warning.main">
            {t('subscription.cancel.title')}
          </Typography>
          <Typography variant="h6" gutterBottom>
            {t('subscription.cancel.subtitle')}
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={4}>
            {t('subscription.cancel.description')}
          </Typography>
          
          <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
            <Button
              variant="contained"
              size="large"
              onClick={handleTryAgain}
              startIcon={<RefreshIcon />}
            >
              {t('subscription.cancel.tryAgain')}
            </Button>
            <Button
              variant="outlined"
              onClick={handleReturnToSettings}
              startIcon={<ArrowBackIcon />}
            >
              {t('subscription.cancel.backToSettings')}
            </Button>
          </Box>

          <Box mt={4} p={2} sx={{ backgroundColor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {t('subscription.cancel.supportNote')}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}