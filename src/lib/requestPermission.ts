import { getToken } from "firebase/messaging";
import { messaging } from "./firebase";
import { supabase } from "./supabaseClient";

/**
 * Sauvegarde le token FCM du vendeur dans Supabase
 */
export const saveFcmToken = async (
  token: string,
  sellerId: string
) => {
  try {
    if (!sellerId) {
      console.error("❌ sellerId manquant");
      return;
    }

    const { data, error } = await supabase
      .from("user_tokens")
      .insert({
        seller_id: sellerId, // ✅ COLONNE CORRECTE
        fcm_token: token,
      });

    if (error) {
      console.error("❌ Erreur en enregistrant le token FCM:", error);
    } else {
      console.log("✅ Token FCM enregistré dans Supabase :", data);
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
    // 1️⃣ Demande la permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("⚠️ Permission de notification refusée");
      return null;
    }

    // 2️⃣ Récupérer le token FCM
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    });

    if (!token) {
      console.error("❌ Token FCM non généré");
      return null;
    }

    console.log("🔥 FCM Token obtenu :", token);
    console.log("👤 Seller ID :", sellerId);

    // 3️⃣ Sauvegarder dans Supabase
    await saveFcmToken(token, sellerId);

    return token;
  } catch (err) {
    console.error("❌ Erreur requestFirebasePermission:", err);
    return null;
  }
};