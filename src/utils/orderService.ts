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
export async function getOrderItemsBySeller(sellerId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('order_items')
    .select('*')
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
// 🔵 Création commande + PUSH + EMAIL (emails_to_send)
//////////////////////////////////////////////////////////////
export const createOrder = async (orderData: any): Promise<string> => {
  try {
    const { order_items, ...orderMain } = orderData;

    if (!order_items?.length) {
      throw new Error("order_items vide");
    }

    // 1️⃣ Créer la commande
    const { data: order, error } = await supabase
      .from('orders')
      .insert(orderMain)
      .select()
      .single();

    if (error || !order) throw error;

    const orderId = order.id;

    // 2️⃣ Insérer les items
    await supabase.from('order_items').insert(
      order_items.map((item: any) => ({
        ...item,
        order_id: orderId,
      }))
    );

    // 3️⃣ Vendeurs uniques
    const sellers = [...new Set(order_items.map((i: any) => i.seller_id))];

    for (const sellerId of sellers) {

      //////////////////////////////////////////////////
      // 🔔 PUSH NOTIFICATION
      //////////////////////////////////////////////////
      try {
        const { data: tokens } = await supabase
          .from('user_tokens')
          .select('fcm_token')
          .eq('seller_id', sellerId);

        if (tokens?.length) {
          await fetch('/api/send-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sellerId }),
          });
        }
      } catch (e) {
        console.warn('Push error:', e);
      }

      //////////////////////////////////////////////////
      // 📧 EMAIL → emails_to_send
      //////////////////////////////////////////////////
      try {
        const { data: seller } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', sellerId)
          .single();

        if (!seller?.email) continue;

        const emailRow = {
          recipient: seller.email, // ✅ IMPORTANT
          subject: 'Nouvelle commande AVALIDE',
          message: 'Vous avez reçu une nouvelle commande.',
          seller_id: sellerId,
          order_id: orderId,
          status: 'pending',
        };

        const { error: emailError } = await supabase
          .from('emails_to_send')
          .insert(emailRow);

        if (emailError) {
          console.error('Erreur emails_to_send:', emailError);
        }

      } catch (err) {
        console.error('Erreur email:', err);
      }
    }

    return orderId;

  } catch (err) {
    console.error('❌ createOrder FAILED:', err);
    throw err;
  }
};