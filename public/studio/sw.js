/* Mustang Studio on Chromebooks: keeps the editor working offline.
   The page is fetched fresh when there's a connection, and the last copy is used when there isn't. */
const CACHE = 'mustang-studio-1.6.0';
const ASSETS = ['./', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('mustang-studio-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith('/studio/')) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(res => { if (res.ok && !res.redirected) { const copy = res.clone(); caches.open(CACHE).then(c => c.put('./', copy)); } return res; }).catch(() => caches.match('./')));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
});
