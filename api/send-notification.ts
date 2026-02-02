export const config = {
  runtime: "nodejs",
};

import type { VercelRequest, VercelResponse } from "@vercel/node";
import * as admin from "firebase-admin";
import { createClient } from "@supabase/supabase-js";

/* =====================================================
   🔥 INIT FIREBASE ADMIN (SAFE POUR VERCEL)
===================================================== */
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: "avalide-push",
      clientEmail: "firebase-adminsdk-fbsvc@avalide-push.iam.gserviceaccount.com",
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    }),
  });
}

/* =====================================================
   🔐 SUPABASE (SERVICE ROLE)
===================================================== */
const supabase = createClient(
  "https://netgmadtongdspojqaue.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/* =====================================================
   🚀 HANDLER
===================================================== */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Méthode non autorisée" });
    }

    const { sellerId, title, body } = req.body;

    if (!sellerId) {
      return res.status(400).json({ error: "sellerId manquant" });
    }

    /* 🔹 RÉCUPÉRATION DES TOKENS */
    const { data, error } = await supabase
      .from("user_tokens")
      .select("fcm_token")
      .eq("seller_id", sellerId);

    if (error) {
      console.error("❌ Supabase error:", error);
      return res.status(500).json({ error: "Erreur Supabase" });
    }

    const tokens = data?.map(t => t.fcm_token).filter(Boolean);

    if (!tokens || tokens.length === 0) {
      return res.status(200).json({ message: "Aucun token FCM" });
    }

    /* 🔔 ENVOI NOTIFICATION */
    const response = await admin.messaging().sendMulticast({
      tokens,
      notification: {
        title: title || "Nouvelle commande",
        body: body || "Vous avez une nouvelle commande",
      },
      webpush: {
        notification: {
          icon: "/videos/IMG_1696.jpg",
        },
      },
    });

    return res.status(200).json({
      success: true,
      sent: response.successCount,
      failed: response.failureCount,
    });

  } catch (err: any) {
    console.error("🔥 API ERROR:", err);
    return res.status(500).json({
      error: "API crashed",
      message: err.message,
    });
  }
}
