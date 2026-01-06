// src/utils/orderService.ts
import { supabase } from '../lib/supabaseClient';
import { Order } from '../types/types';

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

    const filteredOrders = (data || []).map((order: any) => ({
      ...order,
      order_items: (order.order_items || []).filter(
        (item: any) => item.seller_id === sellerId
      ),
    }));

    const nonEmptyOrders = filteredOrders.filter(
      (order: any) => order.order_items.length > 0
    );

    return nonEmptyOrders.map(mapOrderFields);

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

    return (data || []).map((item: any) => {
      const variant = tryParseVariant(item.selected_variant);
      return {
        ...item,
        variantSize: variant.size ?? '',
        variantColor: variant.color ?? '',
        variantPrice: variant.price ?? null,
      };
    });

  } catch (err) {
    console.error('❌ Exception getOrderItemsBySeller :', err);
    return [];
  }
}

//////////////////////////////////////////////////////////////
// ✅ Marque un article comme validé et met à jour la commande
//////////////////////////////////////////////////////////////
export async function markOrderItemAsValidated(itemId: string): Promise<void> {
  try {
    const { error: updateError } = await supabase
      .from('order_items')
      .update({ status: 'validée' })
      .eq('id', itemId);

    if (updateError) throw updateError;

    const { data: itemData, error: fetchError } = await supabase
      .from('order_items')
      .select('order_id')
      .eq('id', itemId)
      .single();

    if (fetchError || !itemData) throw fetchError;

    await updateOrderStatusIfAllItemsValidated(itemData.order_id);

  } catch (err) {
    console.error('❌ Exception markOrderItemAsValidated :', err);
    throw err;
  }
}

//////////////////////////////////////////////////////////////
// ✅ Met à jour le statut global d'une commande
//////////////////////////////////////////////////////////////
export async function updateOrderStatusIfAllItemsValidated(orderId: string): Promise<void> {
  try {
    const { data: items } = await supabase
      .from('order_items')
      .select('status')
      .eq('order_id', orderId);

    if (!items) return;

    if (items.every(item => item.status === 'validée')) {
      await supabase.from('orders').update({ status: 'validée' }).eq('id', orderId);
    }

  } catch (err) {
    console.error('❌ Exception updateOrderStatusIfAllItemsValidated :', err);
  }
}

//////////////////////////////////////////////////////////////
// 🔵 Création commande + PUSH + SMS + EMAIL
//////////////////////////////////////////////////////////////
export const createOrder = async (orderData: any): Promise<string> => {
  try {
    const { order_items, ...orderMain } = orderData;

    // 1️⃣ Création commande
    const { data, error } = await supabase
      .from('orders')
      .insert(orderMain)
      .select();

    if (error || !data?.length) throw error;

    const orderId = data[0].id;

    // 2️⃣ Items
    if (order_items?.length) {
      await supabase.from('order_items').insert(
        order_items.map((item: any) => ({ ...item, order_id: orderId }))
      );
    }

    // 3️⃣ PUSH (NE PAS MODIFIER)
    if (order_items?.length) {
      const sellers = [...new Set(order_items.map((i: any) => i.seller_id))];

      await Promise.all(
        sellers.map(sellerId =>
          fetch('/api/send-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sellerId }),
          })
        )
      );
    }

    // 4️⃣ SMS CLIENT
    await fetch('/api/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: orderMain.customer_phone,
        message: `Votre commande AValide (#${orderId}) a bien été reçue. Merci pour votre confiance.`,
      }),
    });

    // 5️⃣ EMAIL CLIENT (si email présent)
    if (orderMain.customer_email) {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: orderMain.customer_email,
          subject: 'Confirmation de commande AValide',
          html: `
            <h3>Merci pour votre commande</h3>
            <p>Numéro : <strong>${orderId}</strong></p>
            <p>Total : ${orderMain.total} FCFA</p>
          `,
        }),
      });
    }

    return orderId;

  } catch (err) {
    console.error('❌ Exception createOrder :', err);
    throw err;
  }
};
