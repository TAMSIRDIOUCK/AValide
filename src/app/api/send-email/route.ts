import { NextResponse } from "next/server";
import { sendEmail } from "../../../lib/sendEmail";

export async function POST(req: Request) {
  try {
    const { email, subject, message } = await req.json();

    if (!email || !subject || !message) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    await sendEmail(email, subject, `<p>${message}</p>`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ Erreur send-email :", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
