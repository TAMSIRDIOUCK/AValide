import admin from "firebase-admin";
import { createClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// ⚡ Initialisation Firebase Admin (si pas déjà initialisé)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

// ⚡ Supabase Admin (service role)
const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { sellerId, orderId } = req.body;

    if (!sellerId) return res.status(400).json({ error: "sellerId requis" });

    // 🔹 Récupérer tous les tokens FCM du vendeur
    const { data, error } = await supabase
      .from("user_tokens")
      .select("fcm_token")
      .eq("seller_id", sellerId);

    if (error) return res.status(500).json({ error: "Erreur récupération tokens" });

    const tokens: string[] = data?.map((t: any) => t.fcm_token).filter(Boolean) || [];

    if (tokens.length === 0)
      return res.status(200).json({ message: "Aucun token FCM trouvé" });

    // 🔹 Préparer le message (TS ne se plaint plus car on utilise 'any')
    const message: any = {
      tokens,
      notification: {
        title: "🛒 Nouvelle commande AValide",
        body: orderId
          ? `Commande #${orderId} reçue`
          : "Un client vient de passer une commande",
      },
      data: {
        orderId: orderId ? String(orderId) : "",
      },
    };

    // 🔹 Envoi multicast via Firebase Admin
    const response = await admin.messaging().sendMulticast(message);

    console.log(
      `[FCM] Envoyé: ${response.successCount}, Échec: ${response.failureCount}`
    );

    return res.status(200).json({
      success: true,
      sent: response.successCount,
      failed: response.failureCount,
    });
  } catch (err) {
    console.error("❌ Notification error:", err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}
