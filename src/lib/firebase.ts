// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported,
  Messaging,
} from "firebase/messaging";
import { supabase } from "./supabaseClient";

// 🔹 Config Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBNM88NZV3Rxsj-rp25zB1QWfwTSO0_KnQ",
  authDomain: "avalide-push.firebaseapp.com",
  projectId: "avalide-push",
  messagingSenderId: "1027830005942",
  appId: "1:1027830005942:web:adb58cde5396468f33e617",
};

// ✅ Initialisation Firebase
export const firebaseApp = initializeApp(firebaseConfig);

// ✅ Messaging sécurisé pour Safari / iOS
export const getFirebaseMessaging = async (): Promise<Messaging | null> => {
  const supported = await isSupported();
  if (!supported) return null;
  return getMessaging(firebaseApp);
};

// 🔔 Service Worker
export const registerServiceWorker = async (): Promise<void> => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );
      console.log("✅ Service Worker enregistré :", registration);
    } catch (err) {
      console.error("❌ Erreur enregistrement Service Worker :", err);
    }
  } else {
    console.warn("⚠️ Service Workers non supportés");
  }
};

// 🔹 Récupérer le token FCM et sauvegarder dans Supabase (1 token par vendeur)
export const requestFirebasePermission = async (
  sellerId: string
): Promise<string | null> => {
  try {
    const messaging = await getFirebaseMessaging();
    if (!messaging) return null;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("⚠️ Permission notifications refusée");
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY as string,
    });

    if (!token) return null;

    console.log("🔹 FCM Token obtenu :", token);

    // 🔄 Sauvegarde dans Supabase avec filtre 1 token par vendeur
    const { error } = await supabase
      .from("user_tokens")
      .upsert(
        {
          seller_id: sellerId,
          fcm_token: token,
        },
        { onConflict: "fcm_token" } // empêche doublons
      );

    if (error) console.error("❌ Erreur upsert token Supabase :", error);
    else console.log("✅ Token FCM enregistré dans Supabase");

    return token;
  } catch (err) {
    console.error("❌ Erreur requestFirebasePermission :", err);
    return null;
  }
};

// 🔹 Récupérer token FCM sans Supabase (juste pour l’App)
export const getFcmToken = async (): Promise<string | null> => {
  try {
    const messaging = await getFirebaseMessaging();
    if (!messaging) return null;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY as string,
    });

    console.log("🔹 FCM Token obtenu (getFcmToken) :", token);
    return token;
  } catch (err) {
    console.error("❌ Erreur getFcmToken :", err);
    return null;
  }
};

// 🔔 Notifications foreground
export const listenForegroundNotifications = async (): Promise<void> => {
  const messaging = await getFirebaseMessaging();
  if (!messaging) return;

  onMessage(messaging, (payload) => {
    console.log("📩 Push foreground reçu :", payload);

    const title = payload.notification?.title || "Nouvelle commande AValide";
    const options: NotificationOptions = {
      body: payload.notification?.body || "Vous avez une nouvelle commande",
      icon: "/videos/IMG_1696.jpg",
      badge: "/videos/IMG_1696.jpg",
      data: { url: "/orders" },
    };

    const notification = new Notification(title, options);
    notification.onclick = () => {
      window.focus();
      window.location.href = options.data?.url || "/";
    };
  });
};
