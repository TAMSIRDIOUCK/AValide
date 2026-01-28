import * as admin from "firebase-admin";
import { createClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// =====================================================
// 🔥 INIT FIREBASE ADMIN (SERVER ONLY)
// =====================================================
if (!admin.apps.length) {
  try {
    console.log("🔹 Initialisation de Firebase Admin...");
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: "avalide-push",
        clientEmail: "firebase-adminsdk-fbsvc@avalide-push.iam.gserviceaccount.com",
        privateKey: `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCLRenchw+TNXhQ
mrGz57qFdL4tPiZv0/fOLTNP/eUKkNVD3LoAB1d0SDpisF/frsMeamHddFizEc/K
aWW+gMPKVazDC6diYST91Y6OrK26HnGYXBNODYTewFiQIyarhH/d+pZxKCkqTvsB
zTy4xUFjaGeq+JjiDxYn5Wzsmp8o0ZrPQnGpo36RfXGG8OucuMTJZVyRgQ4C/HnX
bSOMq1p/0HrtgfDPhmqVqw3eXWWDZGm31DnqOe8qaMY5qsEEJ2OPHs6+P+LDpz4C
0sA69VvuTB7iIb3yxKEgwZBLgLmfVVwCfOe34FrpclthV7kqBpdlJoDF07GqXtcs
WPEEsv55AgMBAAECggEABtpaE0aXCtqM8MRn3Y8Xs7TmnbHK8OI4dY3uUi+PS1mM
kOIFyfYShM+ABfahRQ+jnLXF2oB809TayV4tyjWqTKSyE0fZxOK8T/wn31faVYfl
dYaEUakjIlXLFc6Q+swSgaDwsaE1A1avDavkYsAcA1DyFuzUEv2EjNKCbVL/ZWH2
WszPMxZqJMZtQHaTjWeH51at0Rwr7IYcqOLHLcbuFWgvDI9ic0L2JUFJuWppforV
vbIOTygK43+3RHQN4DYsfWzuNn6QQEGHCtbcy/BXR9P9jvTIxOZsJJcUTl0csnSf
0gbvzDbCDVw3YDHgNMWdx56QiHNE97hMv0awGm82fQKBgQDAvXrLGw92aZmZfLyC
hOMOH/MKRQLeQ5C6b7Z+wO7A1lfM8S9YtFjXaVtJuIbqsk3tVd/lPsZ3da8Z3NW6
5BU2B9pjPlWHl35UyPPWH8ToPP2yCsi5QFaJb2xYb2Ojlwwh+G+a2HNBTXcHWSun
14xHFSzFUl+ininlGRx5WywjzQKBgQC4+/7IwrnNHgVNj0oFqeYAvUlYkTPRqOmA
GFADKV0mTqcGUqkBR/BbFuweWpQ4LQKyPl2s8zAlCsBmY+lhUZWGnId4YtGCOZLj
NAsfJt4wy+YkDGjv7ERzgGnY0cezm7M+obLQbFoLzn1YAh5rz3wx7bU/7Nmo1sxq
rSGQrc7xXQKBgQCdfvgFWfJzr2ztSEl+Wfp0A1WFkcj7OLjeMAUvZJZ0i3IprPgk
gxKJy7Tl89yDkfots1uGp5pj6Y2RE6yu0Ewo35fsOvaHGxsHS0I9Oa6cm6IvR7Kn
9lQAcEVXqoYAGqC2bZ09KhxcQ2G9ZndO6srdFweDooE1kArqA3AKFp9mDQKBgQCa
eNxnO6y6a7JT9S8EEb9eqLKCAib6kooCjMrsCPOfVJjHf+lfh3pgJoEgS9VwH64b
uFazYRS4KgVGu3Ic8Wri0P2Tezmm/Hr7ve73oZZzuyFAwxgyGeODbB13kJ6qDoAc
8hyHTaPYLiOfhY1vzADTFMSBUEDmbBChmFfqICoqhQKBgFZsdrcCFME3P+HnBPOF
I0ZRMYS0XVUBz2jHAphAHY4xfjpjVuumJfj9F/UT4sDMt9tvK8/wR+oBxFRe4v0p
aPyM+0x+DlDYBIdtcJUkLQf/21ljNg6ZgUvp2XAOb34U0wdKRFebNYcepQWSLW2i
gagpuC0D3COjV0yaho1ICMHz
-----END PRIVATE KEY-----`,
      }),
    });
    console.log("✅ Firebase Admin initialisé");
  } catch (err) {
    console.error("🔥 Erreur init Firebase Admin :", err);
  }
}

