const CACHE = 'pw-public-prototype-v1';
const FILES = ['./', './index.html', './styles.css', './app.js', './content.js', './assets/icon.svg', './assets/map.svg', './assets/landscape.svg', './manifest.webmanifest'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES))));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('pw-public-prototype-') && key !== CACHE).map(key => caches.delete(key))))));
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  // Only this explicit list of public prototype resources is eligible for caching.
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || !FILES.some(file => new URL(file, self.registration.scope).pathname === url.pathname)) return;
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
