// ========================================================
// firebase-messaging-sw.js
// ========================================================

// 1️⃣ Importer les scripts Firebase nécessaires
try {
  importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
  importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");
  console.log("✅ Scripts Firebase chargés");
} catch (err) {
  console.error("❌ Erreur lors du chargement des scripts Firebase :", err);
}

// 2️⃣ Initialiser Firebase
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

// 3️⃣ Notifications en arrière-plan (site fermé ou minimisé)
try {
  if (messaging) {
    messaging.onBackgroundMessage((payload) => {
      console.log("📩 Notification reçue en arrière-plan :", payload);

      const title = payload.notification?.title || "Nouvelle commande AValide";
      const options = {
        body: payload.notification?.body || "Vous avez une nouvelle commande",
        icon: "/logo-avalide.png",   // ton logo AValide
        badge: "/logo-avalide.png",  // même logo pour le badge
        data: {
          url: "/orders",            // redirection vers MyOrdersPage
          ...payload.data,
        },
      };

      // Afficher la notification
      self.registration.showNotification(title, options);
      console.log("✅ Notification affichée en arrière-plan");
    });
  }
} catch (err) {
  console.error("❌ Erreur lors de l'écoute des notifications en arrière-plan :", err);
}

// 4️⃣ Gestion du clic sur la notification
self.addEventListener("notificationclick", (event) => {
  console.log("🔔 Notification cliquée :", event.notification);
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Si une fenêtre du site est déjà ouverte, on la focus
      for (const client of clientList) {
        if (client.url.includes("/") && "focus" in client) {
          client.navigate(event.notification.data.url || "/");
          return client.focus();
        }
      }
      // Sinon, ouvrir une nouvelle fenêtre
      return clients.openWindow(event.notification.data.url || "/");
    })
  );
});
