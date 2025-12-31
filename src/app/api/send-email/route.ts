// src/app/api/send-email/route.ts
import { NextResponse } from "next/server";

// Ici tu mets ta logique réelle d'envoi d'email (SMTP, Nodemailer, etc.)
async function sendEmail(toEmail: string, orderId: string) {
  try {
    // Exemple : console.log pour tester
    console.log(`Email envoyé à ${toEmail} pour la commande #${orderId}`);
    // Remplace par ton code SMTP ou API Email
  } catch (err) {
    console.error("Erreur envoi email :", err);
    throw err;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { toEmail, orderId } = body;

    if (!toEmail || !orderId) {
      return NextResponse.json(
        { success: false, message: "toEmail et orderId sont requis" },
        { status: 400 }
      );
    }

    await sendEmail(toEmail, orderId);

    return NextResponse.json({ success: true, message: "Email envoyé !" });
  } catch (error) {
    console.error("Erreur API send-email:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 }
    );
  }
}
