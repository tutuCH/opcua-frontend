import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from 'src/contexts/AuthContext';

interface AuthMiddlewareProps {
  children: React.ReactNode;
}

const AuthMiddleware: React.FC<AuthMiddlewareProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();
  const lastNavigationRef = useRef<string>('');

  useEffect(() => {
    // Don't navigate while auth context is still loading
    if (loading) return;

    const NO_AUTH_PATHS = ['/login', '/signup', '/forget-password'];
    const isPathNoAuth = NO_AUTH_PATHS.includes(location.pathname);
    const currentPath = location.pathname;

    // Prevent repeated navigation to the same path
    if (lastNavigationRef.current === currentPath) return;

    if (isAuthenticated) {
      if (isPathNoAuth) {
        lastNavigationRef.current = '/factory';
        navigate('/factory', { replace: true });
      }
    } else if (!isPathNoAuth) {
      lastNavigationRef.current = '/login';
      navigate('/login', { replace: true });
    }
  }, [navigate, location.pathname, isAuthenticated, loading]);

  // Show loading while auth context is initializing
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthMiddleware;
