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

/**
 * ✅ BACKGROUND NOTIFICATION
 * ⚠️ NE PAS envoyer "notification" depuis le serveur
 * → seulement "data"
 */
messaging.onBackgroundMessage((payload) => {
  console.log("[FCM SW] Background message:", payload);

  const title = payload.data?.title || "Nouvelle commande AValide";
  const options = {
    body: payload.data?.body || "Vous avez une nouvelle commande",
    icon: "/videos/IMG_1696.jpg",
    badge: "/videos/IMG_1696.jpg",
    data: {
      url: payload.data?.url || "/orders",
      orderId: payload.data?.orderId,
    },
  };

  self.registration.showNotification(title, options);
});

/**
 * ✅ CLICK SUR NOTIFICATION
 */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientsArr) => {
      for (const client of clientsArr) {
        if ("focus" in client) {
          client.focus();
          client.navigate(event.notification.data.url);
          return;
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});
