import { useState } from 'react';
import { 
  Box, 
  Stack, 
  Typography, 
  Link, 
  Divider, 
  Card,
  Button,
  alpha 
} from '@mui/material';
import { Input } from 'src/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';
import { useTheme } from '@mui/material/styles';
import { bgGradient } from 'src/theme/css';

import { useRouter } from 'src/routes/hooks';
import { useAuth } from 'src/contexts/AuthContext';
import { useFormValidation, validateEmail, validateRequired } from 'src/utils/validation';

import Logo from 'src/components/logo';
import Iconify from 'src/components/iconify';
import type { InputChangeEvent, ButtonClickEvent } from 'src/types';

export default function LoginView() {
  const router = useRouter();
  const theme = useTheme();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleClick = async (): Promise<void> => {
    setLoading(true);
    try {
      const token = await login(email, password);
      if (token) {
        // Navigation is handled by the AuthContext login function
        console.log('Login successful, redirecting to factory page');
      } else {
        alert('Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderForm = (
    <>
      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email address
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e: InputChangeEvent) => setEmail(e.target.value)}
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2">
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e: InputChangeEvent) => setPassword(e.target.value)}
              className="w-full pr-10"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
              onClick={(e: ButtonClickEvent) => {
                e.preventDefault();
                setShowPassword(!showPassword);
              }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end my-6">
        <button
          type="button"
          className="text-sm text-blue-600 hover:text-blue-800 underline"
          onClick={() => router.push('/forget-password')}
        >
          Forgot password?
        </button>
      </div>

      <Button
        fullWidth
        size="large"
        variant="contained"
        disabled={loading}
        onClick={handleClick}
        sx={{ mt: 3, mb: 2 }}
      >
        {loading ? 'Loading...' : 'Login'}
      </Button>
    </>
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
        <Card
          sx={{
            p: 5,
            width: 1,
            maxWidth: 420,
          }}
        >
          <Typography variant="h4">Sign in to Minimal</Typography>

          <Typography variant="body2" sx={{ mt: 2, mb: 5 }}>
            Don’t have an account?
            <Link variant="subtitle2" sx={{ ml: 0.5 }} onClick={() => router.push('/signup')}>
              Get started
            </Link>
          </Typography>

          <Stack direction="row" spacing={2}>
            <Button
              fullWidth
              size="large"
              color="inherit"
              variant="outlined"
              sx={{ borderColor: alpha(theme.palette.grey[500], 0.16) }}
            >
              <Iconify icon="eva:google-fill" color="#DF3E30" />
            </Button>
{/* 
            <Button
              fullWidth
              size="large"
              color="inherit"
              variant="outlined"
              sx={{ borderColor: alpha(theme.palette.grey[500], 0.16) }}
            >
              <Iconify icon="eva:facebook-fill" color="#1877F2" />
            </Button>

            <Button
              fullWidth
              size="large"
              color="inherit"
              variant="outlined"
              sx={{ borderColor: alpha(theme.palette.grey[500], 0.16) }}
            >
              <Iconify icon="eva:twitter-fill" color="#1C9CEA" />
            </Button> */}
          </Stack>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              OR
            </Typography>
          </Divider>

          {renderForm}
        </Card>
      </Stack>
    </Box>
  );
}
