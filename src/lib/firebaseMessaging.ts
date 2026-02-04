// src/lib/firebaseMessaging.ts
import { getToken, onMessage, Messaging } from "firebase/messaging";
import { getFirebaseMessaging } from "./firebase"; // ✅ asynchrone
import { supabase } from "./supabaseClient";

// 🔹 Récupère le messaging de manière sûre
const getMessagingInstance = async (): Promise<Messaging | null> => {
  const messaging = await getFirebaseMessaging();
  if (!messaging) {
    console.warn("⚠️ Messaging FCM non supporté sur ce navigateur");
    return null;
  }
  return messaging;
};

// 🔔 Permission et enregistrement token FCM
export const requestNotificationPermission = async (): Promise<void> => {
  try {
    const messaging = await getMessagingInstance();
    if (!messaging) return;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("⚠️ Notification permission refusée");
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("❌ Impossible de récupérer le vendeur", userError);
      return;
    }

    // 🔹 Récupération du token
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY as string,
    });

    if (!token) {
      console.warn("⚠️ Impossible de récupérer le token FCM");
      return;
    }

    console.log("🔹 TOKEN FCM obtenu :", token);

    // 🔄 Upsert token unique par vendeur
    const { error } = await supabase
      .from("user_tokens")
      .upsert(
        { seller_id: user.id, fcm_token: token },
        { onConflict: "fcm_token" }
      );

    if (error) console.error("❌ Erreur upsert token Supabase :", error);
    else console.log("✅ Token FCM enregistré/upserté dans Supabase");
  } catch (err) {
    console.error("❌ requestNotificationPermission exception :", err);
  }
};

// 🔔 Écoute notifications foreground
export const listenForegroundNotifications = async (): Promise<void> => {
  const messaging = await getMessagingInstance();
  if (!messaging) return;

  onMessage(messaging, (payload) => {
    console.log("📩 Push foreground reçu :", payload);

    const title = payload.notification?.title || "Nouvelle commande AValide";
    const options: NotificationOptions = {
      body: payload.notification?.body || "Vous avez une nouvelle commande",
      icon: "/videos/IMG_1696.jpg",
      badge: "/videos/IMG_1696.jpg",
      data: { url: payload.data?.url || "/orders" },
    };

    const notification = new Notification(title, options);
    notification.onclick = () => {
      window.focus();
      window.location.href = options.data?.url || "/";
    };
  });
};
