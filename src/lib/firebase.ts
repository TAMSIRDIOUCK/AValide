// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getMessaging, onMessage } from "firebase/messaging";

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBNM88NZV3Rxsj-rp25zB1QWfwTSO0_KnQ",
  authDomain: "avalide-push.firebaseapp.com",
  projectId: "avalide-push",
  messagingSenderId: "1027830005942",
  appId: "1:1027830005942:web:adb58cde5396468f33e617",
};

// Initialisation Firebase
const app = initializeApp(firebaseConfig);

// Récupération de Messaging
const messaging = getMessaging(app);

/**
 * Écoute les notifications en premier plan
 * Affiche les notifications jolies avec le logo AValide
 */
export const listenForegroundNotifications = () => {
  onMessage(messaging, (payload) => {
    console.log("🔔 Notification reçue au premier plan :", payload);

    const title = payload.notification?.title || "Nouvelle commande AValide";
    const options = {
      body: payload.notification?.body || "Vous avez une nouvelle commande",
      icon: "/IMG_1696.jpg",   // logo AValide
      badge: "/IMG_1696.jpg",  // badge
      data: {
        url: "/orders",            // redirection vers MyOrdersPage
        ...payload.data,
      },
    };

    // Notification via API du navigateur
    const notification = new Notification(title, options);

    // Redirection si clic sur la notification
    notification.onclick = () => {
      window.focus();
      window.location.href = options.data.url;
    };
  });
};

export { messaging };
