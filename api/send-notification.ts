// api/send-notification.ts
import admin from 'firebase-admin';
import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    }),
  });
}

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.headers.authorization !== `Bearer ${process.env.API_SECRET}`)
      return res.status(401).json({ error: 'Unauthorized' });

    const { sellerId, orderId } = req.body;
    if (!sellerId) return res.status(400).json({ error: 'sellerId manquant' });

    const { data } = await supabase
      .from('user_tokens')
      .select('fcm_token')
      .eq('seller_id', sellerId);

    const tokens = data?.map(t => t.fcm_token).filter(Boolean);
    if (!tokens?.length) return res.json({ message: 'Aucun token' });

    const response = await admin.messaging().sendEachForMulticast({
      tokens,
      notification: { title: '🛒 Nouvelle commande', body: 'Vous avez reçu une commande' },
      data: { url: '/orders', orderId: String(orderId || '') },
    });

    // Nettoyage tokens invalides
    const invalidTokens: string[] = [];
    response.responses.forEach((r, i) => {
      if (!r.success) invalidTokens.push(tokens[i]);
    });

    if (invalidTokens.length)
      await supabase.from('user_tokens').delete().in('fcm_token', invalidTokens);

    return res.json({
      sent: response.successCount,
      failed: response.failureCount,
      cleaned: invalidTokens.length,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
 