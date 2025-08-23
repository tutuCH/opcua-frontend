// src/main.jsx
import { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// Import shadcn ThemeProvider
import { setupAxiosInterceptors } from 'src/utils/axiosInterceptor';  // Setup Axios interceptors
import { AuthProvider } from 'src/contexts/AuthContext';
import { ThemeProvider } from "@/components/theme-provider";
// import { Toaster } from "src/components/ui/toaster";

import App from './app';

// ----------------------------------------------------------------------

setupAxiosInterceptors();  // Initialize interceptors

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <HelmetProvider>
    <BrowserRouter>
      {/* Add ThemeProvider for shadcn UI theming support */}
      <ThemeProvider defaultTheme="light" storageKey="ui-theme">
        <AuthProvider>
          <Suspense>
            <App />
            {/* Add Toaster component for notifications */}
            {/* <Toaster /> */}
          </Suspense>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </HelmetProvider>
);
