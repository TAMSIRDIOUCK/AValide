// src/utils/orderService.ts
import { supabase } from '../lib/supabaseClient';
import { Order } from '../types/types';

//////////////////////////////////////////////////////////////
// 🔎 Parse TEXT → JSON sécurisé
//////////////////////////////////////////////////////////////
function tryParseVariant(v: any) {
  if (!v) return {};
  if (typeof v === 'object') return v;
  if (typeof v === 'string') {
    try {
      return JSON.parse(v);
    } catch {
      return {};
    }
  }
  return {};
}

//////////////////////////////////////////////////////////////
// 🔁 Transforme une ligne Supabase en objet Order
//////////////////////////////////////////////////////////////
function mapOrderFields(order: any): Order {
  return {
    id: order.id,
    userId: order.user_id,
    createdAt: order.created_at,
    total: order.total,
    customerName: order.customer_name,
    customerPhone: order.customer_phone,
    customerAddress: order.customer_address,
    paymentMethod: order.payment_method ?? 'inconnu',
    status: order.status ?? 'pending',
    items: (order.order_items || []).map((item: any) => {
      const variant = tryParseVariant(item.selected_variant);
      return {
        productId: item.product_id,
        sellerId: item.seller_id,
        title: item.title || 'Produit',
        image: item.image_url ? [item.image_url] : [],
        quantity: item.quantity,
        price: item.price,
        variantSize: variant.size ?? '',
        variantColor: variant.color ?? '',
        variantPrice: variant.price ?? null,
        customerName: item.customer_name ?? '',
        customerPhone: item.customer_phone ?? '',
        customerAddress: item.customer_address ?? '',
        status: item.status ?? 'en_attente',
      };
    }),
  };
}

//////////////////////////////////////////////////////////////
// 🟢 Commandes vendeur (page Mes commandes)
//////////////////////////////////////////////////////////////
export async function getOrdersBySeller(sellerId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      user_id,
      created_at,
      total,
      payment_method,
      status,
      customer_name,
      customer_phone,
      customer_address,
      order_items (
        id,
        order_id,
        product_id,
        quantity,
        price,
        seller_id,
        image_url,
        title,
        selected_variant,
        customer_name,
        customer_phone,
        customer_address,
        status
      )
    `)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  const filtered = data.map((order: any) => ({
    ...order,
    order_items: (order.order_items || []).filter(
      (item: any) => item.seller_id === sellerId
    ),
  }));

  return filtered
    .filter((o: any) => o.order_items.length > 0)
    .map(mapOrderFields);
}

//////////////////////////////////////////////////////////////
// 🔵 Items individuels (Dashboard vendeur)
//////////////////////////////////////////////////////////////
export async function getOrderItemsBySeller(sellerId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('order_items')
    .select(`
      id,
      order_id,
      product_id,
      quantity,
      price,
      seller_id,
      image_url,
      title,
      selected_variant,
      created_at,
      customer_name,
      customer_phone,
      customer_address,
      status
    `)
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((item: any) => {
    const variant = tryParseVariant(item.selected_variant);
    return {
      ...item,
      variantSize: variant.size ?? '',
      variantColor: variant.color ?? '',
      variantPrice: variant.price ?? null,
    };
  });
}

//////////////////////////////////////////////////////////////
// 🔵 Création commande + PUSH + SMS (POUR TOUS) + SMS client
//////////////////////////////////////////////////////////////
export const createOrder = async (orderData: any): Promise<string> => {
  try {
    const { order_items, ...orderMain } = orderData;

    // 1️⃣ Créer la commande
    const { data, error } = await supabase
      .from('orders')
      .insert(orderMain)
      .select()
      .single();

    if (error || !data) throw error;

    const orderId = data.id;

    // 2️⃣ Insérer les items
    if (order_items?.length) {
      await supabase.from('order_items').insert(
        order_items.map((item: any) => ({
          ...item,
          order_id: orderId,
        }))
      );
    }

    //////////////////////////////////////////////////////////////
    // 3️⃣ NOTIFICATION VENDEURS (PUSH + EMAIL TOUJOURS)
    //////////////////////////////////////////////////////////////
    const sellers = [...new Set(order_items.map((i: any) => i.seller_id))] as string[];

    // ... tout le code précédent reste inchangé ...
    for (const sellerId of sellers) {
      console.log("➡️ Notification vendeur pour sellerId :", sellerId);

      // 🔹 PUSH (si token existe)
      const { data: tokens } = await supabase
        .from('user_tokens')
        .select('fcm_token')
        .eq('seller_id', sellerId);

      console.log("   Tokens FCM trouvés :", tokens);

      if (tokens && tokens.length > 0) {
        console.log("   Envoi PUSH au vendeur...");
        await fetch('/api/send-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sellerId }),
        });
      }

      // 📩 EMAIL (TOUJOURS)
      const { data: seller } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', sellerId)
        .single();

      console.log("   Email vendeur :", seller?.email);

      if (!seller?.email) continue;

      // 🔹 Utilisation de ton fetch simplifié
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: seller.email,
          subject: "Nouvelle commande",
          message: "Vous avez une nouvelle commande",
        }),
      });
    }

    //////////////////////////////////////////////////////////////
    // 4️⃣ SMS CLIENT
    //////////////////////////////////////////////////////////////
    // Removed SMS client notification logic as requested

    return orderId;

  } catch (err) {
    console.error('❌ Exception createOrder :', err);
    throw err;
  }
};
