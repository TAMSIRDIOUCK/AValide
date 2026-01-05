import { supabase } from '../lib/supabaseClient';
import { Order } from '../types/types';

//////////////////////////////////////////////////////////////
// 🔁 Transforme une ligne Supabase en objet Order exploitable
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
// 🟢 Commandes vendeur (PAGE MES COMMANDES)
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
    order_items: order.order_items.filter(
      (item: any) => item.seller_id === sellerId
    ),
  }));

  return filtered
    .filter((o: any) => o.order_items.length > 0)
    .map(mapOrderFields);
}

//////////////////////////////////////////////////////////////
// 🔵 ITEMS INDIVIDUELS (utilisé par MyOrdersPage.tsx)
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
// 🔵 CRÉATION COMMANDE + PUSH + WHATSAPP + SMS + EMAIL
//////////////////////////////////////////////////////////////
export const createOrder = async (orderData: any): Promise<string> => {
  const { order_items, ...orderMain } = orderData;

  // 1️⃣ Créer commande
  const { data, error } = await supabase
    .from('orders')
    .insert(orderMain)
    .select()
    .single();

  if (error || !data) throw error;

  const orderId = data.id;

  // 2️⃣ Insérer items
  if (order_items?.length) {
    await supabase.from('order_items').insert(
      order_items.map((item: any) => ({
        ...item,
        order_id: orderId,
      }))
    );
  }

  // 3️⃣ PUSH vendeur
  const sellers = [...new Set(order_items.map((i: any) => i.seller_id))];

  await Promise.all(
    sellers.map((sellerId: string) =>
      fetch('/api/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerId }),
      })
    )
  );

  // 4️⃣ WHATSAPP vendeur
  for (const item of order_items) {
    if (!item.seller_phone) continue;

    await fetch('/api/send-whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: item.seller_phone,
        message: `
🛒 Nouvelle commande AValide

📦 Produit : ${item.title}
🔢 Quantité : ${item.quantity}
💰 Prix : ${item.price} FCFA

👤 Client : ${orderMain.customer_name}
📞 ${orderMain.customer_phone}
📍 ${orderMain.customer_address}
        `,
      }),
    });
  }

  // 5️⃣ WHATSAPP client
  await fetch('/api/send-whatsapp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: orderMain.customer_phone,
      message: `
✅ Merci pour votre commande sur AValide !

🧾 Numéro : ${orderId}
💰 Total : ${orderMain.total} FCFA
📦 Livraison en cours
      `,
    }),
  });

  // 6️⃣ SMS client
  await fetch('/api/send-sms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: orderMain.customer_phone,
      message: `AValide : votre commande #${orderId} a bien été reçue.`,
    }),
  });

  // 7️⃣ EMAIL client
  if (orderMain.customer_email) {
    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: orderMain.customer_email,
        subject: 'Confirmation commande AValide',
        html: `
          <h3>Merci pour votre commande</h3>
          <p>Commande : <b>${orderId}</b></p>
          <p>Total : ${orderMain.total} FCFA</p>
        `,
      }),
    });
  }

  return orderId;
};
