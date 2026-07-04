// オシイレ Service Worker (NFR-10〜12)
// ページ本体はネットワーク優先(常に最新版を表示、オフライン時のみキャッシュ)、
// 静的アセットはキャッシュ優先。
const CACHE = "oshiire-v2";
const PRECACHE = ["/", "/manifest.webmanifest", "/icon.svg"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;

  // ページ(HTML)とAPIはネットワーク優先: 最新版がすぐ届く。オフライン時はキャッシュ
  if (e.request.mode === "navigate" || url.pathname.startsWith("/api/")) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          if (res.ok && e.request.mode === "navigate") {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, clone));
          }
          return res;
        })
        .catch(async () => (await caches.match(e.request)) ?? caches.match("/")),
    );
    return;
  }

  // 静的アセット: キャッシュ優先+裏で更新
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const fresh = fetch(e.request)
        .then((res) => {
          if (res.ok) caches.open(CACHE).then((c) => c.put(e.request, res.clone()));
          return res;
        })
        .catch(() => cached);
      return cached ?? fresh;
    }),
  );
});
