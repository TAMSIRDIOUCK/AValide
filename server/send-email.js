// Boucle sur chaque vendeur unique
for (const sellerId of sellers) {
  const sellerItem = order_items.find((i: any) => i.seller_id === sellerId);
  const sellerEmail = sellerItem?.seller_email;
  if (!sellerEmail) continue;

  try {
    // ✅ Insérer un email uniquement si pas déjà existant pour cette commande
    await supabase
      .from('emails_to_send')
      .upsert({
        order_id: orderId,
        seller_id: sellerId,
        seller_email: sellerEmail,
        status: 'pending',
      }, {
        onConflict: ['order_id', 'seller_email'], // empêche les doublons
      });

    console.log(`Email enregistré pour ${sellerEmail}`);

  } catch (err) {
    console.warn('Erreur email (non bloquant):', err);
  }
}
