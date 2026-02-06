// orderService.ts
import { supabase } from '../lib/supabaseClient';
import type { Order } from '../types/types';

//////////////////////////////////////////////////////////////
// 🔎 Parse JSON sécurisé (pour les variants de produit)
//////////////////////////////////////////////////////////////
function tryParseVariant(value: unknown) {
  if (!value) return {};
  if (typeof value === 'object') return value;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return {};
    }
  }
  return {};
}

//////////////////////////////////////////////////////////////
// 🔁 Map une commande Supabase en objet Order
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
        title: item.title ?? 'Produit',
        image: item.image_url ? [item.image_url] : [],
        quantity: item.quantity,
        price: item.price,
        variantSize: (variant as any).size ?? '',
        variantColor: (variant as any).color ?? '',
        variantPrice: (variant as any).price ?? null,
        customerName: item.customer_name ?? '',
        customerPhone: item.customer_phone ?? '',
        customerAddress: item.customer_address ?? '',
        status: item.status ?? 'en_attente',
      };
    }),
  };
}

//////////////////////////////////////////////////////////////
// 🟢 Récupérer toutes les commandes d’un vendeur
//////////////////////////////////////////////////////////////
export async function getOrdersBySeller(sellerId: string): Promise<Order[]> {
  try {
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
        order_items: order.order_items.filter((item: any) => item.seller_id === sellerId),
      }))
      .filter((o: any) => o.order_items.length > 0)
      .map(mapOrderFields);
  } catch (err) {
    console.error('❌ getOrdersBySeller FAILED:', err);
    return [];
  }
}

//////////////////////////////////////////////////////////////
// 🔵 Créer une commande + appeler API backend pour notifications
//////////////////////////////////////////////////////////////
export async function createOrder(orderData: any): Promise<string> {
  if (!orderData?.order_items?.length) throw new Error('order_items vide');

  const sellers = [...new Set(orderData.order_items.map((i: any) => i.seller_id))];
  const mainSellerId = sellers[0];

  try {
    // 1️⃣ Créer la commande principale
    const { data: order, error } = await supabase
      .from('orders')
      .insert({ ...orderData, seller_id: mainSellerId })
      .select()
      .single();

    if (error || !order) throw error;
    const orderId = order.id;

    // 2️⃣ Ajouter les items
    await supabase.from('order_items').insert(
      orderData.order_items.map((item: any) => ({ ...item, order_id: orderId }))
    );

    // 3️⃣ Envoyer notification via API backend sécurisé
    for (const sellerId of sellers) {
      const apiUrl = import.meta.env.VITE_API_URL as string;
      const apiSecret = import.meta.env.VITE_API_SECRET as string;

      if (!apiUrl || !apiSecret) continue;

      await fetch(`${apiUrl}/api/send-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiSecret}`,
        },
        body: JSON.stringify({ sellerId, orderId }),
      });
    }

    return orderId;
  } catch (err) {
    console.error('❌ createOrder FAILED:', err);
    throw err;
  }
}
