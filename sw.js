// Service worker : le site reste utilisable sans réseau.
// - page : réseau d'abord (mises à jour immédiates), copie locale si hors connexion
// - Chart.js et polices : copie locale d'abord (elles ne changent pas)
// - les données d'historique sont gardées par la page elle-même (IndexedDB)
const SITE = "meteo-neige";
const CACHE = SITE + "-v1";
const PRECACHE = [
  "./",
  "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js",
  "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Space+Grotesk:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap",
];
const STATIC_HOSTS = ["cdnjs.cloudflare.com", "fonts.googleapis.com", "fonts.gstatic.com"];
const CACHE_API = false;

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(PRECACHE.map(u => c.add(new Request(u, { mode: u.startsWith("http") ? "no-cors" : "same-origin" })).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  // n'efface que les anciennes versions de CE site (les autres sites fef73.github.io partagent le même stockage)
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith(SITE + "-") && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function withTimeout(promise, ms){
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("timeout")), ms);
    promise.then(r => { clearTimeout(t); resolve(r); }, err => { clearTimeout(t); reject(err); });
  });
}

async function networkFirst(req, cacheKey, timeoutMs, onFallback, stampIt){
  const cache = await caches.open(CACHE);
  try{
    const res = await withTimeout(fetch(req), timeoutMs);
    if(res && res.ok && stampIt){
      // copie horodatée (l'en-tête Date du serveur n'est pas lisible par la page)
      const body = await res.clone().blob();
      cache.put(cacheKey, new Response(body, { status: res.status, headers: {
        "content-type": res.headers.get("content-type") || "application/json",
        "x-saved-at": new Date().toISOString(),
      }}));
    } else if(res && (res.ok || res.type === "opaque")) cache.put(cacheKey, res.clone());
    return res;
  }catch(err){
    const hit = await cache.match(cacheKey, { ignoreSearch: typeof cacheKey === "string" });
    if(hit){ if(onFallback) onFallback(hit); return hit; }
    throw err;
  }
}

async function cacheFirst(req){
  const cache = await caches.open(CACHE);
  const hit = await cache.match(req, { ignoreVary: true });
  if(hit) return hit;
  const res = await fetch(req);
  if(res && (res.ok || res.type === "opaque")) cache.put(req, res.clone());
  return res;
}

self.addEventListener("fetch", e => {
  const req = e.request;
  if(req.method !== "GET") return;
  const url = new URL(req.url);

  // La page du site (avec ou sans ?lat=…&lon=…) : une seule copie locale, sans les paramètres
  if(req.mode === "navigate" && url.origin === self.location.origin){
    e.respondWith(networkFirst(req, new URL("./", self.registration.scope).href, 6000));
    return;
  }
  if(STATIC_HOSTS.includes(url.hostname)){
    e.respondWith(cacheFirst(req));
    return;
  }
  if(CACHE_API && url.hostname.endsWith("open-meteo.com") && !url.hostname.startsWith("geocoding")){
    e.respondWith(networkFirst(req, req, 10000, hit => {
      // prévient la page que ces données viennent de la copie locale
      self.clients.get(e.clientId).then(c => c && c.postMessage({ type: "offline-data", date: hit.headers.get("x-saved-at") }));
    }, true));
  }
});
