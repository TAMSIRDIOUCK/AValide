import { VercelRequest, VercelResponse } from "@vercel/node";
import { supabase } from "../src/lib/supabaseClient";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { userId, oneSignalId } = req.body;

    if (!userId || !oneSignalId) {
      return res.status(400).json({ error: "userId et oneSignalId requis" });
    }

    const { error } = await supabase
      .from("user_tokens")
      .upsert(
        {
          seller_id: userId, // ou user_id selon ta table
          onesignal_id: oneSignalId,
        },
        { onConflict: "seller_id" } // ou user_id
      );

    if (error) {
      console.error("❌ Supabase error:", error);
      return res.status(500).json({ error: "Impossible d'enregistrer le OneSignal ID" });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ API error:", err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}
