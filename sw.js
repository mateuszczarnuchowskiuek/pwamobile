const CACHE = 'photomap-v2';

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches
            .open(CACHE)
            .then((cache) =>
                cache.addAll([
                    './',
                    './index.html',
                    './index.js',
                    './manifest.json',
                    './camera-off.svg',
                    './icon-192x192.png',
                    './icon-512x512.png',
                ]),
            ),
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((res) => res || fetch(e.request)),
    );
});
