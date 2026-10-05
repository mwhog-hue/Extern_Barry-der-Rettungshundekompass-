/* BARRY · Testversion – Service Worker
   Eigener Cache-Name, damit sich Test- und Staffelversion auf derselben GitHub-Adresse nicht gegenseitig stören.
   Bei jeder neuen Fassung VERSION erhöhen. */
const VERSION = '2.46-test-1';
const PREFIX = 'barry-tester-';
const CACHE = PREFIX + VERSION;
const DATEIEN = ['./', './index.html', './manifest.webmanifest', './favicon.ico',
  './rhs-favicon-32.png', './rhs-apple-touch-icon.png', './icon-192.png', './icon-512.png', './icon-512-maskable.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(DATEIEN)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith(PREFIX) && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  // Seite selbst: zuerst Netz (damit Aktualisierungen ankommen), offline aus dem Cache
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => { const k = r.clone(); caches.open(CACHE).then(c => c.put('./index.html', k)); return r; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  // Icons, Manifest: zuerst Cache
  e.respondWith(caches.match(req).then(t => t || fetch(req)));
});
