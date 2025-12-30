// src/utils/orderService.ts
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
      console.error("Impossible de parser selected_variant:", v);
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

  if (error) {
    console.error("Erreur getOrdersBySeller:", error);
    return [];
  }
  if (!data) return [];

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

  if (error) {
    console.error("Erreur getOrderItemsBySeller:", error);
    return [];
  }
  if (!data) return [];

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
  const { error } = await supabase
    .from("order_items")
    .update({ status: "validée" })
    .eq("id", itemId);

  if (error) {
    console.error("Erreur markOrderItemAsValidated:", error);
    return;
  }

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
  const { data, error } = await supabase
    .from("order_items")
    .select("status")
    .eq("order_id", orderId);

  if (error) {
    console.error("Erreur updateOrderStatusIfAllItemsValidated:", error);
    return;
  }
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
// 📢 Notification vendeur (EMAIL + SMS) avec logs d'erreurs
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
  if (sellerEmail) {
    try {
      await sendOrderEmail(sellerEmail, orderId);
      console.log("✅ Email envoyé à", sellerEmail);
    } catch (err) {
      console.error("❌ Impossible d'envoyer l'email à", sellerEmail, err);
    }
  }

  if (sellerPhone) {
    try {
      await sendOrderSms(sellerPhone, orderId);
      console.log("✅ SMS envoyé à", sellerPhone);
    } catch (err) {
      console.error("❌ Impossible d'envoyer le SMS à", sellerPhone, err);
    }
  }
}

//////////////////////////////////////////////////////////////
// 🟢 CRÉATION DE COMMANDE (POINT CENTRAL)
//////////////////////////////////////////////////////////////
export const createOrder = async (orderData: any): Promise<{
  success: boolean;
  orderId?: string;
  notifications?: string[];
  message?: string;
}> => {
  const notifications: string[] = [];
  const { order_items, ...orderMain } = orderData;

  // 1️⃣ Créer la commande principale
  const { data, error } = await supabase
    .from("orders")
    .insert(orderMain)
    .select()
    .single();

  if (error || !data) {
    console.error("Erreur création commande:", error);
    return { success: false, message: "Erreur création commande" };
  }

  const orderId = data.id;

  // 2️⃣ Créer les items
  if (order_items?.length) {
    const items = order_items.map((item: any) => ({
      ...item,
      order_id: orderId,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(items);
    if (itemsError) {
      console.error("Erreur création items:", itemsError);
      return { success: false, message: "Erreur création des items" };
    }

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
      Array.from(sellers.values()).map(async (seller) => {
        try {
          await notifySeller({ sellerEmail: seller.email, sellerPhone: seller.phone, orderId });
          notifications.push(`Notifications envoyées à ${seller.email || seller.phone}`);
        } catch (err) {
          notifications.push(`Erreur notification pour ${seller.email || seller.phone}`);
        }
      })
    );
  }

  return { success: true, orderId, notifications };
};
