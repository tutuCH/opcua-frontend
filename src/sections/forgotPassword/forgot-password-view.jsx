import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import * as ForgotPasswordStyles from './forgotPasswordStyles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { alpha, useTheme } from '@mui/material/styles';

import { useRouter } from 'src/routes/hooks';
import { userForgetPassword, userResetPassword } from 'src/api/authServices';
import { bgGradient } from 'src/theme/css';
import Logo from 'src/components/logo';

export default function ForgetPasswordView() {
  const theme = useTheme();
  const router = useRouter();
  const navigate = useNavigate(); 
  const PAGE_STATUS = {
    FORGET_PASSWORD: 1,
    FORGET_PASSWORD_SUCCESS: 2,
    FORGET_PASSWORD_FAIL: 3,
    RESET_PASSWORD: 4,
    RESET_PASSWORD_SUCCESS: 5,
    RESET_PASSWORD_FAIL: 6,
  };
  const [email, setEmail] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [pageState, setPageState] = useState(PAGE_STATUS.RESET_PASSWORD_FAIL);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      // Token found, move to reset password state
      setPageState(PAGE_STATUS.RESET_PASSWORD);
    } else {
      setPageState(PAGE_STATUS.FORGET_PASSWORD);
    }
  }, [searchParams]);


  const handleClickForgetPassword = async () => {
    setLoading(true);
    try {
      const res = await userForgetPassword(email);
      if (res.status === 'success') {
        setPageState(PAGE_STATUS.FORGET_PASSWORD_SUCCESS);
      } else {
        setPageState(PAGE_STATUS.FORGET_PASSWORD_FAIL);
      }
    } catch (error) {
      alert('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetPasswordForm = (
    <Card sx={ForgotPasswordStyles.cardContainer}>
      <Typography variant="h4">Enter your email</Typography>
      <Typography variant="body2">
        Please enter your email address below. We will send you an email with a link to reset your
        password.
      </Typography>
      <Stack spacing={3} sx={{ my: 3 }}>
        <TextField
          name="email"
          label="Email address"
          value={email}
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          error={pageState === PAGE_STATUS.FORGET_PASSWORD_FAIL} // Conditional error
          helperText={
            pageState === PAGE_STATUS.FORGET_PASSWORD_FAIL
              ? 'Failed to send reset email. Please try again.'
              : ''
          }
        />
      </Stack>
      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        color="inherit"
        loading={loading}
        onClick={handleClickForgetPassword}
      >
        Send Reset Email
      </LoadingButton>
    </Card>
  );
  const handleClickResetPassword = async () => {
    if (!validatePassword()) {
      return;
    }

    setLoading(true);
    const token = searchParams.get('token'); // Retrieve the token from the URL
    try {
      const res = await userResetPassword({ token, password });
      if (res.status === 'success') {
        setPageState(PAGE_STATUS.RESET_PASSWORD_SUCCESS);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        navigate('/');
      } else {
        setPageState(PAGE_STATUS.RESET_PASSWORD_FAIL);
      }
    } catch (error) {
      setPageState(PAGE_STATUS.RESET_PASSWORD_FAIL);
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = () => {
    // Check password strength (at least 8 characters, one number, one letter)
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long.');
      return false;
    }
    if (!/\d/.test(password)) {
      setPasswordError('Password must contain at least one number.');
      return false;
    }
    if (!/[A-Za-z]/.test(password)) {
      setPasswordError('Password must contain at least one letter.');
      return false;
    }
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return false;
    }
    setPasswordError('');
    return true;
  };  
  const successForgetPasswordCard = (
    <Card sx={ForgotPasswordStyles.cardContainer}>
      <Typography variant="h4">Reset Password Email Sent</Typography>
      <Typography variant="body1">
        We’ve sent a reset link to your email. Please check your inbox and follow the instructions
        to reset your password. You can close this tab now.
      </Typography>
    </Card>
  );

  const resetPasswordFormWithConfirm = (
    <Card sx={ForgotPasswordStyles.cardContainer}>
      <Typography variant="h4">Reset Your Password</Typography>
      <Typography variant="body2">
        Please enter your new password below and confirm it to ensure they match.
      </Typography>
      <Stack spacing={3} sx={{ my: 3 }}>
        <TextField
          name="password"
          label="New Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={!!passwordError}
          helperText={passwordError}
        />
        <TextField
          name="confirmPassword"
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={!!passwordError}
          helperText={passwordError}
        />
      </Stack>
      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        color="inherit"
        loading={loading}
        onClick={handleClickResetPassword}
      >
        Reset Password
      </LoadingButton>
    </Card>
  );

  const resetPasswordSuccessCard = (
    <Card sx={ForgotPasswordStyles.cardContainer}>
      <Typography variant="h4">Password Reset Successful</Typography>
      <Typography variant="body1">
        Your password has been successfully reset. You can now log in with your new password.
      </Typography>
    </Card>
  );

  return (
    <Box
      sx={{
        ...bgGradient({
          color: alpha(theme.palette.background.default, 0.9),
          imgUrl: '/assets/background/overlay_4.jpg',
        }),
        height: 1,
      }}
    >
      <Logo
        sx={{
          position: 'fixed',
          top: { xs: 16, md: 24 },
          left: { xs: 16, md: 24 },
        }}
      />

      <Stack alignItems="center" justifyContent="center" sx={{ height: 1 }}>
        {(pageState === PAGE_STATUS.FORGET_PASSWORD || pageState === PAGE_STATUS.FORGET_PASSWORD_FAIL) && resetPasswordForm}
        {pageState === PAGE_STATUS.FORGET_PASSWORD_SUCCESS && successForgetPasswordCard}
        {(pageState === PAGE_STATUS.RESET_PASSWORD || pageState === PAGE_STATUS.RESET_PASSWORD_FAIL) && resetPasswordFormWithConfirm}
        {pageState === PAGE_STATUS.RESET_PASSWORD_SUCCESS && resetPasswordSuccessCard}
      </Stack>
    </Box>
  );
}
