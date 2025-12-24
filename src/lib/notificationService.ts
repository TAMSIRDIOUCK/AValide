import { supabase } from "./supabaseClient";

/**
 * Récupère tous les tokens FCM d'un vendeur
 */
export const getSellerFcmTokens = async (sellerId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from("user_tokens")
      .select("fcm_token")
      .eq("seller_id", sellerId);

    if (error) {
      console.error("❌ Erreur lors de la récupération des tokens FCM :", error);
      return [];
    }

    if (!data || !data.length) {
      console.warn(`⚠️ Aucun token FCM trouvé pour le vendeur ${sellerId}`);
      return [];
    }

    const tokens = data.map((item) => item.fcm_token);
    console.log(`✅ ${tokens.length} token(s) FCM récupéré(s) pour le vendeur ${sellerId}`);
    return tokens;

  } catch (err) {
    console.error("❌ Exception lors de la récupération des tokens FCM :", err);
    return [];
  }
};

/**
 * Envoie une notification à tous les tokens d'un vendeur
 */
export const sendNotificationToSeller = async (
  sellerId: string,
  title: string,
  body: string
) => {
  try {
    console.log(`📌 Début envoi notification au vendeur ${sellerId}`);

    // 1️⃣ Récupérer les tokens
    const tokens = await getSellerFcmTokens(sellerId);
    if (!tokens.length) {
      console.warn("⚠️ Aucun token FCM trouvé, notification non envoyée");
      return;
    }

    console.log(`🔹 Tokens prêts pour envoi:`, tokens);

    // 2️⃣ Préparer le message
    const message = {
      registration_ids: tokens,
      notification: { title, body },
    };

    // 3️⃣ Envoyer la requête FCM
    try {
      const response = await fetch("https://fcm.googleapis.com/fcm/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization":"BJlVg5_LEHb_7zkGLf2v5tRefZZ_WKzLz_0Az4U6qW_2HUWDqmF4ldpB9-8SvLJpFdLmUzSdk5i4NQmYna9xgNA"
        },
        body: JSON.stringify(message),
      });

      // 4️⃣ Vérifier la réponse
      const data = await response.json();
      if (!response.ok) {
        console.error("❌ Erreur HTTP FCM :", response.status, data);
      } else {
        console.log("✅ Notification envoyée avec succès :", data);
      }

    } catch (fetchError) {
      console.error("❌ Erreur lors de l'envoi de la notification FCM :", fetchError);
    }

  } catch (err) {
    console.error("❌ Exception globale sendNotificationToSeller :", err);
  }
};
