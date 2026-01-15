import { supabase } from '../lib/supabaseClient';
import { Order, OrderItem } from '../types/types';

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
    seller_id: order.seller_id,
    seller_email: order.seller_email,
    items: (order.order_items || []).map((item: any): OrderItem => {
      const variant = tryParseVariant(item.selected_variant);
      const images: string[] = item.image_url
        ? [item.image_url].filter((img: unknown): img is string => !!img)
        : [];

      return {
        id: item.id,
        order_id: item.order_id,
        productId: item.product_id,
        seller_id: item.seller_id,
        seller_email: item.seller_email,
        title: item.title ?? 'Produit',
        images,
        quantity: item.quantity,
        price: item.price,
        variantSize: variant.size ?? '',
        variantColor: variant.color ?? '',
        variantPrice: variant.price ?? null,
        customerName: item.customer_name ?? '',
        customerPhone: item.customer_phone ?? '',
        customerAddress: item.customer_address ?? '',
        status: item.status ?? 'en_attente',
        created_at: item.created_at,
      };
    }),
  };
}

//////////////////////////////////////////////////////////////
// 🟢 Commandes vendeur
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
      seller_id,
      seller_email,
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
        seller_email,
        image_url,
        title,
        selected_variant,
        customer_name,
        customer_phone,
        customer_address,
        status,
        created_at
      )
    `)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data
    .map((order: any) => ({
      ...order,
      order_items: order.order_items.filter(
        (item: any) => item.seller_id === sellerId
      ),
    }))
    .filter((o: any) => o.order_items.length > 0)
    .map(mapOrderFields);
}

//////////////////////////////////////////////////////////////
// 🔵 Items vendeur
//////////////////////////////////////////////////////////////
export async function getOrderItemsBySeller(sellerId: string): Promise<OrderItem[]> {
  const { data, error } = await supabase
    .from('order_items')
    .select('*')
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((item: any): OrderItem => {
    const variant = tryParseVariant(item.selected_variant);
    const images: string[] = item.image_url
      ? [item.image_url].filter((img: unknown): img is string => !!img)
      : [];

    return {
      id: item.id,
      order_id: item.order_id,
      productId: item.product_id,
      seller_id: item.seller_id,
      seller_email: item.seller_email,
      title: item.title ?? 'Produit',
      images,
      quantity: item.quantity,
      price: item.price,
      variantSize: variant.size ?? '',
      variantColor: variant.color ?? '',
      variantPrice: variant.price ?? null,
      customerName: item.customer_name ?? '',
      customerPhone: item.customer_phone ?? '',
      customerAddress: item.customer_address ?? '',
      status: item.status ?? 'en_attente',
      created_at: item.created_at,
    };
  });
}

//////////////////////////////////////////////////////////////
// 🔵 Création commande + PUSH + EMAIL (emails_to_send)
//////////////////////////////////////////////////////////////
export const createOrder = async (orderData: any): Promise<string> => {
  try {
    const { order_items, ...orderMain } = orderData;

    if (!order_items?.length) {
      throw new Error("order_items vide");
    }

    // 1️⃣ Déterminer le seller principal
    const sellers = [...new Set(order_items.map((i: any) => i.seller_id))];
    const mainSellerId = sellers[0];
    const mainSellerItem = order_items.find((i: any) => i.seller_id === mainSellerId);
    const mainSellerEmail = mainSellerItem?.seller_email ?? '';

    // 2️⃣ Créer la commande avec seller_id et seller_email
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        ...orderMain,
        seller_id: mainSellerId,
        seller_email: mainSellerEmail,
      })
      .select()
      .single();

    if (error || !order) throw error;
    const orderId = order.id;

    // 3️⃣ Insérer les items avec order_id
    await supabase.from('order_items').insert(
      order_items.map((item: any) => ({
        ...item,
        order_id: orderId,
      }))
    );

    // 4️⃣ Boucle sur chaque vendeur unique
    for (const sellerId of sellers) {
      const sellerItem = order_items.find((i: any) => i.seller_id === sellerId);
      const sellerEmail = sellerItem?.seller_email;
      if (!sellerEmail) continue;

      //////////////////////////////////////////////////
      // 🔔 PUSH NOTIFICATION (non bloquant)
      //////////////////////////////////////////////////
      try {
        const { data: tokens } = await supabase
          .from('user_tokens')
          .select('fcm_token')
          .eq('seller_id', sellerId)
          .limit(1); // ✅ limite à 1 token pour éviter doublons

        if (tokens?.length) {
          await fetch('/api/send-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sellerId }),
          });
        }
      } catch (e) {
        console.warn('Push error (non bloquant):', e);
      }

      //////////////////////////////////////////////////
      // 📧 EMAIL → emails_to_send (non bloquant)
      //////////////////////////////////////////////////
      try {
        // ✅ Vérifie si un email existe déjà pour ce seller + commande
        const { data: existingEmail } = await supabase
          .from('emails_to_send')
          .select('id')
          .eq('order_id', orderId)
          .eq('seller_email', sellerEmail)
          .single();

        if (!existingEmail) {
          await supabase.from('emails_to_send').insert({
            order_id: orderId,
            seller_id: sellerId,
            seller_email: sellerEmail,
            status: 'pending',
          });
        }
      } catch (err) {
        console.warn('Email error (non bloquant):', err);
      }
    }

    return orderId;
  } catch (err) {
    console.error('❌ createOrder FAILED:', err);
    throw err;
  }
};
