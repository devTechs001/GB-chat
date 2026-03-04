import { useEffect } from 'react';

const ServiceWorkerRegistration = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[PWA] ServiceWorker registration successful:', registration.scope);
            
            // Check for updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('[PWA] New content available, please refresh.');
                    // You could show an update prompt here
                  }
                });
              }
            });
          })
          .catch((error) => {
            console.error('[PWA] ServiceWorker registration failed:', error);
          });
      });
    }
  }, []);

  return null;
};

export default ServiceWorkerRegistration;
