import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Request body:", body);

    if (!body.email || !body.subject || !body.message) {
      return NextResponse.json(
        { error: "Missing required fields: email, subject, or message" },
        { status: 400 }
      );
    }

    // Simulate sending an email
    console.log("Sending email to:", body.email);
    console.log("Subject:", body.subject);
    console.log("Message:", body.message);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}