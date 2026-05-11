const CACHE = "hub-central-v4";
const ASSETS = ["/centraltols/","/centraltols/index.html","/centraltols/manifest.json"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(ASSETS.map(u => c.add(u)))));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.hostname.includes("supabase") || url.hostname.includes("googleapis") || url.hostname.includes("jsdelivr")) return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res.ok) { const c2 = res.clone(); caches.open(CACHE).then(c=>c.put(e.request,c2)); }
        return res;
      }).catch(() => cached);
    })
  );
});
