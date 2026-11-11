// VagaGo Web App (PWA) Service Worker — Modo Online Seguro (sem cache obsoleto)
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Passa direto para a rede garantindo sempre a versao mais recente
  if (event.request.method !== 'GET') return;
});
