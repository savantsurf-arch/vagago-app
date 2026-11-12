import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { initTelemetry } from './services/telemetry';

initTelemetry();

// Registro e atualização forçada do Service Worker para limpar caches antigos
if (typeof window !== 'undefined') {
  // Limpa qualquer cache persistido no navegador que possa conter tiles obsoletos
  if ('caches' in window) {
    caches.keys().then((keys) => {
      keys.forEach((key) => {
        if (!key.includes('v3')) caches.delete(key);
      });
    }).catch(() => {});
  }

  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then((reg) => {
        reg.update().catch(() => {});
      }).catch(() => {});
    });
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
