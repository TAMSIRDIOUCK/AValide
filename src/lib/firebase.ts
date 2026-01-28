// lib/fcmClient.ts
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBNM88NZV3Rxsj-rp25zB1QWfwTSO0_KnQ",
  authDomain: "avalide-push.firebaseapp.com",
  projectId: "avalide-push",
  messagingSenderId: "1027830005942",
  appId: "1:1027830005942:web:adb58cde5396468f33e617",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

/**
 * ✅ Enregistre le Service Worker pour FCM
 */
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null;

  try {
    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    console.log("✅ Service Worker enregistré :", registration);
    return registration;
  } catch (err) {
    console.error("❌ SW registration error:", err);
    return null;
  }
};

/**
 * ✅ Demande la permission et récupère le token FCM
 */
export const getFcmToken = async (): Promise<string | null> => {
  if (typeof window === "undefined") return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("⚠️ Permission notifications refusée");
      return null;
    }

    const registration = await registerServiceWorker();
    if (!registration) return null;

    const token = await getToken(messaging, {
      vapidKey: "BJlVg5_LEHb_7zkGLf2v5tRefZZ_WKzLz_0Az4U6qW_2HUWDqmF4ldpB9-8SvLJpFdLmUzSdk5i4NQmYna9xgNA",
      serviceWorkerRegistration: registration,
    });

    console.log("🔹 Token FCM :", token);
    return token ?? null;
  } catch (err) {
    console.error("❌ getFcmToken error:", err);
    return null;
  }
};

/**
 * ✅ Écoute notifications en premier plan
 */
export const listenForegroundNotifications = () => {
  if (typeof window === "undefined") return;

  onMessage(messaging, (payload) => {
    console.log("[FCM] foreground payload:", payload);

    const title = payload.notification?.title || payload.data?.title || "Nouvelle notification";
    const options: NotificationOptions = {
      body: payload.notification?.body || payload.data?.body || "Vous avez une nouvelle notification",
      icon: "/videos/IMG_1696.jpg",
      badge: "/videos/IMG_1696.jpg",
      data: { url: payload.data?.url || "/", orderId: payload.data?.orderId },
    };

    const notification = new Notification(title, options);

    notification.onclick = () => {
      window.focus();
      if (options.data?.url) window.location.href = options.data.url;
    };
  });
};

export { messaging };
