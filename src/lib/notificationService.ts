import { supabase } from "./supabaseClient";

// 🔹 Récupère tous les tokens FCM associés à un vendeur
export const getSellerFcmTokens = async (sellerId: string) => {
  const { data, error } = await supabase
    .from("user_tokens")
    .select("fcm_token")
    .eq("user_id", sellerId);

  if (error) {
    console.error("Erreur en récupérant les tokens FCM du vendeur :", error);
    return [];
  }

  return data?.map(item => item.fcm_token) || [];
};

// 🔹 Envoie une notification à plusieurs tokens FCM
export const sendNotification = async (
  tokens: string[],
  title: string,
  body: string
) => {
  if (!tokens.length) return;

  const message = {
    notification: { title, body },
    registration_ids: tokens,
  };

  try {
    const response = await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "BJlVg5_LEHb_7zkGLf2v5tRefZZ_WKzLz_0Az4U6qW_2HUWDqmF4ldpB9-8SvLJpFdLmUzSdk5i4NQmYna9xgNA", // <-- Remplace par ta clé serveur FCM
      },
      body: JSON.stringify(message),
    });

    const data = await response.json();
    console.log("Notification envoyée :", data);
  } catch (error) {
    console.error("Erreur en envoyant la notification :", error);
  }
};
