import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const AuthMiddleware = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('access_token');
  const NO_AUTH_PATHS = ['/login', '/signup', '/forget-password'];

  useEffect(() => {
    const isPathNoAuth = NO_AUTH_PATHS.includes(location.pathname);
    
    if (token) {
      if (isPathNoAuth) {
        navigate('/', { replace: true });
      }
    } else {
      if (!isPathNoAuth) {
        navigate('/login', { replace: true });
      }
    }
  }, [navigate, location.pathname, token]);

  return children;
};

export default AuthMiddleware;
