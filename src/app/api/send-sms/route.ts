// src/app/api/send-sms/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { phone, message } = await req.json();

    if (!phone || !message) {
      return NextResponse.json({ error: "Missing phone or message" }, { status: 400 });
    }

    // 🔹 Ici tu appelles ton service SMS (Wave, Twilio...)
    // Exemple minimal pour test :
    console.log("📩 SMS à envoyer :", phone, message);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ SMS failed:", err);
    return NextResponse.json({ error: "SMS failed" }, { status: 500 });
  }
}
