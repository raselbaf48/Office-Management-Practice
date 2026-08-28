import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { installApiInterceptor } from './services/apiBridge';

// Initialize Universal Data Engine & API Bridge for Vercel and offline resilience
installApiInterceptor();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

