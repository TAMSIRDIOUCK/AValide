// src/utils/orderService.ts
import { supabase } from '../lib/supabaseClient';
import { Order } from '../types/types';
import { getSellerFcmTokens, sendNotificationToSeller } from '../lib/notificationService';
import { v4 as uuidv4 } from 'uuid';

//////////////////////////////////////////////////////////////
// 🔁 Transforme une ligne Supabase en objet Order exploitable
//////////////////////////////////////////////////////////////
function mapOrderFields(order: any): Order {
  try {
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
  } catch (err) {
    console.error('❌ Erreur dans mapOrderFields :', err, order);
    throw err;
  }
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
    } catch (err) {
      console.warn('⚠️ selected_variant non JSON :', v, err);
      return {};
    }
  }
  return {};
}

//////////////////////////////////////////////////////////////
// 🟢 Récupère toutes les commandes du vendeur
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

    const mappedOrders = nonEmptyOrders.map(mapOrderFields);
    console.log(`✅ ${mappedOrders.length} commande(s) récupérée(s) pour le vendeur ${sellerId}`);
    return mappedOrders;

  } catch (err) {
    console.error('❌ Exception getOrdersBySeller :', err);
    return [];
  }
}

//////////////////////////////////////////////////////////////
// 🔵 Retourne les items individuellement (Dashboard vendeur)
//////////////////////////////////////////////////////////////
export async function getOrderItemsBySeller(sellerId: string): Promise<any[]> {
  try {
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

    const items = (data || []).map((item: any) => {
      const variant = tryParseVariant(item.selected_variant);
      return {
        ...item,
        variantSize: variant.size ?? '',
        variantColor: variant.color ?? '',
        variantPrice: variant.price ?? null,
      };
    });

    console.log(`✅ ${items.length} item(s) récupéré(s) pour le vendeur ${sellerId}`);
    return items;

  } catch (err) {
    console.error('❌ Exception getOrderItemsBySeller :', err);
    return [];
  }
}

//////////////////////////////////////////////////////////////
// ✅ Marque un article comme validé et vérifie si tous les articles sont validés
//////////////////////////////////////////////////////////////
export async function markOrderItemAsValidated(itemId: string): Promise<void> {
  try {
    const { error: updateError } = await supabase
      .from('order_items')
      .update({ status: 'validée' })
      .eq('id', itemId);

    if (updateError) {
      console.error('❌ Erreur mise à jour item validé :', updateError);
      throw updateError;
    }

    const { data: itemData, error: fetchError } = await supabase
      .from('order_items')
      .select('order_id')
      .eq('id', itemId)
      .single();

    if (fetchError || !itemData) {
      console.error('❌ Impossible de récupérer order_id pour itemId', itemId, fetchError);
      throw fetchError || new Error('order_id introuvable');
    }

    await updateOrderStatusIfAllItemsValidated(itemData.order_id);

  } catch (err) {
    console.error('❌ Exception markOrderItemAsValidated :', err);
    throw err;
  }
}

//////////////////////////////////////////////////////////////
// ✅ Met à jour le statut global d'une commande si tous ses items sont validés
//////////////////////////////////////////////////////////////
export async function updateOrderStatusIfAllItemsValidated(orderId: string): Promise<void> {
  try {
    const { data: items, error } = await supabase
      .from('order_items')
      .select('status')
      .eq('order_id', orderId);

    if (error || !items) {
      console.warn('⚠️ Impossible de récupérer les items pour orderId', orderId, error);
      return;
    }

    const allValidated = items.every(item => item.status === 'validée');

    if (allValidated) {
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'validée' })
        .eq('id', orderId);

      if (updateError) {
        console.error('❌ Erreur mise à jour statut commande :', updateError);
      } else {
        console.log(`✅ Commande ${orderId} marquée validée (tous les items validés)`);
      }
    }

  } catch (err) {
    console.error('❌ Exception updateOrderStatusIfAllItemsValidated :', err);
  }
}

//////////////////////////////////////////////////////////////
// 🔵 Crée une commande et envoie la notification FCM automatiquement
//////////////////////////////////////////////////////////////
export const createOrder = async (orderData: any): Promise<string> => {
  try {
    console.log('📌 Début création commande');

    // 1️⃣ Enregistre la commande principale
    const { order_items, ...orderMain } = orderData;
    const { data, error } = await supabase
      .from("orders")
      .insert(orderMain)
      .select();

    if (error) {
      console.error('❌ Erreur création commande :', error);
      throw error;
    }
    if (!data || data.length === 0) throw new Error("Erreur création commande : data vide");

    const orderId = data[0].id;
    console.log('✅ Commande principale créée, orderId :', orderId);

    // 2️⃣ Insère les items
    if (order_items && order_items.length > 0) {
      const itemsToInsert = order_items.map((item: any) => ({
        ...item,
        order_id: orderId,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(itemsToInsert);

      if (itemsError) {
        console.error('❌ Erreur insertion items :', itemsError);
        throw itemsError;
      }

      console.log(`✅ ${order_items.length} item(s) inséré(s) pour la commande`);
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
          try {
            const tokens = await getSellerFcmTokens(sellerId);
            if (tokens && tokens.length > 0) {
              await sendNotificationToSeller(
                sellerId,
                "Nouvelle commande !",
                `Vous avez reçu une nouvelle commande (${items.length} produit${items.length > 1 ? 's' : ''}).`
              );
              console.log(`✅ Notification envoyée au vendeur ${sellerId}`);
            } else {
              console.warn(`⚠️ Aucun token FCM pour le vendeur ${sellerId}, notification non envoyée`);
            }
          } catch (notifError) {
            console.error(`❌ Erreur notification vendeur ${sellerId} :`, notifError);
          }
        })
      );
    }

    console.log('✅ Création commande terminée');
    return orderId;

  } catch (err) {
    console.error('❌ Exception createOrder :', err);
    throw err;
  }
};
