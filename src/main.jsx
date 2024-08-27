// src/main.jsx
import { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import App from './app';
import { setupAxiosInterceptors } from 'src/utils/axiosInterceptor';  // Setup Axios interceptors

// ----------------------------------------------------------------------

setupAxiosInterceptors();  // Initialize interceptors

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <HelmetProvider>
    <BrowserRouter>
      <Suspense>
        <App />
      </Suspense>
    </BrowserRouter>
  </HelmetProvider>
);
