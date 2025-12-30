import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "sirdiouck101@gmail.com",   // ex: avalide.notify@gmail.com
    pass: "nabr nibu nngt lbjn", // mot de passe d’application Gmail
  },
});

export async function sendOrderEmail(
  toEmail: string,
  orderId: string
) {
  await transporter.sendMail({
    from: '"AValide" <avalide.notify@gmail.com>',
    to: toEmail,
    subject: "🛒 Nouvelle commande reçue",
    html: `
      <div style="font-family:Arial">
        <img src="https://a-valide.com/logo-avalide.png" width="120" />
        <h2>Nouvelle commande 🎉</h2>
        <p>Commande <strong>#${orderId}</strong> reçue.</p>
        <a href="https://a-valide.com/orders"
           style="background:#ff6600;color:#fff;padding:10px 15px;
                  text-decoration:none;border-radius:5px;">
          Voir la commande
        </a>
      </div>
    `,
  });
}
