// 📁 utils/orderService.ts
import { supabase } from '../lib/supabaseClient';
import { Order } from '../types';

////////////////////////////////////////////////////////////////////////////////
// Mappe une commande Supabase en objet Order
////////////////////////////////////////////////////////////////////////////////
function mapOrderFields(order: any): Order {
  return {
    id: order.id,
    userId: order.user_id,
    createdAt: order.created_at,
    total: order.total,
    customerName: order.customer_name,
    customerPhone: order.customer_phone,
    customerAddress: order.customer_address,
    customerEmail: order.customer_email || '',
    additionalInfo: order.additional_info || '',
    paymentMethod: order.payment_method || '',
    status: order.status || 'en_attente',
    items: (order.order_items || []).map((item: any) => ({
      id: item.id,
      productId: item.product_id,
      sellerId: item.seller_id,
      title: item.title || 'Produit',
      image: item.image_url ? [item.image_url] : [],
      quantity: item.quantity,
      price: item.price,
      status: item.status || 'en_attente',
      customerName: item.customer_name || '',
      customerPhone: item.customer_phone || '',
      customerAddress: item.customer_address || '',
    })),
  };
}

////////////////////////////////////////////////////////////////////////////////
// Récupère tous les articles d’un vendeur (order_items)
////////////////////////////////////////////////////////////////////////////////
export async function getOrderItemsBySeller(sellerId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('order_items')
    .select(`
      id,
      order_id,
      created_at,
      product_id,
      quantity,
      price,
      seller_id,
      image_url,
      title,
      customer_name,
      customer_phone,
      customer_address,
      status
    `)
    .eq('seller_id', sellerId);

  if (error) {
    console.error('❌ Erreur récupération items :', error);
    return [];
  }

  return data || [];
}

////////////////////////////////////////////////////////////////////////////////
// Met à jour un article à "validée" puis met à jour la commande si besoin
////////////////////////////////////////////////////////////////////////////////
export async function markOrderItemAsValidated(itemId: string): Promise<void> {
  // 1. Met à jour l’item
  const { error: updateError } = await supabase
    .from('order_items')
    .update({ status: 'validée' })
    .eq('id', itemId);

  if (updateError) {
    throw new Error('Erreur lors de la mise à jour du statut');
  }

  // 2. Récupère order_id de cet item
  const { data: itemData, error: fetchError } = await supabase
    .from('order_items')
    .select('order_id')
    .eq('id', itemId)
    .single();

  if (fetchError || !itemData) {
    throw new Error('Impossible de récupérer order_id après mise à jour');
  }

  // 3. Met à jour le statut global de la commande si tous les items sont validés
  await updateOrderStatusIfAllItemsValidated(itemData.order_id);
}

////////////////////////////////////////////////////////////////////////////////
// Met à jour la commande en "validée" si tous ses articles sont validés
////////////////////////////////////////////////////////////////////////////////
export async function updateOrderStatusIfAllItemsValidated(orderId: string): Promise<void> {
  const { data: items, error } = await supabase
    .from('order_items')
    .select('status')
    .eq('order_id', orderId);

  if (error || !items) {
    console.error('❌ Erreur lecture items pour update commande :', error);
    return;
  }

  const allValidated = items.every((item) => item.status === 'validée');

  if (allValidated) {
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: 'validée' })
      .eq('id', orderId);

    if (updateError) {
      console.error('❌ Erreur mise à jour status commande :', updateError);
    } else {
      console.log(`✅ Commande ${orderId} mise à jour à "validée"`);
    }
  }
}

////////////////////////////////////////////////////////////////////////////////
// Récupère les commandes d’un vendeur avec ses articles filtrés par vendeur
////////////////////////////////////////////////////////////////////////////////
export async function getOrdersBySeller(sellerId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        id,
        order_id,
        created_at,
        product_id,
        quantity,
        price,
        seller_id,
        image_url,
        title,
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

  // Filtre les articles pour ne garder que ceux du vendeur
  return (data || [])
    .map((order: any) => {
      order.order_items = (order.order_items || []).filter(
        (item: any) => item.seller_id === sellerId
      );
      return mapOrderFields(order);
    })
    // Ne garde que les commandes avec au moins un article du vendeur
    .filter((order) => order.items.length > 0);
}
