import { supabase } from '../lib/supabaseClient';
import { Order } from '../types/types';

//////////////////////////////////////////////////////////////
// 🔎 Parse sécurisé
//////////////////////////////////////////////////////////////
function tryParseVariant(v: unknown): any {
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
// 🔁 Mapper Order
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
        status: item.status ?? 'en_attente',
      };
    }),
  };
}

//////////////////////////////////////////////////////////////
// 🟢 Commandes par vendeur
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
        product_id,
        quantity,
        price,
        seller_id,
        image_url,
        title,
        selected_variant,
        status
      )
    `)
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.error('❌ getOrdersBySeller:', error);
    return [];
  }

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
// 🟢 Items vendeur
//////////////////////////////////////////////////////////////
export async function getOrderItemsBySeller(sellerId: string) {
  const { data, error } = await supabase
    .from('order_items')
    .select('*')
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ getOrderItemsBySeller:', error);
    return [];
  }

  return data ?? [];
}

//////////////////////////////////////////////////////////////
// 🔔 Push → API (SAFE)
//////////////////////////////////////////////////////////////
async function sendPushToSeller(sellerId: string, orderId: string) {
  if (typeof window === 'undefined') return;

  try {
    const res = await fetch('/api/send-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sellerId, orderId }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('❌ Push API error:', text);
    }
  } catch (err) {
    console.error('❌ Push fetch failed:', err);
  }
}

//////////////////////////////////////////////////////////////
// 🟢 Création commande (SOLIDE)
//////////////////////////////////////////////////////////////
export const createOrder = async (orderData: any): Promise<string> => {
  const { order_items, ...orderMain } = orderData;

  if (!Array.isArray(order_items) || order_items.length === 0) {
    throw new Error('order_items vide');
  }

  const sellers = [...new Set(order_items.map((i: any) => String(i.seller_id)))];
  const mainSellerId = sellers[0];

  // 1️⃣ Insert order
  const { data: order, error } = await supabase
    .from('orders')
    .insert({ ...orderMain, seller_id: mainSellerId })
    .select()
    .single();

  if (error || !order) {
    console.error('❌ Insert order failed:', error);
    throw error;
  }

  // 2️⃣ Insert items
  const { error: itemsError } = await supabase.from('order_items').insert(
    order_items.map((item: any) => ({
      ...item,
      order_id: order.id,
    }))
  );

  if (itemsError) {
    console.error('❌ Insert order_items failed:', itemsError);
  }

  // 3️⃣ Push async (non bloquant)
  sellers.forEach((sellerId) => {
    sendPushToSeller(sellerId, order.id);
  });

  return order.id;
};
