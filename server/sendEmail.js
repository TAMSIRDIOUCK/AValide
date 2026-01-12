import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

// 🔹 Configure Supabase
const supabaseUrl = 'https://netgmadtongdspojqaue.supabase.co'; // Remplacez par votre URL Supabase
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ldGdtYWR0b25nZHNwb2pxYXVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMTg3NDIsImV4cCI6MjA2MzY5NDc0Mn0.h6lHxp0xUjiB2mE6OT-ePqNanmSFKs7zhvvHRtwKXKI'; // Remplacez par votre clé anonyme Supabase

const supabase = createClient(supabaseUrl, supabaseKey);

// 🔹 Configure Nodemailer (SMTP)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // ton SMTP
  port: 587,
  auth: {
    user: 'ton@mail.com',
    pass: 'motdepasse',
  },
});

// 🔹 Fonction principale
async function sendPendingEmails() {
  try {
    // Récupérer les emails non envoyés
    const { data: emails, error } = await supabase
      .from('emails_to_send')
      .select('*')
      .eq('sent', false)
      .order('created_at', { ascending: true });

    if (error) throw error;
    if (!emails || emails.length === 0) return console.log('✅ Aucun email en attente');

    for (const email of emails) {
      try {
        // Envoyer l'email
        await transporter.sendMail({
          from: '"AVALIDE" <ton@mail.com>',
          to: email.recipient,
          subject: email.subject,
          text: email.body,
        });

        console.log(`✅ Email envoyé à ${email.recipient}`);

        // Marquer comme envoyé
        await supabase
          .from('emails_to_send')
          .update({ sent: true })
          .eq('id', email.id);
      } catch (err) {
        console.error(`❌ Erreur en envoyant à ${email.recipient}:`, err);
      }
    }
  } catch (err) {
    console.error('❌ Erreur sendPendingEmails:', err);
  }
}

// 🔹 Exécuter toutes les X secondes
setInterval(sendPendingEmails, 10000); // toutes les 10 secondes

console.log('🚀 Service email en cours d\'exécution...');
