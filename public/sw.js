// VagaGo Web App (PWA) Service Worker — Cache Buster e Rede Direta
const CACHE_NAME = 'vagago-v3-osm-clean';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          // Deleta todos os caches antigos do navegador
          return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Se for tile do carto (antigo), bloqueia imediatamente para não usar cache corrompido
  if (event.request.url.includes('carto') || event.request.url.includes('cartocdn')) {
    event.respondWith(new Response('', { status: 404, statusText: 'Deprecated' }));
    return;
  }
  // Demais requisições passam direto para a rede
  if (event.request.method !== 'GET') return;
});
