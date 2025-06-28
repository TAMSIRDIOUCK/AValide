import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import {
  AlertCircle, Trash2, PhoneCall, MessageCircle, MessageSquare,
} from 'lucide-react';

interface ExtendedOrderItem {
  id: string;
  productId: string;
  sellerId: string;
  orderId: string;
  quantity: number;
  price: number;
  imageUrl?: string;
  title: string;
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
    window.scrollTo(0, 0);
    if (user?.id) fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);

    try {
      const { data: sellerItems, error: errItems } = await supabase
        .from('order_items')
        .select('*')
        .eq('seller_id', user?.id)
        .eq('is_deleted', false);

      if (errItems || !sellerItems) throw errItems;

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
          imageUrl: item.image_url || '',
          title: item.title || 'Produit',
        });
      });

      const orderIds = Object.keys(ordersMap);
      if (orderIds.length === 0) {
        setOrders([]);
        return;
      }

      const { data: ordersData, error: errOrders } = await supabase
        .from('orders')
        .select('*')
        .in('id', orderIds)
        .eq('is_deleted', false);

      if (errOrders || !ordersData) throw errOrders;

      const fullOrders = ordersData.map((order: any) => {
        const items = ordersMap[order.id] || [];
        const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        return {
          id: order.id,
          userId: order.user_id,
          createdAt: order.created_at,
          customerName: order.customer_name,
          customerPhone: order.customer_phone,
          customerAddress: order.customer_address,
          total,
          orderItems: items,
        };
      });

      fullOrders.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setOrders(fullOrders);
    } catch (error) {
      console.error('Erreur chargement commandes :', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedOrderId) return;
    setLoading(true);

    try {
      await supabase.from('order_items').update({ is_deleted: true }).eq('order_id', selectedOrderId);
      await supabase.from('orders').update({ is_deleted: true }).eq('id', selectedOrderId);
      setOrders((prev) => prev.filter((order) => order.id !== selectedOrderId));
    } catch (error) {
      alert('Erreur lors de la suppression.');
      console.error('Erreur suppression commande :', error);
    } finally {
      setShowDeleteModal(false);
      setSelectedOrderId(null);
      setLoading(false);
    }
  };

  const groupByDate = {
    today: [] as OrderWithItems[],
    thisWeek: [] as OrderWithItems[],
    thisMonth: [] as OrderWithItems[],
    thisYear: [] as OrderWithItems[],
    older: [] as OrderWithItems[],
  };

  const isToday = (d: string) => new Date(d).toDateString() === new Date().toDateString();
  const isThisWeek = (d: string) => {
    const date = new Date(d);
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return date >= start && date <= end;
  };
  const isThisMonth = (d: string) => {
    const date = new Date(d);
    const now = new Date();
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  };
  const isThisYear = (d: string) => new Date(d).getFullYear() === new Date().getFullYear();

  orders.forEach((order) => {
    if (isToday(order.createdAt)) groupByDate.today.push(order);
    else if (isThisWeek(order.createdAt)) groupByDate.thisWeek.push(order);
    else if (isThisMonth(order.createdAt)) groupByDate.thisMonth.push(order);
    else if (isThisYear(order.createdAt)) groupByDate.thisYear.push(order);
    else groupByDate.older.push(order);
  });

  const renderGroup = (label: string, items: OrderWithItems[], color: string) => {
    if (items.length === 0) return null;

    return (
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">{label} ({items.length})</h2>
        <ul className="space-y-6">
          {items.map((order) => (
            <li key={order.id} className={`border p-4 rounded shadow-sm ${color}`}>
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold">Commande #{order.id}</p>
                <button
                  onClick={() => {
                    setSelectedOrderId(order.id);
                    setShowDeleteModal(true);
                  }}
                  className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                  disabled={loading}
                >
                  <Trash2 size={16} />
                  Supprimer
                </button>
              </div>
              <p className="text-sm text-gray-600">
                Passée le {new Date(order.createdAt).toLocaleString('fr-FR')}
              </p>
              <div className="mt-2 text-sm">
                <p><strong>Nom :</strong> {order.customerName}</p>
                <p><strong>Téléphone :</strong> {order.customerPhone}</p>
                <p><strong>Adresse :</strong> {order.customerAddress}</p>
              </div>

              <div className="mt-2 flex flex-wrap gap-3 text-sm">
                <a
                  href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn border border-green-600 text-green-700 hover:bg-green-600 hover:text-white"
                >
                  <MessageCircle size={16} className="mr-1" />
                  WhatsApp
                </a>
                <a
                  href={`tel:${order.customerPhone}`}
                  className="btn border border-blue-600 text-blue-700 hover:bg-blue-600 hover:text-white"
                >
                  <PhoneCall size={16} className="mr-1" />
                  Appeler
                </a>
                <a
                  href={`sms:${order.customerPhone}`}
                  className="btn border border-gray-500 text-gray-700 hover:bg-gray-500 hover:text-white"
                >
                  <MessageSquare size={16} className="mr-1" />
                  SMS
                </a>
              </div>

              <ul className="mt-3 space-y-2">
                {order.orderItems.map((item) => (
                  <li key={item.id} className="flex gap-3">
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={item.title} className="w-12 h-12 object-cover rounded border" />
                    )}
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-gray-600">
                        {item.quantity} × {item.price} FCFA = {item.quantity * item.price} FCFA
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <p className="mt-3 text-right text-green-700 font-bold">
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
          <p>Chargement...</p>
        ) : orders.length === 0 ? (
          <p>Aucune commande trouvée.</p>
        ) : (
          <>
            {renderGroup('Commandes du jour', groupByDate.today, 'bg-red-50 border-red-400')}
            {renderGroup('Commandes de la semaine', groupByDate.thisWeek, 'bg-blue-50 border-blue-400')}
            {renderGroup('Commandes du mois', groupByDate.thisMonth, 'bg-yellow-50 border-yellow-400')}
            {renderGroup("Commandes de l'année", groupByDate.thisYear, 'bg-green-50 border-green-400')}
            {renderGroup('Commandes plus anciennes', groupByDate.older, 'bg-gray-50 border-gray-300')}
          </>
        )}

        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4 shadow-lg">
              <div className="flex items-center mb-4">
                <AlertCircle className="text-red-600 mr-2" size={24} />
                <h3 className="text-lg font-semibold">Supprimer cette commande ?</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Cette action supprimera la commande et tous ses articles. Elle est irréversible.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  disabled={loading}
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDelete}
                  className="btn bg-red-600 text-white hover:bg-red-700"
                  disabled={loading}
                >
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
