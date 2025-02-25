/* eslint-disable perfectionist/sort-imports */
import 'src/global.css';
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Lottie from 'lottie-react';
import welcomeAnimation from 'src/assets/welcome.json';

import { useScrollToTop } from 'src/hooks/use-scroll-to-top';

import Router from 'src/routes/sections';
import ThemeProvider from 'src/theme';

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
    <ThemeProvider>
      {isLoading ? (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default',
            zIndex: 9999,
          }}
        >
          <Lottie
            animationData={welcomeAnimation}
            style={{
              width: 200,
              height: 200,
            }}
          />
        </Box>
      ) : (
        <Router />
      )}
    </ThemeProvider>
  );
}
