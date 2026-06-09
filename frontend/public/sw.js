// Service Worker de CartasANoel.pe — instalable + offline, SIEMPRE con la última versión
const CACHE = 'cartasanoel-v3';
const APP_SHELL = ['/', '/index.html', '/manifest.json', '/logo192.png', '/logo512.png'];

self.addEventListener('install', (e) => {
  self.skipWaiting(); // el SW nuevo toma el control de inmediato
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(APP_SHELL)).catch(() => {}));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  // No cachear la API ni Cloudinary (siempre datos frescos)
  if (url.pathname.startsWith('/api') || url.hostname.includes('cloudinary')) return;

  // index.html / navegación: RED PRIMERO (así siempre ves la última versión)
  if (request.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('index.html')) {
    e.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('/index.html', copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Estáticos con hash (js/css con nombre único): caché rápido, pero refrescando en segundo plano
  e.respondWith(
    caches.match(request).then((cached) => {
      const fresh = fetch(request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
        return res;
      }).catch(() => cached);
      return cached || fresh;
    })
  );
});
