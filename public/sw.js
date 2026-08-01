// Service Worker mínimo de CreaWeb: permite que el navegador la reconozca
// como "instalable" (PWA). No cachea datos sensibles ni bloquea peticiones
// a la API/Supabase, solo se registra para cumplir el requisito de instalación.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  self.clients.claim();
});

// Passthrough simple: no interceptamos ni cacheamos las peticiones,
// así siempre se ve la info más actual (proyectos, pagos, etc.)
self.addEventListener('fetch', () => {});
