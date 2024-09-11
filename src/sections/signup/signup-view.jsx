import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import LoadingButton from '@mui/lab/LoadingButton';
import { alpha, useTheme } from '@mui/material/styles';
import { bgGradient } from 'src/theme/css';
import { userSignup, userVerifyEmail } from 'src/api/authServices'; // Assuming there is a signup function
import Logo from 'src/components/logo';

export default function SignupView() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const PAGE_STATUS = {
    SIGN_UP: 1,
    SIGN_UP_SUCCESS: 2,
    SIGN_UP_FAIL: 3,
    VERIFY_EMAIL: 4,
    VERIFY_EMAIL_SUCCESS: 5,
    VERIFY_EMAIL_FAIL: 6,
  };
  const [pageState, setPageState] = useState(PAGE_STATUS.SIGN_UP); // Set initial state
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      // Token found, move to verify email state
      setPageState(PAGE_STATUS.VERIFY_EMAIL);
      handleVerifyEmail(token);
    }
  }, [searchParams]);

  const handleClick = async () => {
    if (password !== confirmPassword) {
      alert('Passwords do not match. Please try again.');
      return;
    }

    setLoading(true);
    try {
      const { status, message } = await userSignup(email, password, companyName);
      if (status === 'success') {
        setPageState(PAGE_STATUS.SIGN_UP_SUCCESS);
      } else {
        alert('Signup failed. Please try again.');
      }
    } catch (error) {
      alert('An error occurred during signup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (token) => {
    try {
      const { status } = await userVerifyEmail(token);
      if (status === 'success') {
        setPageState(PAGE_STATUS.VERIFY_EMAIL_SUCCESS);
        setTimeout(() => {
          navigate('/');
        }, 2000); // Redirect after 2 seconds
      } else {
        setPageState(PAGE_STATUS.VERIFY_EMAIL_FAIL);
      }
    } catch (error) {
      setPageState(PAGE_STATUS.VERIFY_EMAIL_FAIL);
    }
  };

  // Informational card for SIGN_UP_SUCCESS
  const signUpSuccessCard = (
    <Card
      sx={{
        p: 5,
        width: 1,
        maxWidth: 420,
      }}
    >
      <Typography variant="h4">Sign-Up Successful!</Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        Please check your email and click the verification link to activate your account.
      </Typography>
    </Card>
  );

  // Informational card for VERIFY_EMAIL
  const verifyEmailCard = (
    <Card
      sx={{
        p: 5,
        width: 1,
        maxWidth: 420,
      }}
    >
      <Typography variant="h4">Verifying Your Email...</Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        Please wait while we verify your email.
      </Typography>
    </Card>
  );

  // Informational card for VERIFY_EMAIL_SUCCESS
  const verifyEmailSuccessCard = (
    <Card
      sx={{
        p: 5,
        width: 1,
        maxWidth: 420,
      }}
    >
      <Typography variant="h4">Email Verified!</Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        Your email has been successfully verified. Redirecting you to the homepage...
      </Typography>
    </Card>
  );

  const renderForm = (
    <Card
      sx={{
        p: 5,
        width: 1,
        maxWidth: 420,
      }}
    >
      <Typography variant="h4">Create an Account</Typography>
      <Stack spacing={3} sx={{ margin: "2rem 0" }}>
        <TextField
          name="email"
          label="Email address"
          value={email}
          type="email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          name="companyName"
          label="Company Name"
          value={companyName}
          type="text"
          onChange={(e) => setCompanyName(e.target.value)}
        />
        <TextField
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <TextField
          name="confirmPassword"
          label="Confirm Password"
          type={showPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </Stack>
      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        color="inherit"
        loading={loading}
        onClick={handleClick}
      >
        Sign Up
      </LoadingButton>
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
        {pageState === PAGE_STATUS.SIGN_UP && renderForm}
        {pageState === PAGE_STATUS.SIGN_UP_SUCCESS && signUpSuccessCard}
        {pageState === PAGE_STATUS.VERIFY_EMAIL && verifyEmailCard}
        {pageState === PAGE_STATUS.VERIFY_EMAIL_SUCCESS && verifyEmailSuccessCard}
      </Stack>
    </Box>
  );
}
