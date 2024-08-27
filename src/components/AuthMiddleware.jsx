import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const AuthMiddleware = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    console.log('Checking token...');
    if (token) {
      console.log('Token exists');
      if (location.pathname === '/login') {
        console.log('Redirecting to home');
        navigate('/', { replace: true });
      }
    } else {
      console.log('No token found, redirecting to login');
      if (location.pathname !== '/login') {
        navigate('/login', { replace: true });
      }
    }
  }, [navigate, location, token]);

  return children;
};

export default AuthMiddleware;
