// Service worker (web build only; never registered inside the Android app).
// Precache-only: every file of the build is cached at install, then served from the cache.
// VERSION and PRECACHE are filled in by tools/build-sw.mjs after `vite build`.
const VERSION = "75bb48c7561c";
const PRECACHE = [
  "./anatomy/body.glb",
  "./assets/esm-CrZfiSqU.js",
  "./assets/esm-DRz_8yLi.js",
  "./assets/fs-adapter-kHb6Eo3w.js",
  "./assets/idb-adapter-D11SiBdq.js",
  "./assets/index-CfV77QhW.js",
  "./assets/index-Do-Uybab.css",
  "./assets/viewer-CCd2CHU1.js",
  "./assets/web-BjjgPfAy.js",
  "./assets/web-D8KoPkko.js",
  "./assets/web-NVbUOyAx.js",
  "./fonts/Vazirmatn-wght.woff2",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-32.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/icon.svg",
  "./",
  "./licenses/bodyparts3d.txt",
  "./licenses/jalaali-js-MIT.txt",
  "./licenses/three-MIT.txt",
  "./licenses/vazirmatn-OFL.txt",
  "./manifest.webmanifest"
];
const CACHE = `gymlog-${VERSION}`;
const SCOPE = new URL('./', self.location).href;

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    for (const url of PRECACHE) {
      const res = await fetch(new Request(url, { cache: 'reload' }));
      if (!res.ok) throw new Error(`precache failed: ${url} ${res.status}`);
      await cache.put(url, res);
    }
  })());
  // no skipWaiting(): the page shows «نسخهٔ جدید آماده است» and the user decides when to switch
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key.startsWith('gymlog-') && key !== CACHE) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  if (!req.url.startsWith(SCOPE)) {
    // fully offline app: nothing outside our own scope is ever loaded
    if (new URL(req.url).origin !== self.location.origin) event.respondWith(Response.error());
    return;
  }
  if (req.mode === 'navigate') {
    event.respondWith(caches.open(CACHE).then((c) => c.match('./', { ignoreVary: true })).then((r) => r || fetch(req)));
    return;
  }
  // ignoreVary: static files only; servers may send `Vary: Origin`, and module imports carry an Origin header
  event.respondWith(caches.open(CACHE).then((c) => c.match(req, { ignoreSearch: true, ignoreVary: true })).then((r) => r || fetch(req)));
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
