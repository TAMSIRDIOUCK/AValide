import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://netgmadtongdspojqaue.supabase.co'; // Remplacez par votre URL Supabase
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ldGdtYWR0b25nZHNwb2pxYXVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMTg3NDIsImV4cCI6MjA2MzY5NDc0Mn0.h6lHxp0xUjiB2mE6OT-ePqNanmSFKs7zhvvHRtwKXKI'; // Remplacez par votre clé anonyme Supabase

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,         // ✅ Garde la session active même après refresh
    autoRefreshToken: true,       // ✅ Rafraîchit automatiquement les tokens expirés
    detectSessionInUrl: true      // ✅ Gère les callbacks après connexion via lien magique
  }
});
