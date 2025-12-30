import { supabase } from "../lib/supabaseClient";
import { Order } from "../types/types";
import { sendOrderEmail } from "../lib/sendEmail";
import { sendOrderSms } from "../lib/sendSms";

//////////////////////////////////////////////////////////////
// 🔎 Parse TEXT → JSON en toute sécurité
//////////////////////////////////////////////////////////////
function tryParseVariant(v: any) {
  if (!v) return {};
  if (typeof v === "object") return v;
  if (typeof v === "string") {
    try {
      return JSON.parse(v);
    } catch {
      return {};
    }
  }
  return {};
}

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
    paymentMethod: order.payment_method ?? "inconnu",
    status: order.status ?? "pending",
    items: (order.order_items || []).map((item: any) => {
      const variant = tryParseVariant(item.selected_variant);
      return {
        productId: item.product_id,
        sellerId: item.seller_id,
        title: item.title || "Produit",
        image: item.image_url ? [item.image_url] : [],
        quantity: item.quantity,
        price: item.price,
        variantSize: variant.size ?? "",
        variantColor: variant.color ?? "",
        variantPrice: variant.price ?? null,
        customerName: item.customer_name ?? "",
        customerPhone: item.customer_phone ?? "",
        customerAddress: item.customer_address ?? "",
        status: item.status ?? "en_attente",
      };
    }),
  };
}

//////////////////////////////////////////////////////////////
// 🟢 Récupère toutes les commandes pour un vendeur
//////////////////////////////////////////////////////////////
export async function getOrdersBySeller(sellerId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
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
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  const filtered = data
    .map((order: any) => ({
      ...order,
      order_items: order.order_items.filter(
        (item: any) => item.seller_id === sellerId
      ),
    }))
    .filter((order: any) => order.order_items.length > 0);

  return filtered.map(mapOrderFields);
}

//////////////////////////////////////////////////////////////
// 🔵 Récupère tous les items pour un vendeur (dashboard)
//////////////////////////////////////////////////////////////
export async function getOrderItemsBySeller(sellerId: string) {
  const { data, error } = await supabase
    .from("order_items")
    .select("*")
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((item: any) => {
    const variant = tryParseVariant(item.selected_variant);
    return {
      ...item,
      variantSize: variant.size ?? "",
      variantColor: variant.color ?? "",
      variantPrice: variant.price ?? null,
    };
  });
}

//////////////////////////////////////////////////////////////
// ✅ Valider un item
//////////////////////////////////////////////////////////////
export async function markOrderItemAsValidated(itemId: string) {
  await supabase
    .from("order_items")
    .update({ status: "validée" })
    .eq("id", itemId);

  const { data } = await supabase
    .from("order_items")
    .select("order_id")
    .eq("id", itemId)
    .single();

  if (data?.order_id) {
    await updateOrderStatusIfAllItemsValidated(data.order_id);
  }
}

//////////////////////////////////////////////////////////////
// ✅ Met à jour le statut global de la commande
//////////////////////////////////////////////////////////////
export async function updateOrderStatusIfAllItemsValidated(orderId: string) {
  const { data } = await supabase
    .from("order_items")
    .select("status")
    .eq("order_id", orderId);

  if (!data) return;

  const allValidated = data.every((item) => item.status === "validée");

  if (allValidated) {
    await supabase
      .from("orders")
      .update({ status: "validée" })
      .eq("id", orderId);
  }
}

//////////////////////////////////////////////////////////////
// 📢 Notification vendeur (EMAIL + SMS)
//////////////////////////////////////////////////////////////
async function notifySeller({
  sellerEmail,
  sellerPhone,
  orderId,
}: {
  sellerEmail?: string;
  sellerPhone?: string;
  orderId: string;
}) {
  if (sellerEmail) await sendOrderEmail(sellerEmail, orderId);
  if (sellerPhone) await sendOrderSms(sellerPhone, orderId);
}

//////////////////////////////////////////////////////////////
// 🟢 CRÉATION DE COMMANDE (POINT CENTRAL)
//////////////////////////////////////////////////////////////
export const createOrder = async (orderData: any): Promise<string> => {
  const { order_items, ...orderMain } = orderData;

  // 1️⃣ Créer la commande principale
  const { data, error } = await supabase
    .from("orders")
    .insert(orderMain)
    .select()
    .single();

  if (error || !data) throw new Error("Erreur création commande");

  const orderId = data.id;

  // 2️⃣ Créer les items
  if (order_items?.length) {
    const items = order_items.map((item: any) => ({
      ...item,
      order_id: orderId,
    }));

    await supabase.from("order_items").insert(items);

    // 3️⃣ Notifier chaque vendeur
    const sellers = new Map<string, { email?: string; phone?: string }>();

    items.forEach((item: any) => {
      if (!sellers.has(item.seller_id)) {
        sellers.set(item.seller_id, {
          email: item.seller_email,
          phone: item.seller_phone,
        });
      }
    });

    await Promise.all(
      Array.from(sellers.values()).map((seller) =>
        notifySeller({
          sellerEmail: seller.email,
          sellerPhone: seller.phone,
          orderId,
        })
      )
    );
  }

  return orderId;
};
