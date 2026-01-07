import { NextResponse } from "next/server";
import { sendSms } from "../../../lib/sendSms"; // ton fichier lib

export async function POST(req: Request) {
  try {
    const apiKey = req.headers.get("Authorization");
    const validApiKey = "your-secret-api-key";

    if (!apiKey || apiKey !== `Bearer ${validApiKey}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { phone, message } = body;

    if (!phone || !message) {
      return NextResponse.json({ error: "Missing phone or message" }, { status: 400 });
    }

    // 🔹 ENVOI SMS RÉEL
    const smsResponse = await sendSms(phone, message);
    console.log("✅ SMS envoyé :", smsResponse);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Erreur API send-sms :", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
