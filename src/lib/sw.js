// public/sw.js — Service Worker for Homy push notifications
// This file must be at /public/sw.js to be served from the root

const APP_URL = self.location.origin;
const CACHE_NAME = "homy-v1";

// Install event — cache critical assets
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

// Activate event
self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

// Push notification received
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: "Homy", body: event.data.text() };
  }

  const {
    title = "Homy",
    body = "",
    icon = "/favicon.png",
    badge = "/favicon.png",
    url = "/dashboard",
    image,
  } = data;

  const options = {
    body,
    icon,
    badge,
    data: { url },
    vibrate: [100, 50, 100],
    requireInteraction: false,
    ...(image ? { image } : {}),
    actions: [
      { action: "view", title: "View", icon: "/favicon.png" },
      { action: "dismiss", title: "Dismiss" },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const url = event.notification.data?.url || "/dashboard";
  const fullUrl = url.startsWith("http") ? url : `${APP_URL}${url}`;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Focus existing window if open
        for (const client of clientList) {
          if (client.url.startsWith(APP_URL) && "focus" in client) {
            client.navigate(fullUrl);
            return client.focus();
          }
        }
        // Open new window
        if (clients.openWindow) return clients.openWindow(fullUrl);
      })
  );
});
