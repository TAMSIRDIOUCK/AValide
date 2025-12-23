import { messaging } from "./firebase";
import { supabase } from "./supabaseClient";
import { getToken } from "firebase/messaging";

/**
 * Enregistre le service worker
 */
export const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );
      console.log("Service Worker registered:", registration);
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  } else {
    console.warn("Service workers are not supported in this browser.");
  }
};

/**
 * Demande la permission de notifications et enregistre le token
 */
export const requestNotificationPermission = async () => {
  try {
    // Demande permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Permission notifications refusée");
      return;
    }

    // Récupérer l'utilisateur connecté Supabase
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.log("Utilisateur non connecté ou erreur:", userError);
      return;
    }

    // Récupérer le token FCM
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    });

    console.log("TOKEN FCM:", token);

    // Enregistrer le token dans Supabase
    const { error: insertError } = await supabase.from("user_tokens").insert({
      seller_id: user.id, 
      fcm_token: token,
    });

    if (insertError) {
      console.error("Erreur insertion token Supabase:", insertError);
    } else {
      console.log("Token FCM enregistré dans Supabase ✅");
    }
  } catch (err) {
    console.error("Erreur requestNotificationPermission:", err);
  }
};
