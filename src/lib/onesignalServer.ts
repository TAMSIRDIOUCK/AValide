// src/lib/onesignalServer.ts
import OneSignal from "onesignal-node";

/**
 * ⚠️ Ces valeurs doivent être dans des variables d'environnement
 * Ne jamais les mettre en dur
 */
const ONE_SIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID!;
const ONE_SIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY!;

if (!ONE_SIGNAL_APP_ID || !ONE_SIGNAL_API_KEY) {
  throw new Error(
    "❌ OneSignal: variables d'environnement ONESIGNAL_APP_ID et ONESIGNAL_API_KEY manquantes"
  );
}

/**
 * Client OneSignal (serveur uniquement)
 */
const client = new OneSignal.Client(ONE_SIGNAL_APP_ID, ONE_SIGNAL_API_KEY);

/**
 * Paramètres pour la notification
 */
interface NotificationParams {
  oneSignalIds: string[];
  title: string;
  message: string;
  url?: string;
}

/**
 * Envoi d'une notification OneSignal
 * ⚠️ NE PAS UTILISER CÔTÉ FRONT
 */
export const sendOneSignalNotification = async ({
  oneSignalIds,
  title,
  message,
  url,
}: NotificationParams): Promise<void> => {
  if (!oneSignalIds || oneSignalIds.length === 0) {
    console.warn("⚠️ Aucun player_id fourni pour OneSignal");
    return;
  }

  const notification = {
    app_id: ONE_SIGNAL_APP_ID,
    include_player_ids: oneSignalIds,
    headings: { en: title },
    contents: { en: message },
    url: url ?? undefined,
  };

  try {
    const response = await client.createNotification(notification);
    console.log("✅ Notification envoyée :", response.body?.id);
  } catch (error: any) {
    if (error instanceof OneSignal.HTTPError) {
      console.error("❌ OneSignal HTTP Error");
      console.error("Status:", error.statusCode);
      console.error("Body:", error.body);
    } else {
      console.error("❌ OneSignal Error:", error);
    }
  }
};
