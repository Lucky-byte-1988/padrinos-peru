import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Registrar el Service Worker → la app se puede instalar y funciona offline
// y SIEMPRE muestra la última versión: si hay una nueva, se actualiza y recarga sola.
if ('serviceWorker' in navigator) {
  let refrescando = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refrescando) return;
    refrescando = true;
    window.location.reload(); // cargar la versión nueva al instante
  });
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      reg.update(); // buscar actualización en cada carga
      reg.addEventListener('updatefound', () => {
        const nuevo = reg.installing;
        if (!nuevo) return;
        nuevo.addEventListener('statechange', () => {
          if (nuevo.state === 'installed' && navigator.serviceWorker.controller) {
            nuevo.postMessage && nuevo.postMessage('skipWaiting');
          }
        });
      });
    }).catch(() => {});
  });
}

reportWebVitals();
