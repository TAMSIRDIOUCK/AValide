import { supabase } from "./supabaseClient";

/**
 * Récupère tous les tokens FCM d'un vendeur
 */
export const getSellerFcmTokens = async (sellerId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from("user_tokens")
    .select("fcm_token")
    .eq("seller_id", sellerId);

  if (error) {
    console.error("Erreur en récupérant les tokens FCM du vendeur :", error);
    return [];
  }

  return data?.map((item) => item.fcm_token) || [];
};

/**
 * Envoie une notification à tous les tokens d'un vendeur
 */
export const sendNotificationToSeller = async (
  sellerId: string,
  title: string,
  body: string
) => {
  const tokens = await getSellerFcmTokens(sellerId);

  if (!tokens.length) {
    console.log("⚠️ Aucun token FCM trouvé pour ce vendeur");
    return;
  }

  const message = {
    registration_ids: tokens,
    notification: { title, body },
  };

  try {
    const response = await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "BJlVg5_LEHb_7zkGLf2v5tRefZZ_WKzLz_0Az4U6qW_2HUWDqmF4ldpB9-8SvLJpFdLmUzSdk5i4NQmYna9xgNA",
      },
      body: JSON.stringify(message),
    });

    const data = await response.json();
    console.log("Notification envoyée :", data);
  } catch (error) {
    console.error("Erreur en envoyant la notification :", error);
  }
};
