// public/sw.js — Homify push notifications service worker
// Must be at public/sw.js so it's served from the root URL /sw.js

const APP_URL = self.location.origin;

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(clients.claim()));

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: "Homify", body: event.data.text() };
  }

  const {
    title = "Homify",
    body = "",
    icon = "/favicon.png",
    badge = "/favicon.png",
    url = "/dashboard",
    image,
  } = data;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge,
      data: { url },
      vibrate: [100, 50, 100],
      requireInteraction: false,
      ...(image ? { image } : {}),
      actions: [
        { action: "view", title: "View" },
        { action: "dismiss", title: "Dismiss" },
      ],
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "dismiss") return;

  const url = event.notification.data?.url || "/dashboard";
  const fullUrl = url.startsWith("http") ? url : `${APP_URL}${url}`;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.startsWith(APP_URL) && "focus" in client) {
            client.navigate(fullUrl);
            return client.focus();
          }
        }
        if (clients.openWindow) return clients.openWindow(fullUrl);
      })
  );
});
