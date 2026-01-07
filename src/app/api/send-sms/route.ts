// src/app/api/send-sms/route.ts
import { NextResponse } from "next/server";

export async function OPTIONS() {
  return NextResponse.json(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(req: Request) {
  try {
    const apiKey = req.headers.get("Authorization");
    const validApiKey = "your-secret-api-key"; // Replace with your actual API key

    if (!apiKey || apiKey !== `Bearer ${validApiKey}`) {
      console.error("❌ Unauthorized access");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

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

    return NextResponse.json({ success: true }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("❌ Erreur API send-sms :", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }
}
