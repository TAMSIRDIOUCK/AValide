/* eslint-disable no-undef */

// Firebase compat (OBLIGATOIRE pour SW)
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

// 🔥 INIT FIREBASE
firebase.initializeApp({
  apiKey: "AIzaSyBNM88NZV3Rxsj-rp25zB1QWfwTSO0_KnQ",
  authDomain: "avalide-push.firebaseapp.com",
  projectId: "avalide-push",
  messagingSenderId: "1027830005942",
  appId: "1:1027830005942:web:adb58cde5396468f33e617",
});

const messaging = firebase.messaging();

// 🔔 BACKGROUND MESSAGE (DATA ONLY)
messaging.onBackgroundMessage((payload) => {
  console.log("[SW] Payload reçu:", payload);

  const title = payload.data?.title ?? "Nouvelle notification AValide";
  const body = payload.data?.body ?? "Vous avez une nouvelle notification";

  const notificationOptions = {
    body,
    icon: "/videos/IMG_1696.jpg",
    badge: "/videos/IMG_1696.jpg",
    data: {
      url: payload.data?.url ?? "/",
    },
  };

  self.registration.showNotification(title, notificationOptions);
});

// 👉 CLICK SUR NOTIFICATION
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(event.notification.data.url)) {
          return client.focus();
        }
      }
      return clients.openWindow(event.notification.data.url);
    })
  );
});
