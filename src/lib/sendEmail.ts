import fetch from "node-fetch";

export async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.BREVO_API_KEY!,
    },
    body: JSON.stringify({
      sender: { name: "AValide", email: "no-reply@avalide.com" },
      to: [{ email: to }],
      subject: subject,
      htmlContent: html,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  console.log("✅ Email envoyé :", data);
  return data;
}
