// src/lib/sendEmail.ts
/**
 * Wrapper pour appeler l'API /api/send-email
 * côté frontend ou SSR.
 */

// src/lib/sendEmail.ts
export async function sendOrderEmail(toEmail: string, orderId: string) {
    const res = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toEmail, orderId }),
    });
  
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Erreur lors de l'envoi de l'email");
    }
  }
  