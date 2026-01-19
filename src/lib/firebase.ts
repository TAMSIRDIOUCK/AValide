import { initializeApp } from "firebase/app";
import { getMessaging, onMessage, getToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBNM88NZV3Rxsj-rp25zB1QWfwTSO0_KnQ",
  authDomain: "avalide-push.firebaseapp.com",
  projectId: "avalide-push",
  messagingSenderId: "1027830005942",
  appId: "1:1027830005942:web:adb58cde5396468f33e617",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Récupérer le token et l’envoyer au serveur
export const getFcmToken = async () => {
  try {
    const token = await getToken(messaging, {
      vapidKey: "BJlVg5_LEHb_7zkGLf2v5tRefZZ_WKzLz_0Az4U6qW_2HUWDqmF4ldpB9-8SvLJpFdLmUzSdk5i4NQmYna9xgNA",
    });
    console.log("🔹 Token FCM :", token);
    return token;
  } catch (err) {
    console.error("❌ Erreur getToken FCM :", err);
    return null;
  }
};

// Notifications en premier plan
export const listenForegroundNotifications = () => {
  // Écoute les notifications FCM quand l'app est au premier plan
  onMessage(messaging, (payload) => {
    console.log("[FCM] foreground payload:", payload);

    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    // iOS PWA → NE PAS afficher ici, handled par SW
    if (isIOS) return;

    // Android / Desktop → affiche la notification frontend
    const title = payload.notification?.title || payload.data?.title || "Nouvelle commande AValide";

    const options: NotificationOptions = {
      body: payload.notification?.body || payload.data?.body || "Vous avez une nouvelle commande",
      icon: "/videos/IMG_1696.jpg",
      badge: "/videos/IMG_1696.jpg",
      data: { url: payload.data?.url || "/orders", orderId: payload.data?.orderId },
    };

    // Affiche la notification
    const notification = new Notification(title, options);

    // Clic sur la notification → redirection
    notification.onclick = () => {
      window.focus();
      if (options.data?.url) {
        window.location.href = options.data.url;
      }
    };
  });
};

// DEMANDE DE PERMISSION (Android / Desktop)
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    console.log("[FCM] Permission notifications:", permission);
    return permission === "granted";
  } catch (err) {
    console.error("[FCM] Permission error:", err);
    return false;
  }
};

export { messaging };