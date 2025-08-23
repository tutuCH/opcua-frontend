// src/pages/AuthCallback.jsx
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const AuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    async function exchangeCode() {
      const searchParams = new URLSearchParams(location.search);
      const code = searchParams.get('code');
      if (code) {
        try {
          console.log('code', code);
          // Call your backend endpoint to exchange the code for tokens
          const response = await fetch(`http://localhost:3000/auth/callback${  location.search}`, {
            method: 'GET',
            credentials: 'include', // include cookies if using session
          });
          if (response.ok) {
            // On success, redirect to the home page (or wherever you want)
            navigate('/', { replace: true });
          } else {
            console.error('Failed to exchange code:', response.statusText);
            // Handle error (maybe redirect to an error page)
          }
        } catch (err) {
          console.error('Error exchanging code:', err);
        }
      }
    }
    exchangeCode();
  }, [location.search, navigate]);

  return <div>Processing authentication...</div>;
};

export default AuthCallback;
