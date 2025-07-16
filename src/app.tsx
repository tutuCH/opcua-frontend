/* eslint-disable perfectionist/sort-imports */
import 'src/global.css';
import { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import welcomeAnimation from 'src/assets/welcome.json';

import { useScrollToTop } from 'src/hooks/use-scroll-to-top';

import Router from 'src/routes/sections';
import { ThemeProvider } from 'src/components/theme-provider';
import ErrorBoundary from 'src/components/ErrorBoundary';

// ----------------------------------------------------------------------

export default function App() {
  useScrollToTop();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        {isLoading ? (
          <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
            <Lottie
              animationData={welcomeAnimation}
              style={{
                width: 200,
                height: 200,
              }}
            />
          </div>
        ) : (
          <Router />
        )}
      </ThemeProvider>
    </ErrorBoundary>
  );
}
