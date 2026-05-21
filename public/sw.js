const CACHE_NAME = "pantrypal-shell-v1";
const APP_SHELL = [
  "/",
  "/shopping",
  "/inventory",
  "/ideas",
  "/settings",
  "/manifest.webmanifest",
  "/icons/pantrypal-icon.svg",
  "/icons/pantrypal-192.png",
  "/icons/pantrypal-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match("/shopping")))
  );
});

self.addEventListener("push", (event) => {
  let payload = {
    title: "PantryPal reminder",
    body: "You have household items to check.",
    url: "/shopping"
  };

  if (event.data) {
    try {
      payload = { ...payload, ...event.data.json() };
    } catch {
      payload.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/icons/pantrypal-192.png",
      badge: "/icons/pantrypal-maskable-512.png",
      data: { url: payload.url }
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/shopping";
  event.waitUntil(self.clients.openWindow(url));
});
