// src/pages/api/send-seller-email.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabaseClient";

type SelectedVariant = { size?: string; color?: string } | null;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: "orderId manquant" });
    }

    // 🔍 Récupérer tous les items + infos commandes + email des vendeurs
    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select(`
        id,
        product_id,
        seller_id,
        title,
        quantity,
        price,
        selected_variant,
        orders (
          customer_name,
          customer_phone,
          customer_address
        )
      `)
      .eq("order_id", orderId);

    if (itemsError || !items || items.length === 0) {
      console.error("Erreur Supabase order_items :", itemsError);
      return res.status(400).json({ 
        error: "Items introuvables",
        details: itemsError?.message || "Erreur inconnue côté Supabase"
      });
    }

    // 🔹 Grouper les items par vendeur
    const itemsBySeller: Record<string, typeof items> = {};
    items.forEach(item => {
      if (!item.seller_id) return;
      if (!itemsBySeller[item.seller_id]) itemsBySeller[item.seller_id] = [];
      itemsBySeller[item.seller_id].push(item);
    });

    // 🔹 Envoyer un email à chaque vendeur
    for (const sellerId of Object.keys(itemsBySeller)) {
      const sellerItems = itemsBySeller[sellerId];

      // Récupérer email du vendeur
      const { data: seller, error: sellerError } = await supabase
        .from("profiles")
        .select("email, name")
        .eq("id", sellerId)
        .single();

      if (sellerError || !seller) {
        console.error("Erreur Supabase profils :", sellerError);
        continue; // passer au vendeur suivant
      }

      // Infos client (identiques pour tous les items)
      const order = sellerItems[0].orders?.[0];
      if (!order) continue;

      // Construire le contenu HTML
      let htmlContent = `
        <h2>Nouvelle commande reçue</h2>
        <p><strong>Client :</strong> ${order.customer_name}</p>
        <p><strong>Téléphone :</strong> ${order.customer_phone}</p>
        <p><strong>Adresse :</strong> ${order.customer_address}</p>
        <hr>
        <h3>Détails de la commande</h3>
      `;

      sellerItems.forEach(item => {
        const variant: SelectedVariant = item.selected_variant;
        const variantText = variant ? `${variant.size || ""} ${variant.color || ""}` : "Aucune variante";
        htmlContent += `
          <p>
            ${item.title} — ${item.quantity} × ${item.price} FCFA
            <br>
            Variante : ${variantText}
          </p>
        `;
      });

      htmlContent += `
        <hr>
        <p>Consultez votre tableau de bord pour plus de détails.</p>
        <a href="https://ton-site.com/dashboard">Ouvrir le tableau de bord</a>
      `;

      // Envoyer via Supabase Edge Function "send-email"
      const { error: emailError } = await supabase.functions.invoke("send-email", {
        body: {
          to: seller.email,
          subject: "Nouvelle commande reçue",
          html: htmlContent,
        },
      });

      if (emailError) {
        console.error("Erreur envoi email au vendeur :", sellerId, emailError);
      }
    }

    return res.status(200).json({ success: true, message: "Emails envoyés aux vendeurs" });

  } catch (err: any) {
    console.error("Erreur API catch :", err);
    return res.status(500).json({ 
      error: "Erreur serveur",
      details: err.message || err
    });
  }
}
