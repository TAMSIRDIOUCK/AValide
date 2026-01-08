import { NextResponse } from "next/server";
import { sendEmail } from "../../../lib/sendEmail";

export async function POST(req: Request) {
  try {
    const { email, subject, message } = await req.json();
    if (!email || !subject || !message)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    await sendEmail(email, subject, `<p>${message}</p>`);
    return NextResponse.json({ success: true });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ Erreur email :", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
