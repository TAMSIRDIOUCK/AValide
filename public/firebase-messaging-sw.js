// Import des scripts Firebase
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

// Initialisation Firebase
firebase.initializeApp({
  apiKey: "AIzaSyBNM88NZV3Rxsj-rp25zB1QWfwTSO0_KnQ",
  authDomain: "avalide-push.firebaseapp.com",
  projectId: "avalide-push",
  messagingSenderId: "1027830005942",
  appId: "1:1027830005942:web:adb58cde5396468f33e617",
});

const messaging = firebase.messaging();

// Notifications en arrière-plan (site fermé ou minimisé)
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "Nouvelle commande AValide";
  const options = {
    body: payload.notification?.body || "Vous avez une nouvelle commande",
    icon: "/videos/IMG_1696.jpg",
    badge: "/videos/IMG_1696.jpg",
    data: { url: "/orders" }, // redirection vers MyOrdersPage
  };

  self.registration.showNotification(title, options);
});

// Clic sur la notification → redirection vers MyOrdersPage
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(event.notification.data.url);
          return client.focus();
        }
      }
      return clients.openWindow(event.notification.data.url);
    })
  );
});
