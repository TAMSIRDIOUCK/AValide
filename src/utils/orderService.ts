// src/utils/orderService.ts
import { supabase } from '../lib/supabaseClient';
import { Order } from '../types/types';
import { getSellerFcmTokens, sendNotificationToSeller } from '../lib/notificationService';
import { v4 as uuidv4 } from 'uuid';

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
        sellerId: item.seller_id, // correct
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
// 🔎 Parse TEXT → JSON en toute sécurité
//////////////////////////////////////////////////////////////
function tryParseVariant(v: any) {
  if (!v) return {};
  if (typeof v === 'object') return v;
  if (typeof v === 'string') {
    try {
      return JSON.parse(v);
    } catch {
      console.warn('⚠️ selected_variant non JSON :', v);
      return {};
    }
  }
  return {};
}

//////////////////////////////////////////////////////////////
// 🟢 Récupère toutes les commandes du vendeur
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

  if (error) {
    console.error('❌ Erreur récupération commandes vendeur :', error);
    return [];
  }

  // Filtrer uniquement les items du vendeur
  const filteredOrders = (data || []).map((order: any) => ({
    ...order,
    order_items: (order.order_items || []).filter(
      (item: any) => item.seller_id === sellerId
    ),
  }));

  // Supprimer les commandes sans items
  const nonEmptyOrders = filteredOrders.filter(
    (order: any) => order.order_items.length > 0
  );

  return nonEmptyOrders.map(mapOrderFields);
}

//////////////////////////////////////////////////////////////
// 🔵 Retourne les items individuellement (Dashboard vendeur)
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

  if (error) {
    console.error('❌ Erreur récupération items :', error);
    return [];
  }

  return (data || []).map((item: any) => {
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
// ✅ Marque un article comme validé et vérifie si tous les articles sont validés
//////////////////////////////////////////////////////////////
export async function markOrderItemAsValidated(itemId: string): Promise<void> {
  const { error: updateError } = await supabase
    .from('order_items')
    .update({ status: 'validée' })
    .eq('id', itemId);

  if (updateError) throw new Error('Erreur lors de la mise à jour du statut');

  const { data: itemData, error: fetchError } = await supabase
    .from('order_items')
    .select('order_id')
    .eq('id', itemId)
    .single();

  if (fetchError || !itemData) throw new Error('Impossible de récupérer order_id');

  await updateOrderStatusIfAllItemsValidated(itemData.order_id);
}

//////////////////////////////////////////////////////////////
// ✅ Met à jour le statut global d'une commande si tous ses items sont validés
//////////////////////////////////////////////////////////////
export async function updateOrderStatusIfAllItemsValidated(orderId: string): Promise<void> {
  const { data: items, error } = await supabase
    .from('order_items')
    .select('status')
    .eq('order_id', orderId);

  if (error || !items) return;

  const allValidated = items.every(item => item.status === 'validée');

  if (allValidated) {
    await supabase
      .from('orders')
      .update({ status: 'validée' })
      .eq('id', orderId);
  }
}

//////////////////////////////////////////////////////////////
// 🔵 Crée une commande et envoie la notification FCM automatiquement
//////////////////////////////////////////////////////////////
export const createOrder = async (orderData: any) => {
  // 1️⃣ Enregistre la commande principale sans sellerId
  const { order_items, ...orderMain } = orderData;
  const { data, error } = await supabase
    .from("orders")
    .insert(orderMain)
    .select();

  if (error) throw error;
  if (!data || data.length === 0) throw new Error("Erreur création commande");

  const orderId = data[0].id;

  // 2️⃣ Insère les items avec order_id
  if (order_items && order_items.length > 0) {
    const itemsToInsert = order_items.map((item: any) => ({
      ...item,
      order_id: orderId,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(itemsToInsert);

    if (itemsError) throw itemsError;
  }

  // 3️⃣ Notifications FCM par vendeur
  if (order_items && order_items.length > 0) {
    const itemsBySeller: Record<string, typeof order_items> = order_items.reduce(
      (acc: Record<string, typeof order_items>, item: any) => {
        if (!acc[item.seller_id]) acc[item.seller_id] = [];
        acc[item.seller_id].push(item);
        return acc;
      },
      {}
    );

    await Promise.all(
      Object.entries(itemsBySeller).map(async ([sellerId, items]) => {
        const tokens = await getSellerFcmTokens(sellerId);
        if (tokens && tokens.length > 0) {
          await sendNotificationToSeller(
            sellerId,
            "Nouvelle commande !",
            `Vous avez reçu une nouvelle commande (${items.length} produit${items.length > 1 ? 's' : ''}).`
          );
        }
      })
    );
  }

  return orderId;
};
