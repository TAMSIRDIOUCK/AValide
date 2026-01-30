export const config = {
  runtime: "nodejs",
};

import type { VercelRequest, VercelResponse } from "@vercel/node";
import * as admin from "firebase-admin";
import { createClient } from "@supabase/supabase-js";

/* =====================================================
   🔥 INIT FIREBASE ADMIN (ANTI-CRASH VERCEL)
===================================================== */
let firebaseReady = false;

try {
  console.log("ENV CHECK", {
    projectId: !!process.env.FIREBASE_PROJECT_ID,
    clientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: !!process.env.FIREBASE_PRIVATE_KEY,
  });

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
      }),
    });
  }

  firebaseReady = true;
  console.log("✅ Firebase Admin initialisé");
} catch (e) {
  console.error("🔥 Firebase Admin FAILED", e);
}

/* =====================================================
   🔐 SUPABASE
===================================================== */
const supabase = createClient(
 "https://netgmadtongdspojqaue.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ldGdtYWR0b25nZHNwb2pxYXVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMTg3NDIsImV4cCI6MjA2MzY5NDc0Mn0.h6lHxp0xUjiB2mE6OT-ePqNanmSFKs7zhvvHRtwKXKI"
);


/* =====================================================
   🚀 HANDLER
===================================================== */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log("🚀 API /send-notification appelée");

  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Méthode non autorisée" });
    }

    if (!firebaseReady) {
      return res.status(500).json({
        error: "Firebase Admin non initialisé",
      });
    }

    const { sellerId, title, body } = req.body || {};

    if (!sellerId) {
      return res.status(400).json({ error: "sellerId manquant" });
    }

    /* 🔹 TOKENS */
    const { data, error } = await supabase
      .from("user_tokens")
      .select("fcm_token")
      .eq("seller_id", sellerId);

    if (error) {
      console.error("❌ Supabase error", error);
      return res.status(500).json({ error: "Supabase error" });
    }

    const tokens = data?.map(t => t.fcm_token).filter(Boolean) || [];

    if (!tokens.length) {
      return res.status(200).json({ message: "Aucun token FCM" });
    }

    /* 🔔 MESSAGE */
    const message: admin.messaging.MulticastMessage = {
      tokens,
      notification: {
        title: title || "Nouvelle commande",
        body: body || "Vous avez une commande",
      },
    };

    const response = await admin.messaging().sendMulticast(message);

    return res.status(200).json({
      success: true,
      sent: response.successCount,
      failed: response.failureCount,
    });

  } catch (err: any) {
    console.error("🔥 CRASH API", err);
    return res.status(500).json({
      error: "API crashed",
      message: err?.message || "unknown",
    });
  }
}
