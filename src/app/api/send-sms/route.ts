// src/app/api/send-sms/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    console.log("📨 Requête POST reçue sur /api/send-sms");

    // Lire le corps de la requête
    const body = await req.json();
    console.log("📩 Corps reçu :", body);

    const { phone, message } = body;

    if (!phone || !message) {
      console.warn("⚠️ Missing phone or message");
      return NextResponse.json(
        { error: "Missing phone or message" },
        { status: 400 }
      );
    }

    // 🔹 Ici tu appelles ton service SMS (Wave, Twilio...)
    // Exemple minimal pour test :
    console.log("✅ Envoi SMS simulé :", phone, message);

    // Si tu as Wave API, ici tu mettrais l'appel réel
    // Ex:
    // try {
    //   const response = await sendWaveSMS(phone, message);
    //   console.log("📤 SMS envoyé avec succès :", response);
    // } catch (smsErr) {
    //   console.error("❌ Erreur lors de l'envoi SMS :", smsErr);
    //   return NextResponse.json({ error: "SMS service failed" }, { status: 500 });
    // }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Exception dans /api/send-sms :", err?.message || err);
    return NextResponse.json({ error: "SMS failed", details: err?.message || err }, { status: 500 });
  }
}

// 🔹 Gestion pour toute autre méthode HTTP (GET, PUT, DELETE...)
export async function GET() {
  console.warn("⚠️ GET appelé sur /api/send-sms, méthode non autorisée");
  return NextResponse.json(
    { error: "Method GET not allowed. Use POST." },
    { status: 405 }
  );
}
