import { getToken } from "firebase/messaging";
import { messaging } from "./firebase"; // ton firebase.ts
import { supabase } from "./supabaseClient";

// Fonction pour sauvegarder le token FCM dans Supabase
export const saveFcmToken = async (token: string, userId?: string) => {
  try {
    const { data, error } = await supabase
      .from("user_tokens")
      .insert({
        user_id: userId ?? null,
        fcm_token: token,
      });

    if (error) console.error("Erreur en enregistrant le token FCM:", error);
    else console.log("Token FCM enregistré :", data);
  } catch (err) {
    console.error("Erreur saveFcmToken:", err);
  }
};

// Fonction pour demander la permission de notifications et récupérer le token FCM
export const requestFirebasePermission = async (userId?: string): Promise<string | null> => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Permission de notification non accordée");
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: "BJlVg5_LEHb_7zkGLf2v5tRefZZ_WKzLz_0Az4U6qW_2HUWDqmF4ldpB9-8SvLJpFdLmUzSdk5i4NQmYna9xgNA",
    });

    if (token) {
      console.log("FCM Token obtenu :", token);
      await saveFcmToken(token, userId);
    }

    return token;
  } catch (err) {
    console.error("Erreur requestFirebasePermission:", err);
    return null;
  }
};
