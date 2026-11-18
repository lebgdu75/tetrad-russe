// Тетрадь : cache hors ligne
const VERSION = 'tetrad-5f80a5a6f4';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'core.json', 'ext_idx.txt'];
const EXT = ["forms.txt", "ext/a0.json", "ext/a1.json", "ext/a2.json", "ext/a3.json", "ext/a4.json", "ext/a5.json", "ext/a6.json", "ext/a7.json", "ext/ax0.json", "ext/ax1.json", "ext/n0.json", "ext/n1.json", "ext/n10.json", "ext/n11.json", "ext/n12.json", "ext/n13.json", "ext/n14.json", "ext/n15.json", "ext/n16.json", "ext/n17.json", "ext/n2.json", "ext/n3.json", "ext/n4.json", "ext/n5.json", "ext/n6.json", "ext/n7.json", "ext/n8.json", "ext/n9.json", "ext/nx0.json", "ext/nx1.json", "ext/nx2.json", "ext/nx3.json", "ext/nx4.json", "ext/o0.json", "ext/o1.json", "ext/o2.json", "ext/o3.json", "ext/v0.json", "ext/v1.json", "ext/v2.json", "ext/v3.json", "ext/v4.json", "ext/v5.json", "ext/v6.json", "ext/v7.json", "ext/v8.json", "ext/v9.json", "ext/vx0.json"];
const FONTS = 'tetrad-fonts';

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    await cache.addAll(CORE);
    // the full dictionary is large: cache it without blocking the install
    cache.addAll(EXT).catch(() => {});
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key !== VERSION && key !== FONTS) await caches.delete(key);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith((async () => {
      const cache = await caches.open(FONTS);
      const hit = await cache.match(req);
      if (hit) return hit;
      try { const res = await fetch(req); cache.put(req, res.clone()); return res; } catch (e) { return new Response('', { status: 504 }); }
    })());
    return;
  }
  if (url.origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const key = req.mode === 'navigate' ? 'index.html' : req;
    const hit = await cache.match(key, { ignoreSearch: true });
    if (hit) return hit;
    try {
      const res = await fetch(req);
      if (res.ok) cache.put(key, res.clone());
      return res;
    } catch (e) {
      return new Response('Hors ligne', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }
  })());
});
