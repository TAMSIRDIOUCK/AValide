import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Méthode non autorisée. Utilise POST.",
    });
  }

  const { phone, message } = req.body;

  if (!phone || !message) {
    return res.status(400).json({
      success: false,
      error: "phone et message sont obligatoires",
    });
  }

  try {
    // ⚠️ SIMULATION (le vrai SMS viendra après)
    console.log("📩 SMS à envoyer :", phone, message);

    return res.status(200).json({
      success: true,
      message: "SMS envoyé (simulation)",
    });
  } catch (err: any) {
    console.error("❌ Erreur SMS :", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Erreur serveur SMS",
    });
  }
}
