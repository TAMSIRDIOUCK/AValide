import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Méthode non autorisée (POST requis)",
    });
  }

  const { to, subject, html } = req.body;

  if (!to || !subject || !html) {
    return res.status(400).json({
      success: false,
      error: "Champs email manquants",
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "sirdiouck101@gmail.com", // à remplacer par ton mail de notif
        pass: "nabr nibu nngt lbjn",
      },
    });

    await transporter.sendMail({
      from: `"AValide" <sirdiouck101@gmail.com>`,
      to,
      subject,
      html,
    });

    return res.status(200).json({
      success: true,
      message: "Email envoyé",
    });

  } catch (err: any) {
    console.error("❌ Erreur email :", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Erreur serveur email",
    });
  }
}
