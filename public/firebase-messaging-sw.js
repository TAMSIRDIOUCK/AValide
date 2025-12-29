// Import des scripts Firebase
try {
  importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
  importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");
  console.log("✅ Scripts Firebase chargés");
} catch (err) {
  console.error("❌ Erreur lors du chargement des scripts Firebase :", err);
}

// Initialisation Firebase
let messaging;
try {
  firebase.initializeApp({
    apiKey: "AIzaSyBNM88NZV3Rxsj-rp25zB1QWfwTSO0_KnQ",
    authDomain: "avalide-push.firebaseapp.com",
    projectId: "avalide-push",
    messagingSenderId: "1027830005942",
    appId: "1:1027830005942:web:adb58cde5396468f33e617",
  });
  console.log("✅ Firebase initialisé avec succès");

  messaging = firebase.messaging();
  console.log("✅ Messaging Firebase prêt");
} catch (err) {
  console.error("❌ Erreur lors de l'initialisation Firebase/Messaging :", err);
}

// Notifications en arrière-plan
try {
  if (messaging) {
    messaging.onBackgroundMessage((payload) => {
      console.log("📩 Notification reçue en arrière-plan :", payload);

      const title = payload.notification?.title || "Nouvelle notification";
      const options = {
        body: payload.notification?.body || "Vous avez un nouveau message",
        icon: "/icon.png",
        badge: "/badge.png",
        data: payload.data || {},
      };

      self.registration.showNotification(title, options);
      console.log("✅ Notification affichée en arrière-plan");
    });
  }
} catch (err) {
  console.error("❌ Erreur lors de l'écoute des notifications en arrière-plan :", err);
}

// Clic sur la notification
self.addEventListener("notificationclick", (event) => {
  console.log("🔔 Notification cliquée :", event.notification);
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) return clientList[0].focus();
      return clients.openWindow("/");
    })
  );
});
