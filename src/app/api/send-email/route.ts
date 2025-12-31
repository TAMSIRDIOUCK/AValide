// src/app/api/send-email/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, subject, message } = await req.json();

    if (!email || !message) {
      return NextResponse.json(
        { success: false, error: "email et message obligatoires" },
        { status: 400 }
      );
    }

    console.log("📧 Email à envoyer :", email, subject, message);

    return NextResponse.json({
      success: true,
      message: "Email envoyé (simulation)",
    });

  } catch (err) {
    console.error("❌ Erreur Email :", err);
    return NextResponse.json(
      { success: false, error: "Erreur serveur Email" },
      { status: 500 }
    );
  }
}
