import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster }    from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.jsx';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            fontFamily: 'DM Sans, sans-serif',
            fontSize:   '14px',
            borderRadius: '12px',
            padding: '12px 16px',
          },
          success: {
            style: {
              background: '#ecfdf5',
              color:      '#065f46',
              border:     '1px solid #6ee7b7',
            },
            iconTheme: {
              primary:    '#10b981',
              secondary:  '#ecfdf5',
            },
          },
          error: {
            style: {
              background: '#fef2f2',
              color:      '#991b1b',
              border:     '1px solid #fca5a5',
            },
            iconTheme: {
              primary:    '#ef4444',
              secondary:  '#fef2f2',
            },
          },
        }}
      />
    </AuthProvider>
  </StrictMode>
);