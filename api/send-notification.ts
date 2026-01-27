import admin from "firebase-admin";
import { createClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from "@vercel/node";

/// 🔹 Initialisation Firebase Admin (clé privée depuis les variables d'environnement)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      "projectId": "avalide-push",
      "privateKey": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCLRenchw+TNXhQ\nmrGz57qFdL4tPiZv0/fOLTNP/eUKkNVD3LoAB1d0SDpisF/frsMeamHddFizEc/K\naWW+gMPKVazDC6diYST91Y6OrK26HnGYXBNODYTewFiQIyarhH/d+pZxKCkqTvsB\nzTy4xUFjaGeq+JjiDxYn5Wzsmp8o0ZrPQnGpo36RfXGG8OucuMTJZVyRgQ4C/HnX\nbSOMq1p/0HrtgfDPhmqVqw3eXWWDZGm31DnqOe8qaMY5qsEEJ2OPHs6+P+LDpz4C\n0sA69VvuTB7iIb3yxKEgwZBLgLmfVVwCfOe34FrpclthV7kqBpdlJoDF07GqXtcs\nWPEEsv55AgMBAAECggEABtpaE0aXCtqM8MRn3Y8Xs7TmnbHK8OI4dY3uUi+PS1mM\nkOIFyfYShM+ABfahRQ+jnLXF2oB809TayV4tyjWqTKSyE0fZxOK8T/wn31faVYfl\ndYaEUakjIlXLFc6Q+swSgaDwsaE1A1avDavkYsAcA1DyFuzUEv2EjNKCbVL/ZWH2\nWszPMxZqJMZtQHaTjWeH51at0Rwr7IYcqOLHLcbuFWgvDI9ic0L2JUFJuWppforV\nvbIOTygK43+3RHQN4DYsfWzuNn6QQEGHCtbcy/BXR9P9jvTIxOZsJJcUTl0csnSf\n0gbvzDbCDVw3YDHgNMWdx56QiHNE97hMv0awGm82fQKBgQDAvXrLGw92aZmZfLyC\nhOMOH/MKRQLeQ5C6b7Z+wO7A1lfM8S9YtFjXaVtJuIbqsk3tVd/lPsZ3da8Z3NW6\n5BU2B9pjPlWHl35UyPPWH8ToPP2yCsi5QFaJb2xYb2Ojlwwh+G+a2HNBTXcHWSun\n14xHFSzFUl+ininlGRx5WywjzQKBgQC4+/7IwrnNHgVNj0oFqeYAvUlYkTPRqOmA\nGFADKV0mTqcGUqkBR/BbFuweWpQ4LQKyPl2s8zAlCsBmY+lhUZWGnId4YtGCOZLj\nNAsfJt4wy+YkDGjv7ERzgGnY0cezm7M+obLQbFoLzn1YAh5rz3wx7bU/7Nmo1sxq\nrSGQrc7xXQKBgQCdfvgFWfJzr2ztSEl+Wfp0A1WFkcj7OLjeMAUvZJZ0i3IprPgk\ngxKJy7Tl89yDkfots1uGp5pj6Y2RE6yu0Ewo35fsOvaHGxsHS0I9Oa6cm6IvR7Kn\n9lQAcEVXqoYAGqC2bZ09KhxcQ2G9ZndO6srdFweDooE1kArqA3AKFp9mDQKBgQCa\neNxnO6y6a7JT9S8EEb9eqLKCAib6kooCjMrsCPOfVJjHf+lfh3pgJoEgS9VwH64b\nuFazYRS4KgVGu3Ic8Wri0P2Tezmm/Hr7ve73oZZzuyFAwxgyGeODbB13kJ6qDoAc\n8hyHTaPYLiOfhY1vzADTFMSBUEDmbBChmFfqICoqhQKBgFZsdrcCFME3P+HnBPOF\nI0ZRMYS0XVUBz2jHAphAHY4xfjpjVuumJfj9F/UT4sDMt9tvK8/wR+oBxFRe4v0p\naPyM+0x+DlDYBIdtcJUkLQf/21ljNg6ZgUvp2XAOb34U0wdKRFebNYcepQWSLW2i\ngagpuC0D3COjV0yaho1ICMHz\n-----END PRIVATE KEY-----\n",
      "clientEmail": "firebase-adminsdk-fbsvc@avalide-push.iam.gserviceaccount.com",
    }
    ),
  });
}

// 🔐 Supabase admin
const supabase = createClient( 
  "https://netgmadtongdspojqaue.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ldGdtYWR0b25nZHNwb2pxYXVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMTg3NDIsImV4cCI6MjA2MzY5NDc0Mn0.h6lHxp0xUjiB2mE6OT-ePqNanmSFKs7zhvvHRtwKXKI"
);

// 🔹 API Handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // 🔹 Récupérer sellerId et orderId depuis le body
    const { sellerId, orderId } = req.body;

    // 🔹 Récupérer tous les tokens FCM du vendeur
    let query = supabase.from('user_tokens').select('fcm_token');
    if (sellerId) {
      query = query.eq('seller_id', sellerId);
    }
    const { data, error } = await query;
    if (error) {
      console.error('❌ Supabase error:', error);
      return res.status(500).json({ error: 'Erreur récupération tokens' });
    }

    // 🔹 Extraire uniquement les tokens valides
    const tokens = data?.map(t => t.fcm_token).filter(Boolean);
    if (!tokens || tokens.length === 0) {
      return res.status(200).json({ message: 'Aucun token FCM' });
    }

    // 🔹 Envoi des notifications via Firebase Admin
    const response = await admin.messaging().sendEachForMulticast({
      tokens,
      // ✅ Notification visible pour Android / Desktop
      notification: {
        title: '🛒 Nouvelle commande AValide',
        body: orderId ? `Commande #${orderId} reçue` : 'Un client vient de passer une commande',
      },
      // ✅ Data pour iOS PWA + service worker
      data: {
        title: '🛒 Nouvelle commande AValide',
        body: orderId ? `Commande #${orderId} reçue` : 'Un client vient de passer une commande',
        orderId: orderId ? String(orderId) : '',
      },
    });

    console.log(`[FCM] Envoyé: ${response.successCount}, Échec: ${response.failureCount}`);

    return res.status(200).json({
      success: true,
      sent: response.successCount,
      failed: response.failureCount,
    });

  } catch (err) {
    console.error('❌ Notification error:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}