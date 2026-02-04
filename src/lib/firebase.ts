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
  onMessage(messaging, (payload) => {
    const title = payload.notification?.title || "Nouvelle commande AValide";
    const options = {
      body: payload.notification?.body || "Vous avez une nouvelle commande",
      icon: "/videos/IMG_1696.jpg",
      badge: "//videos/IMG_1696.jpg",
      data: { url: "/orders" },
    };

    const notification = new Notification(title, options);
    notification.onclick = () => {
      window.focus();
      window.location.href = options.data.url;
    };
  });
};

export { messaging };