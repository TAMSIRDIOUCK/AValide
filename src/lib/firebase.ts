import { initializeApp } from "firebase/app";
import { getMessaging, Messaging } from "firebase/messaging";

let app;
let messaging: Messaging; // ✅ Typé explicitement

try {
  app = initializeApp({
    apiKey: "AIzaSyBNM88NZV3Rxsj-rp25zB1QWfwTSO0_KnQ",
    authDomain: "avalide-push.firebaseapp.com",
    projectId: "avalide-push",
    messagingSenderId: "1027830005942",
    appId: "1:1027830005942:web:adb58cde5396468f33e617",
  });
  console.log("✅ Firebase initialisé avec succès");
} catch (err) {
  console.error("❌ Erreur d'initialisation Firebase :", err);
}

try {
  messaging = getMessaging(app);
  console.log("✅ Messaging prêt");
} catch (err) {
  console.error("❌ Erreur d'initialisation du messaging :", err);
}

export { messaging };
