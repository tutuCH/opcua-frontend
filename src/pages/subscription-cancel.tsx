import React from 'react';
import { useNavigate } from 'react-router-dom';
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
            訂閱已取消
          </Typography>
          <Typography variant="h6" gutterBottom>
            您的付款過程已被取消
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={4}>
            沒有問題！您可以隨時返回完成訂閱流程。您的賬戶沒有被收取任何費用。
          </Typography>
          
          <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
            <Button
              variant="contained"
              size="large"
              onClick={handleTryAgain}
              startIcon={<RefreshIcon />}
            >
              重新訂閱
            </Button>
            <Button
              variant="outlined"
              onClick={handleReturnToSettings}
              startIcon={<ArrowBackIcon />}
            >
              返回設置
            </Button>
          </Box>

          <Box mt={4} p={2} sx={{ backgroundColor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              如果您在訂閱過程中遇到任何問題，請聯繫我們的客服團隊，我們很樂意為您提供幫助。
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}