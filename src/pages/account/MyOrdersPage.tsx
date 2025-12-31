// src/pages/account/MyOrdersPage.tsx
import React, { useEffect, useState } from 'react';
import Layout from '../../app/api/layout/Layout';
import { useAuth } from '../../context/AuthContext';
import { getOrderItemsBySeller } from '../../utils/orderService';
import { supabase } from '../../lib/supabaseClient';
import { AlertCircle, Trash2, Printer } from 'lucide-react';

interface ExtendedOrderItem {
  id: string;
  productId: string;
  sellerId: string;
  orderId: string;
  quantity: number;
  price: number;
  imageUrl?: string;
  title: string;
  selectedVariant?: string; // Toujours string formaté
}

interface OrderWithItems {
  id: string;
  userId: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  total: number;
  orderItems: ExtendedOrderItem[];
}

const MyOrdersPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchOrders();
  }, [user]);

  ////////////////////////////////////////////////////////////////////////////
  // 🔥 Fonction universelle pour parser un JSONB (string OU object)
  ////////////////////////////////////////////////////////////////////////////
  const parseVariant = (variant: any): any => {
    if (!variant) return {};

    // Si c’est déjà un objet → OK
    if (typeof variant === "object") return variant;

    // Si Supabase renvoie une string JSON, on la parse
    try {
      return JSON.parse(variant);
    } catch {
      return {};
    }
  };

  ////////////////////////////////////////////////////////////////////////////
  // 🔥 Convertir variante → texte
  ////////////////////////////////////////////////////////////////////////////
  const formatVariant = (variantJson: any): string => {
    const v = parseVariant(variantJson);

    const size = v.size ?? "-";
    const color = v.color ?? "-";

    return `${size} / ${color}`;
  };

  ////////////////////////////////////////////////////////////////////////////
  // 🔥 Récupération des commandes
  ////////////////////////////////////////////////////////////////////////////
  const fetchOrders = async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      const sellerItems = await getOrderItemsBySeller(user.id);

      // Map ordre → items
      const ordersMap: Record<string, ExtendedOrderItem[]> = {};

      sellerItems.forEach((item: any) => {
        if (!ordersMap[item.order_id]) ordersMap[item.order_id] = [];

        ordersMap[item.order_id].push({
          id: item.id,
          productId: item.product_id,
          sellerId: item.seller_id,
          orderId: item.order_id,
          quantity: item.quantity,
          price: item.price,
          imageUrl: item.image_url ?? '',
          title: item.title || 'Produit',

          // 👉 converti proprement en texte
          selectedVariant: formatVariant(item.selected_variant),
        });
      });

      // Construire chaque commande
      const ordersWithItems: OrderWithItems[] = Object.entries(ordersMap).map(
        ([orderId, items]) => {
          const info = sellerItems.find(i => i.order_id === orderId);

          return {
            id: orderId,
            userId: info?.user_id ?? '',
            createdAt: info?.created_at ?? '',
            customerName: info?.customer_name ?? '',
            customerPhone: info?.customer_phone ?? '',
            customerAddress: info?.customer_address ?? '',
            total: items.reduce((sum, it) => sum + it.price * it.quantity, 0),
            orderItems: items,
          };
        }
      );

      ordersWithItems.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setOrders(ordersWithItems);

    } catch (err) {
      console.error("❌ Erreur chargement commandes :", err);
    } finally {
      setLoading(false);
    }
  };

  ////////////////////////////////////////////////////////////////////////////
  // 🔥 Suppression
  ////////////////////////////////////////////////////////////////////////////
  const openDeleteModal = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedOrderId) return;

    setLoading(true);
    try {
      await supabase.from("order_items").delete().eq("order_id", selectedOrderId);
      await supabase.from("orders").delete().eq("id", selectedOrderId);

      setOrders(prev => prev.filter(o => o.id !== selectedOrderId));
    } catch (err) {
      console.error("❌ Erreur suppression :", err);
    } finally {
      setLoading(false);
      setSelectedOrderId(null);
      setShowDeleteModal(false);
    }
  };

  ////////////////////////////////////////////////////////////////////////////
  // 🔥 Impression (variante incluse)
  ////////////////////////////////////////////////////////////////////////////
  const printSingleOrder = (order: OrderWithItems) => {
    const html = `
      <div style="font-family: Arial; padding: 20px;">
        <h2>Commande #${order.id}</h2>
        <p>Date : ${new Date(order.createdAt).toLocaleString('fr-FR')}</p>
        <p>Nom : ${order.customerName}</p>
        <p>Téléphone : ${order.customerPhone}</p>
        <p>Adresse : ${order.customerAddress}</p>
        <hr />
        ${order.orderItems.map(i => `
          <p>${i.title} — ${i.quantity} × ${i.price} FCFA
          ${i.selectedVariant ? ` (Variante: ${i.selectedVariant})` : ""}
          </p>
        `).join('')}
        <hr />
        <p><strong>Total: ${order.total} FCFA</strong></p>
      </div>
    `;

    const w = window.open("");
    if (w) {
      w.document.write(html);
      w.print();
    }
  };

  ////////////////////////////////////////////////////////////////////////////
  // 🔥 Groupement commandes
  ////////////////////////////////////////////////////////////////////////////
  const isToday = (d: string) => new Date(d).toDateString() === new Date().toDateString();
  const isThisWeek = (d: string) => {
    const date = new Date(d);
    const now = new Date();
    const start = new Date(now.setDate(now.getDate() - now.getDay()));
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return date >= start && date <= end;
  };
  const isThisMonth = (d: string) => {
    const date = new Date(d);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  };
  const isThisYear = (d: string) => new Date(d).getFullYear() === new Date().getFullYear();

  const groups: Record<string, OrderWithItems[]> = {
    today: [],
    thisWeek: [],
    thisMonth: [],
    thisYear: [],
    older: [],
  };

  orders.forEach(o => {
    if (isToday(o.createdAt)) groups.today.push(o);
    else if (isThisWeek(o.createdAt)) groups.thisWeek.push(o);
    else if (isThisMonth(o.createdAt)) groups.thisMonth.push(o);
    else if (isThisYear(o.createdAt)) groups.thisYear.push(o);
    else groups.older.push(o);
  });

  const colors = {
    today: "border-red-400 bg-red-50",
    thisWeek: "border-blue-400 bg-blue-50",
    thisMonth: "border-yellow-400 bg-yellow-50",
    thisYear: "border-green-400 bg-green-50",
    older: "border-gray-300 bg-gray-50",
  };

  ////////////////////////////////////////////////////////////////////////////
  // 🔥 Rendu des groupes
  ////////////////////////////////////////////////////////////////////////////
  const renderGroup = (label: string, key: keyof typeof colors) => {
    const list = groups[key];
    if (list.length === 0) return null;

    return (
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">
          {label} ({list.length})
        </h2>

        <ul className="space-y-6">
          {list.map(order => (
            <li key={order.id} className={`border p-4 rounded shadow-sm ${colors[key]}`}>
              <div className="flex justify-between items-center">
                <p className="font-semibold">Commande #{order.id}</p>

                <div className="flex gap-2">
                  <button
                    onClick={() => printSingleOrder(order)}
                    className="text-gray-600 flex items-center gap-1"
                  >
                    <Printer size={16} /> Imprimer
                  </button>

                  <button
                    onClick={() => openDeleteModal(order.id)}
                    className="text-red-600 flex items-center gap-1"
                  >
                    <Trash2 size={16} /> Supprimer
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                Passée le {new Date(order.createdAt).toLocaleString("fr-FR")}
              </p>

              <div className="mt-2 text-sm">
                <p><strong>Nom :</strong> {order.customerName}</p>
                <p><strong>Téléphone :</strong> {order.customerPhone}</p>
                <p><strong>Adresse :</strong> {order.customerAddress}</p>
              </div>

              <div className="mt-3 space-y-2">
                {order.orderItems.map(item => (
                  <div key={item.id} className="flex gap-3">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}

                    <div>
                      <p className="font-medium">{item.title}</p>

                      {item.selectedVariant && (
                        <p className="text-xs text-gray-500">
                          Variante : {item.selectedVariant}
                        </p>
                      )}

                      <p className="text-sm text-gray-600">
                        {item.quantity} × {item.price} FCFA = {item.quantity * item.price} FCFA
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-3 text-right font-bold text-green-700">
                Total : {order.total} FCFA
              </p>
            </li>
          ))}
        </ul>
      </section>
    );
  };

  return (
    <Layout>
      <div className="container-custom py-10">
        <h1 className="text-2xl font-bold mb-6">Mes commandes</h1>

        {loading ? (
          <p>Chargement des commandes...</p>
        ) : orders.length === 0 ? (
          <p>Aucune commande trouvée.</p>
        ) : (
          <>
            {renderGroup("Commandes du jour", "today")}
            {renderGroup("Commandes de la semaine", "thisWeek")}
            {renderGroup("Commandes du mois", "thisMonth")}
            {renderGroup("Commandes de l'année", "thisYear")}
            {renderGroup("Commandes plus anciennes", "older")}
          </>
        )}

        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="text-red-600" size={24} />
                <h3 className="text-lg font-semibold">Supprimer la commande ?</h3>
              </div>

              <p className="text-gray-600 mb-6">
                Cette action est définitive.
              </p>

              <div className="flex justify-end gap-3">
                <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2">
                  Annuler
                </button>

                <button onClick={confirmDelete} className="btn bg-red-600 text-white">
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyOrdersPage;
