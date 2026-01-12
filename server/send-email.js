import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Fonction pour envoyer l'email
export async function sendEmail({ email, subject, message }) {
  if (!email) throw new Error('Email manquant');

  const transporter = nodemailer.createTransport({
    host: 'smtp.example.com', // remplace par ton SMTP
    port: 587,
    auth: {
      user: 'ton@mail.com', // ton email
      pass: 'motdepasse',   // mot de passe SMTP
    },
  });

  await transporter.sendMail({
    from: '"AVALIDE" <ton@mail.com>',
    to: email,
    subject,
    text: message,
  });

  return { success: true };
}

// Route POST pour envoyer un email
app.post('/send-email', async (req, res) => {
  try {
    const result = await sendEmail(req.body);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Démarrer le serveur
const PORT = 4000;
app.listen(PORT, () => console.log(`Server send-email running on port ${PORT}`));

export default app;
