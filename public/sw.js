// public/sw.js
// Service worker minimal : PWA offline-shell + push notifications.
// Partagé par le site public, /partner-portal/, /prestataire-portal/ et /dashboard/.

const CACHE_NAME = "yitewo-shell-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// ── Push reçu ────────────────────────────────────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "Yitewo", body: event.data.text() };
  }

  const title = payload.title || "Yitewo";
  const options = {
    body: payload.body || "",
    icon: payload.icon || "/icons/icon-192.png",
    badge: "/icons/badge-96.png",
    tag: payload.tag || undefined,
    data: { url: payload.url || "/", ...(payload.data || {}) },
    vibrate: [100, 50, 100],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ── Clic sur la notification ────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        // Si un onglet Yitewo est déjà ouvert, on le réutilise et on navigue dedans.
        if ("focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    }),
  );
});

// ── Abonnement expiré / changé (rotation navigateur) ────────
// Rare, mais certains navigateurs régénèrent l'abonnement periodiquement.
// On ne peut pas ré-envoyer au backend depuis ici (pas de token/JWT dans ce contexte isolé) :
// le hook client (useWebPush) redétecte et resynchronise à la prochaine visite de la page.
self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil(
    self.registration.pushManager
      .subscribe({
        userVisibleOnly: true,
        applicationServerKey: event.oldSubscription?.options?.applicationServerKey,
      })
      .catch(() => null),
  );
});
