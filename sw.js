// Service Worker - PWA offline real.
// Estratégia:
//  - cache-first pros estáticos (HTML/CSS/JS/icons/fonts)
//  - network-first pra API (com fallback cache se offline)
//  - assets de mídia (audio/img) não cacheados aqui (servidos pela luana-api)

const VERSION = 'v1';
const STATIC_CACHE = `luana-static-${VERSION}`;
const RUNTIME_CACHE = `luana-runtime-${VERSION}`;

// Pre-cache só do shell mínimo. Outros JS vêm via runtime cache.
const SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/styles.css',
  '/js/main.js',
  '/assets/icons/icon.svg',
];

// ===== install: pre-cache do shell =====

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(SHELL).catch(() => {}))
      .then(() => self.skipWaiting()),
  );
});

// ===== activate: limpa caches velhos =====

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== STATIC_CACHE && k !== RUNTIME_CACHE)
            .map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim()),
  );
});

// ===== fetch: roteia por tipo =====

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // não cacheia requests pra outras origens (luana-api, fonts.googleapis)
  // mas tenta network-first com fallback cache
  if (url.origin !== self.location.origin) {
    event.respondWith(networkFirst(req));
    return;
  }

  // Navegação (index.html) - sempre tenta network, fallback cache
  if (req.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(req));
    return;
  }

  // estáticos do mesmo origin - cache-first
  event.respondWith(cacheFirst(req));
});

// ===== estratégias =====

const cacheFirst = async (req) => {
  const cached = await caches.match(req);
  if (cached) return cached;
  try {
    const fresh = await fetch(req);
    if (fresh && fresh.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(req, fresh.clone());
    }
    return fresh;
  } catch {
    return new Response('', { status: 504 });
  }
};

const networkFirst = async (req) => {
  try {
    const fresh = await fetch(req);
    if (fresh && fresh.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(req, fresh.clone()).catch(() => {});
    }
    return fresh;
  } catch {
    const cached = await caches.match(req);
    return cached || new Response('', { status: 504 });
  }
};

const networkFirstNavigation = async (req) => {
  try {
    const fresh = await fetch(req);
    if (fresh && fresh.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put('/index.html', fresh.clone()).catch(() => {});
    }
    return fresh;
  } catch {
    const cached = await caches.match('/index.html');
    return cached || new Response('Offline', { status: 504 });
  }
};

// ===== mensagens (skipWaiting on demand) =====

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
