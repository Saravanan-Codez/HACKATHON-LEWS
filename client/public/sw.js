// Landsora Early Warning System Service Worker
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow("/dashboard");
      }
    })
  );
});

self.addEventListener("push", (event) => {
  if (!event.data) return;
  try {
    const payload = event.data.json();
    const title = payload.title || "🚨 Landsora Landslide Warning";
    const options = {
      body: payload.body || "Critical slope displacement detected.",
      icon: "/assets/lews-logo.png",
      badge: "/assets/lews-logo.png",
      tag: payload.tag || "landsora-alert",
      requireInteraction: true,
      data: payload,
    };
    event.waitUntil(self.registration.showNotification(title, options));
  } catch (e) {
    const text = event.data.text();
    event.waitUntil(
      self.registration.showNotification("🚨 Landsora Alert", {
        body: text,
        icon: "/assets/lews-logo.png",
      })
    );
  }
});
