importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBNM88NZV3Rxsj-rp25zB1QWfwTSO0_KnQ",
  authDomain: "avalide-push.firebaseapp.com",
  projectId: "avalide-push",
  messagingSenderId: "1027830005942",
  appId: "1:1027830005942:web:adb58cde5396468f33e617",
});

const messaging = firebase.messaging();

// 🔔 Notifications background
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Push reçu:', payload);

  const notification = payload.notification || {};
  const title = notification.title || "Nouvelle commande AValide";

  const options = {
    body: notification.body || "Vous avez une nouvelle commande",
    icon: "/videos/IMG_1696.jpg",
    badge: "/videos/IMG_1696.jpg",
    data: payload.data || { url: "/orders" },
  };

  self.registration.showNotification(title, options);
});

// 👉 Clic notification
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientsArr) => {
      for (const client of clientsArr) {
        if ("focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
