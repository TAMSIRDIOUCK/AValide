// src/app/api/send-sms/route.ts
import { NextResponse } from "next/server";
import { sendOrderSms } from "../../../lib/sendSms";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, orderId } = body;

    if (!phone || !orderId) {
      return NextResponse.json(
        { success: false, message: "phone et orderId sont requis" },
        { status: 400 }
      );
    }

    await sendOrderSms(phone, orderId);

    return NextResponse.json({ success: true, message: "SMS envoyé !" });
  } catch (error) {
    console.error("Erreur API send-sms:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 }
    );
  }
}
