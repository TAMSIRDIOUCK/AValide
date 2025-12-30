// src/pages/api/send-email.ts
import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "sirdiouck101@gmail.com", // à remplacer par ton mail de notif
    pass: "nabr nibu nngt lbjn", // mot de passe d'application Gmail
  },
});

type EmailRequestBody = {
  toEmail: string;
  orderId: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { toEmail, orderId } = req.body as EmailRequestBody;

  if (!toEmail || !orderId) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  try {
    await transporter.sendMail({
      from: '"AValide" <avalide.notify@gmail.com>',
      to: toEmail,
      subject: "🛒 Nouvelle commande reçue",
      html: `
        <div style="font-family:Arial">
          <img src="https://a-valide.com/videos/IMG_1696.jpg" width="120" />
          <h2>Nouvelle commande 🎉</h2>
          <p>Commande <strong>#${orderId}</strong> reçue.</p>
          <a href="https://a-valide.com/orders"
             style="background:#ff6600;color:#fff;padding:10px 15px;
                    text-decoration:none;border-radius:5px;">
            Voir la commande
          </a>
        </div>
      `,
    });

    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("Erreur envoi email :", error);
    res.status(500).json({ error: "Impossible d'envoyer l'email" });
  }
}
