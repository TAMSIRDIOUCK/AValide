// src/app/api/send-sms/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { phone, message } = await req.json();
    console.log("📩 Reçu pour envoi SMS :", phone, message);

    if (!phone || !message) {
      console.warn("⚠️ Missing phone or message");
      return NextResponse.json({ error: "Missing phone or message" }, { status: 400 });
    }

    // 🔹 Exemple de test
    console.log("✅ Envoi SMS simulé :", phone, message);

    // Ici tu mettrais l'appel réel à Wave ou Twilio
    // Ex : await sendWaveSMS(phone, message);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Erreur route /send-sms :", err);
    return NextResponse.json({ error: "SMS failed" }, { status: 500 });
  }
}

// Gérer GET ou autres méthodes pour éviter 405 non informatif
export async function GET() {
  console.warn("⚠️ Tentative GET sur /send-sms");
  return NextResponse.json({ error: "GET not allowed, use POST" }, { status: 405 });
}
