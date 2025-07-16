// src/main.jsx
import { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// Import shadcn ThemeProvider
import { ThemeProvider } from "@/components/theme-provider";
// import { Toaster } from "src/components/ui/toaster";

import App from './app';
import { setupAxiosInterceptors } from 'src/utils/axiosInterceptor';  // Setup Axios interceptors

// ----------------------------------------------------------------------

setupAxiosInterceptors();  // Initialize interceptors

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <HelmetProvider>
    <BrowserRouter>
      {/* Add ThemeProvider for shadcn UI theming support */}
      <ThemeProvider defaultTheme="light" storageKey="ui-theme">
        <Suspense>
          <App />
          {/* Add Toaster component for notifications */}
          {/* <Toaster /> */}
        </Suspense>
      </ThemeProvider>
    </BrowserRouter>
  </HelmetProvider>
);
