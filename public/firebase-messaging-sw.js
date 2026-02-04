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

// 🔔 NOTIFICATIONS BACKGROUND (OBLIGATOIRE POUR iOS)
messaging.onBackgroundMessage((payload) => {
  console.log("[SW] Payload reçu:", payload);

  const title = payload.data?.title || "Nouvelle commande AValide";
  const options = {
    body: payload.data?.body || "Vous avez une nouvelle commande",
    icon: "/videos/IMG_1696.jpg",
    badge: "/videos/IMG_1696.jpg",
    data: { url: "/orders" },
  };

  self.registration.showNotification(title, options);
});

// 👉 Action au clic
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});