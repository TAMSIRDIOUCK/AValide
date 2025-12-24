import { getToken, Messaging } from "firebase/messaging";
import type { Messaging as MessagingType } from "firebase/messaging";
import { messaging } from "./firebase"; // ✅ Type déjà défini dans firebase.ts
import { supabase } from "./supabaseClient";

const fbMessaging: MessagingType = messaging; // ✅ précise le type ici pour TS

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
    console.warn("⚠️ Les Service Workers ne sont pas supportés dans ce navigateur.");
  }
};

export const requestNotificationPermission = async (): Promise<void> => {
  try {
    const permission = await Notification.requestPermission();
    console.log("📌 Permission demandée:", permission);

    if (permission !== "granted") {
      console.warn("⚠️ Permission notifications refusée");
      return;
    }

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

    let token: string | null = null;
    try {
      token = await getToken(fbMessaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY as string,
      });
    } catch (tokenError) {
      console.error("❌ Erreur lors de la récupération du token FCM :", tokenError);
      return;
    }

    if (!token) {
      console.warn("⚠️ Impossible de récupérer le token FCM");
      return;
    }

    console.log("🔹 TOKEN FCM obtenu :", token);

    try {
      const { error: upsertError } = await supabase
        .from("user_tokens")
        .upsert(
          {
            seller_id: user.id,
            fcm_token: token,
          },
          { onConflict: "fcm_token" }
        );

      if (upsertError) {
        console.error("❌ Erreur upsert token Supabase :", upsertError);
      } else {
        console.log("✅ Token FCM vendeur enregistré/upserté dans Supabase");
      }
    } catch (dbError) {
      console.error("❌ Exception lors de l'enregistrement du token :", dbError);
    }

  } catch (err) {
    console.error("❌ Exception requestNotificationPermission :", err);
  }
};
