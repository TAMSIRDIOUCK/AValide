import { initializeApp } from "firebase/app";
import { getMessaging, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBNM88NZV3Rxsj-rp25zB1QWfwTSO0_KnQ",
  authDomain: "avalide-push.firebaseapp.com",
  projectId: "avalide-push",
  messagingSenderId: "1027830005942",
  appId: "1:1027830005942:web:adb58cde5396468f33e617",
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

// Notifications en premier plan
export const listenForegroundNotifications = () => {
  onMessage(messaging, (payload) => {
    console.log("🔔 Notification reçue au premier plan :", payload);

    // Affichage custom
    const title = payload.notification?.title || "Nouvelle notification";
    const options = {
      body: payload.notification?.body || "Vous avez un nouveau message",
      icon: "/icon.png",
      badge: "/badge.png",
    };

    // Notification custom via API du navigateur
    new Notification(title, options);
  });
};
