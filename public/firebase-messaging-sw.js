// Import des scripts Firebase (compatibilité)
importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js"
);

// ⚡ Initialisation Firebase
firebase.initializeApp({
  apiKey: "AIzaSyBNM88NZV3Rxsj-rp25zB1QWfwTSO0_KnQ",
  authDomain: "avalide-push.firebaseapp.com",
  projectId: "avalide-push",
  messagingSenderId: "1027830005942",
  appId: "1:1027830005942:web:adb58cde5396468f33e617",
});

// ⚡ Messaging FCM
const messaging = firebase.messaging();

// 🔔 Notifications en background
messaging.onBackgroundMessage((payload) => {
  console.log("[SW] Payload reçu en background:", payload);

  const notificationTitle =
    payload.notification?.title || payload.data?.title || "Nouvelle commande";
  const notificationOptions = {
    body:
      payload.notification?.body ||
      payload.data?.body ||
      "Vous avez reçu une nouvelle commande",
    icon: "/videos/IMG_1696.jpg",
    badge: "/videos/IMG_1696.jpg",
    data: {
      url: payload.data?.url || "/orders",
      orderId: payload.data?.orderId || null,
    },
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// 👆 Action au clic sur la notification
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const clickResponsePromise = async () => {
    const allClients = await clients.matchAll({
      includeUncontrolled: true,
      type: "window",
    });

    let appClient = allClients.find((c) => c.url.includes("/"));

    if (appClient) {
      appClient.focus();
      appClient.navigate(event.notification.data.url);
    } else {
      clients.openWindow(event.notification.data.url);
    }
  };

  event.waitUntil(clickResponsePromise());
});
