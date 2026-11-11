const CACHE='travel-portfolio-shell-v1';
const SHELL=['/','/index.html','/style-v2.css','/app.js','/core.js','/demo.js','/excel.js','/config.js','/vendor/exceljs-4.4.0.min.js','/manifest.webmanifest','/icon.svg','/icon-192.png','/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)));self.skipWaiting()});
// Solo administra la caché de esta demostración; no borra otros datos del origen.
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('travel-portfolio-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;e.respondWith(fetch(e.request).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy))}return r}).catch(()=>caches.match(e.request).then(r=>r||new Response('Abre la demo con conexión una vez para conservar la interfaz.',{status:503}))));});
