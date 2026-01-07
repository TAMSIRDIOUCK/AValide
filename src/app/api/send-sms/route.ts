// src/app/api/send-sms/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📩 Requête SMS reçue :", body);

    const { phone, message } = body;

    if (!phone || !message) {
      console.error("❌ Données manquantes");
      return NextResponse.json(
        { error: "Missing phone or message" },
        { status: 400 }
      );
    }

    // 🔹 SIMULATION SMS (pour test)
    console.log("✅ SMS simulé envoyé à :", phone);
    console.log("📨 Message :", message);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Erreur API send-sms :", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
