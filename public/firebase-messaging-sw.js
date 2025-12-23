// Importer les scripts Firebase nécessaires
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

// Récupération de Messaging
const messaging = firebase.messaging();

// 🔔 RÉCEPTION DES NOTIFICATIONS EN ARRIÈRE-PLAN (SITE FERMÉ)
messaging.onBackgroundMessage(function (payload) {
  console.log("Notification reçue en arrière-plan :", payload);

  const title = payload.notification?.title || "Nouvelle notification";
  const options = {
    body: payload.notification?.body || "Vous avez un nouveau message",
    icon: "/icon.png", // optionnel
    badge: "/badge.png", // optionnel
  };

  self.registration.showNotification(title, options);
});
