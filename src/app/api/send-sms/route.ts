// src/app/api/send-sms/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { phone, message } = await req.json();

    if (!phone || !message) {
      return NextResponse.json(
        { success: false, error: "phone et message obligatoires" },
        { status: 400 }
      );
    }

    console.log("📩 SMS à envoyer :", phone, message);

    return NextResponse.json({
      success: true,
      message: "SMS envoyé (simulation)",
    });

  } catch (err) {
    console.error("❌ Erreur SMS :", err);
    return NextResponse.json(
      { success: false, error: "Erreur serveur SMS" },
      { status: 500 }
    );
  }
}