// =====================================================
// 🔐 INIT SUPABASE ADMIN
// =====================================================
console.log("🔹 Initialisation de Supabase Admin...");
const supabase = createClient(
  "https://netgmadtongdspojqaue.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ldGdtYWR0b25nZHNwb2pxYXVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMTg3NDIsImV4cCI6MjA2MzY5NDc0Mn0.h6lHxp0xUjiB2mE6OT-ePqNanmSFKs7zhvvHRtwKXKI"
);
console.log("✅ Supabase Admin initialisé");

// =====================================================
// 🚀 HANDLER
// =====================================================
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log("📌 Requête reçue :", req.method);

    if (req.method !== "POST") {
      console.warn("⚠️ Méthode non autorisée :", req.method);
      return res.status(405).json({ error: "Méthode non autorisée" });
    }

    const { sellerId, orderId } = req.body || {};
    console.log("📌 Body :", req.body);

    if (!sellerId) {
      console.warn("⚠️ sellerId manquant dans le body !");
      return res.status(400).json({ error: "sellerId manquant" });
    }

    // =====================================================
    // 🔹 Récup tokens FCM depuis Supabase
    // =====================================================
    console.log(`🔹 Récupération des tokens FCM pour sellerId: ${sellerId}...`);
    const { data, error } = await supabase
      .from("user_tokens")
      .select("fcm_token")
      .eq("seller_id", sellerId);

    if (error) {
      console.error("❌ Erreur Supabase :", error);
      return res.status(500).json({ error: "Erreur Supabase", details: error });
    }

    const tokens = (data || []).map((t: any) => t.fcm_token).filter(Boolean);
    console.log("📌 Tokens récupérés :", tokens);

    if (!tokens.length) {
      console.warn("⚠️ Aucun token FCM trouvé pour ce sellerId");
      return res.status(200).json({ message: "Aucun token FCM" });
    }

    // =====================================================
    // 🔔 Préparer message FCM
    // =====================================================
    const message: admin.messaging.MulticastMessage = {
      tokens,
      notification: {
        title: "🛒 Nouvelle commande AValide",
        body: orderId
          ? `Commande #${orderId} reçue`
          : "Un client vient de passer une commande",
      },
      data: {
        orderId: orderId ? String(orderId) : "",
        url: "/orders",
      },
    };
    console.log("📌 Message FCM prêt à être envoyé :", message);

    // =====================================================
    // 🚀 Envoyer notification
    // =====================================================
    let response;
    try {
      console.log("🔹 Envoi du message FCM...");
      response = await admin.messaging().sendMulticast(message);
      console.log("✅ FCM envoyé :", response);
    } catch (err) {
      console.error("🔥 Erreur envoi FCM :", err);
      return res.status(500).json({ error: "Erreur Firebase Admin", details: err });
    }

    // =====================================================
    // ✅ Réponse
    // =====================================================
    console.log(`📌 Résultat : ${response.successCount} réussis, ${response.failureCount} échoués`);
    return res.status(200).json({
      success: true,
      sent: response.successCount,
      failed: response.failureCount,
    });
  } catch (err) {
    console.error("🔥 ERREUR SERVEUR :", err);
    return res.status(500).json({ error: "Erreur serveur", details: err });
  }
}
