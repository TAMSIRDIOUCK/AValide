import { getToken, onMessage, Messaging } from "firebase/messaging";
import type { Messaging as MessagingType } from "firebase/messaging";
import { messaging } from "./firebase"; // ton firebase déjà initialisé
import { supabase } from "./supabaseClient";

const fbMessaging: MessagingType = messaging; // type TS précis

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
// 2️⃣ Demander la permission et enregistrer le token FCM
// -------------------------------------------------
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    const permission = await Notification.requestPermission();
    console.log("📌 Permission demandée:", permission);

    if (permission !== "granted") {
      console.warn("⚠️ Permission notifications refusée");
      return false;
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("❌ Erreur récupération utilisateur :", userError);
      return false;
    }

    console.log("✅ Vendeur connecté :", user.email, user.id);

    // Récupérer le token FCM
    let token: string | null = null;
    try {
      token = await getToken(fbMessaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY as string,
      });
    } catch (tokenError) {
      console.error("❌ Erreur récupération token FCM :", tokenError);
      return false;
    }

    if (!token) {
      console.warn("⚠️ Impossible de récupérer le token FCM");
      return false;
    }

    console.log("🔹 TOKEN FCM obtenu :", token);

    // Enregistrer le token dans Supabase
    try {
      const { error: upsertError } = await supabase
        .from("user_tokens")
        .upsert(
          { seller_id: user.id, fcm_token: token },
          { onConflict: "fcm_token" }
        );

      if (upsertError) console.error("❌ Erreur upsert token Supabase :", upsertError);
      else console.log("✅ Token FCM enregistré/upserté dans Supabase");
    } catch (dbError) {
      console.error("❌ Exception enregistrement token :", dbError);
    }

    return true;
  } catch (err) {
    console.error("❌ Exception requestNotificationPermission :", err);
    return false;
  }
};

// -------------------------------------------------
// 3️⃣ Fonction pour récupérer directement le token FCM
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
// 4️⃣ Écoute notifications en foreground (Android / Desktop)
// -------------------------------------------------
export const listenForegroundNotifications = (): void => {
  onMessage(fbMessaging, (payload) => {
    console.log("[FCM] foreground payload :", payload);

    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    // iOS PWA → handled uniquement par service worker
    if (isIOS) return;

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
