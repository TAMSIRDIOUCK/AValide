// send-notification.ts
import * as admin from 'firebase-admin';
import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

//////////////////////////////////////////////////////////////
// 🔐 Init Firebase Admin (uniquement si pas déjà initialisé)
//////////////////////////////////////////////////////////////
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    }),
  });
}

//////////////////////////////////////////////////////////////
// 🔐 Supabase Client avec Service Role Key
//////////////////////////////////////////////////////////////
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

//////////////////////////////////////////////////////////////
// 🔹 Handler API Vercel
//////////////////////////////////////////////////////////////
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Vérification du secret côté API
    if (req.headers.authorization !== `Bearer ${process.env.API_SECRET}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { sellerId, orderId } = req.body;
    if (!sellerId || !orderId) {
      return res.status(400).json({ error: 'sellerId ou orderId manquant' });
    }

    // 🔹 Récupération des tokens FCM du vendeur
    const { data } = await supabase
      .from('user_tokens')
      .select('fcm_token')
      .eq('seller_id', sellerId);

    const tokens = data?.map(t => t.fcm_token).filter(Boolean) as string[];
    if (!tokens?.length) return res.json({ message: 'Aucun token FCM trouvé pour ce vendeur' });

    // 🔹 Envoi notification via Firebase Admin
    const response = await admin.messaging().sendMulticast({
      tokens,
      notification: {
        title: '🛒 Nouvelle commande',
        body: `Vous avez reçu une nouvelle commande #${orderId}`,
      },
      data: {
        orderId: String(orderId),
        url: '/orders',
      },
    });

    // 🔹 Nettoyage des tokens invalides
    const invalidTokens: string[] = [];
    response.responses.forEach((resp: admin.messaging.SendResponse, i: number) => {
      if (!resp.success) invalidTokens.push(tokens[i]);
    });

    if (invalidTokens.length > 0) {
      await supabase.from('user_tokens').delete().in('fcm_token', invalidTokens);
    }

    // 🔹 Réponse API
    return res.json({
      sent: response.successCount,
      failed: response.failureCount,
      cleaned: invalidTokens.length,
    });
  } catch (err) {
    console.error('❌ PUSH ERROR:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
