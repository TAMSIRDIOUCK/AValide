// server/send-email.js
import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 4000;

// Remplace avec ton vrai SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.example.com", // ex: smtp.gmail.com
  port: 587,
  secure: false,
  auth: {
    user: "ton@email.com",
    pass: "motdepasse",
  },
});

app.post("/send-email", async (req, res) => {
  try {
    const { email, subject, message } = req.body;
    if (!email) return res.status(400).json({ error: "Email manquant" });

    await transporter.sendMail({
      from: '"AVALIDE" <ton@email.com>',
      to: email,
      subject,
      text: message,
    });

    return res.json({ success: true });
  } catch (err) {
    console.error("Erreur send-email:", err);
    return res.status(500).json({ error: "Impossible d'envoyer l'email" });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur email lancé sur http://localhost:${PORT}`);
});
