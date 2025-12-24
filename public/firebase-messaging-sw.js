// Importer les scripts Firebase nécessaires
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

  // Récupération de Messaging
  try {
    messaging = firebase.messaging();
    console.log("✅ Messaging Firebase prêt");
  } catch (messagingError) {
    console.error("❌ Erreur lors de l'initialisation du messaging :", messagingError);
  }

} catch (initError) {
  console.error("❌ Erreur lors de l'initialisation Firebase :", initError);
}

// 🔔 RÉCEPTION DES NOTIFICATIONS EN ARRIÈRE-PLAN (SITE FERMÉ)
try {
  if (messaging) {
    messaging.onBackgroundMessage(function (payload) {
      try {
        console.log("📩 Notification reçue en arrière-plan :", payload);

        const title = payload.notification?.title || "Nouvelle notification";
        const options = {
          body: payload.notification?.body || "Vous avez un nouveau message",
          icon: "/icon.png", // optionnel
          badge: "/badge.png", // optionnel
        };

        self.registration.showNotification(title, options);
        console.log("✅ Notification affichée en arrière-plan");

      } catch (notifError) {
        console.error("❌ Erreur lors de l'affichage de la notification :", notifError);
      }
    });
    console.log("✅ Écoute des notifications en arrière-plan activée");
  } else {
    console.error("❌ Messaging n'est pas défini, impossible d'écouter les messages");
  }
} catch (bgError) {
  console.error("❌ Erreur générale lors de l'écoute des notifications en arrière-plan :", bgError);
}
