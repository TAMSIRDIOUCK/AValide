import axios from "axios";

/**
 * Envoie un SMS de notification de commande via l'API Orange
 * @param phone Numéro du destinataire (ex: +221XXXXXXXX)
 * @param orderId ID de la commande
 */
export async function sendOrderSms(phone: string, orderId: string) {
  if (!process.env.ORANGE_TOKEN) {
    console.warn("ORANGE_TOKEN non défini dans .env");
    return;
  }

  try {
    await axios.post(
      "https://api.orange.com/smsmessaging/v1/outbound/tel:+221704776258/requests",
      {
        outboundSMSMessageRequest: {
          address: `tel:${phone}`,
          senderAddress: "tel:+221704776258",
          outboundSMSTextMessage: {
            message: `AValide 🛒
Nouvelle commande reçue !
Commande #${orderId}
Connectez-vous pour voir les détails.`,
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.ORANGE_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Erreur envoi SMS :", error);
  }
}
