import { getToken } from "firebase/messaging";
import { messaging } from "./firebase";
import { supabase } from "./supabaseClient";

/**
 * Enregistre le service worker pour les notifications
 */
export const registerServiceWorker = async () => {
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
    console.warn("⚠️ Les Service Workers ne sont pas supportés dans ce navigateur.");
  }
};

/**
 * Demande la permission de notifications et enregistre le token FCM du vendeur
 */
export const requestNotificationPermission = async () => {
  try {
    // 1️⃣ Demande de permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("⚠️ Permission notifications refusée");
      return;
    }

    // 2️⃣ Récupérer le vendeur connecté
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("❌ Erreur lors de la récupération du vendeur :", userError);
      return;
    }

    if (!user) {
      console.warn("⚠️ Aucun vendeur connecté");
      return;
    }

    console.log("✅ Vendeur connecté :", user.email, user.id);

    // 3️⃣ Récupérer le token FCM
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    });

    if (!token) {
      console.warn("⚠️ Impossible de récupérer le token FCM");
      return;
    }

    console.log("🔹 TOKEN FCM obtenu :", token);

    // 4️⃣ Enregistrer le token dans Supabase
    const { error: insertError } = await supabase.from("user_tokens").upsert(
      {
        seller_id: user.id,
        fcm_token: token,
      },
      {
        onConflict: "fcm_token", // évite doublons
      }
    );

    if (insertError) {
      console.error("❌ Erreur insertion token Supabase :", insertError);
    } else {
      console.log("✅ Token FCM vendeur enregistré dans Supabase");
    }

  } catch (err) {
    console.error("❌ Exception requestNotificationPermission :", err);
  }
};
