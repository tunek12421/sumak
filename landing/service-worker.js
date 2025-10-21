/**
 * Service Worker para SUMAQ Landing
 * Versión minimalista - Solo lo esencial para PWA
 */

const CACHE_NAME = 'sumaq-landing-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/src/styles/main.css',
  '/src/scripts/main.js'
];

// Instalación - Cachear recursos esenciales
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Cacheando recursos');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting()) // Activar inmediatamente
  );
});

// Activación - Limpiar caches antiguos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name !== CACHE_NAME)
            .map(name => caches.delete(name))
        );
      })
      .then(() => self.clients.claim()) // Tomar control inmediatamente
  );
});

// Fetch - Estrategia: Network First, fallback a Cache
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clonar respuesta para cachear
        const responseClone = response.clone();

        // Cachear solo GET requests exitosos
        if (event.request.method === 'GET' && response.status === 200) {
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, responseClone));
        }

        return response;
      })
      .catch(() => {
        // Si falla la red, usar cache
        return caches.match(event.request);
      })
  );
});
