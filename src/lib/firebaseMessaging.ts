import { getToken, onMessage, Messaging } from "firebase/messaging";
import type { Messaging as MessagingType } from "firebase/messaging";
import { messaging } from "./firebase"; // ton firebase déjà initialisé
import { supabase } from "./supabaseClient";

const fbMessaging: MessagingType = messaging;

// -------------------------------------------------
// 1️⃣ Enregistrer le service worker
// -------------------------------------------------
export const registerServiceWorker = async (): Promise<void> => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );
      console.log("✅ Service Worker enregistré :", registration);
    } catch (error) {
      console.error("❌ Échec de l'enregistrement du Service Worker :", error);
    }
  } else {
    console.warn("⚠️ Service Workers non supportés dans ce navigateur.");
  }
};

// -------------------------------------------------
// 2️⃣ Demander la permission et enregistrer le token FCM + device
// -------------------------------------------------
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    const permission = await Notification.requestPermission();
    console.log("📌 Permission demandée:", permission);

    if (permission !== "granted") return false;

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return false;

    // Récupérer le token FCM
    const token = await getToken(fbMessaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY as string,
    });

    if (!token) return false;

    // Déterminer le device
    let device = "desktop";
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) device = "ios";
    else if (/Android/i.test(navigator.userAgent)) device = "android";

    console.log("🔹 TOKEN FCM obtenu :", token, "DEVICE :", device);

    // Insérer le token et le device dans Supabase
    const { error } = await supabase
      .from("user_tokens")
      .insert({
        seller_id: user.id,
        fcm_token: token,
        device,
      });

    if (error) console.error("❌ Erreur insert token :", error);
    else console.log("✅ Token FCM inséré avec device :", device);

    return true;
  } catch (err) {
    console.error("❌ requestNotificationPermission error :", err);
    return false;
  }
};

// -------------------------------------------------
// 3️⃣ Récupérer directement le token FCM
// -------------------------------------------------
export const getFcmToken = async (): Promise<string | null> => {
  try {
    const token = await getToken(fbMessaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY as string,
    });
    return token || null;
  } catch (err) {
    console.error("❌ getFcmToken error :", err);
    return null;
  }
};

// -------------------------------------------------
// 4️⃣ Écoute notifications foreground
// -------------------------------------------------
export const listenForegroundNotifications = (): void => {
  onMessage(fbMessaging, (payload) => {
    const title = payload.notification?.title || payload.data?.title || "Nouvelle commande";
    const options: NotificationOptions = {
      body: payload.notification?.body || payload.data?.body || "Vous avez une nouvelle commande",
      icon: "/videos/IMG_1696.jpg",
      badge: "/videos/IMG_1696.jpg",
      data: { url: payload.data?.url || "/orders", orderId: payload.data?.orderId },
    };

    const notification = new Notification(title, options);

    notification.onclick = () => {
      window.focus();
      if (options.data?.url) window.location.href = options.data.url;
    };
  });
};
