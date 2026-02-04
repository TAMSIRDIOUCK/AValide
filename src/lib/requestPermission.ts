// src/lib/requestPermission.ts
import { getToken, Messaging } from "firebase/messaging";
import { getFirebaseMessaging } from "./firebase"; // ✅ getter asynchrone
import { supabase } from "./supabaseClient";

/**
 * Sauvegarde le token FCM du vendeur dans Supabase (1 token par vendeur)
 */
export const saveFcmToken = async (token: string, sellerId: string) => {
  try {
    if (!sellerId) {
      console.error("❌ sellerId manquant");
      return;
    }

    const { data, error } = await supabase
      .from("user_tokens")
      .upsert(
        {
          seller_id: sellerId, // ✅ COLONNE CORRECTE
          fcm_token: token,
        },
        { onConflict: "fcm_token" } // 🔄 unique par token
      );

    if (error) {
      console.error("❌ Erreur en enregistrant le token FCM:", error);
    } else {
      console.log("✅ Token FCM enregistré/upserté dans Supabase :", data);
    }
  } catch (err) {
    console.error("❌ Erreur saveFcmToken:", err);
  }
};

/**
 * Demande la permission de notifications et récupère le token FCM
 */
export const requestFirebasePermission = async (
  sellerId: string
): Promise<string | null> => {
  try {
    // 1️⃣ Vérifie le support de messaging
    const messaging: Messaging | null = await getFirebaseMessaging();
    if (!messaging) {
      console.warn("⚠️ Messaging FCM non supporté sur ce navigateur");
      return null;
    }

    // 2️⃣ Demande la permission notifications
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("⚠️ Permission de notification refusée");
      return null;
    }

    // 3️⃣ Récupérer le token FCM
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY as string,
    });

    if (!token) {
      console.error("❌ Token FCM non généré");
      return null;
    }

    console.log("🔥 FCM Token obtenu :", token);
    console.log("👤 Seller ID :", sellerId);

    // 4️⃣ Sauvegarder dans Supabase
    await saveFcmToken(token, sellerId);

    return token;
  } catch (err) {
    console.error("❌ Erreur requestFirebasePermission:", err);
    return null;
  }
};
