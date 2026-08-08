import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import App from './App';
import { RoomProvider } from './contexts/RoomContext.js';
import { ThemeProvider } from './contexts/ThemeContext.js';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <RoomProvider>
          <App />
        </RoomProvider>
      </ThemeProvider>
      <Toaster position="top-right" richColors closeButton />
    </BrowserRouter>
  </React.StrictMode>
);
