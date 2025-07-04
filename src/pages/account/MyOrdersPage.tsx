import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../context/AuthContext';
import { getOrderItemsBySeller } from '../../utils/orderService';
import { supabase } from '../../lib/supabaseClient';
import { AlertCircle, Trash2, PhoneCall, MessageCircle, MessageSquare, Printer } from 'lucide-react';

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      const sellerItems = await getOrderItemsBySeller(user.id);
      const ordersMap: Record<string, ExtendedOrderItem[]> = {};

      sellerItems.forEach((item: any) => {
        if (!ordersMap[item.order_id]) {
          ordersMap[item.order_id] = [];
        }
        ordersMap[item.order_id].push({
          id: item.id,
          productId: item.product_id,
          sellerId: item.seller_id,
          orderId: item.order_id,
          quantity: item.quantity,
          price: item.price,
          imageUrl: item.image_url ?? '',
          title: item.title || 'Produit',
        });
      });

      const ordersWithItems: OrderWithItems[] = Object.entries(ordersMap).map(
        ([orderId, items]) => {
          const anyItem = sellerItems.find((i: any) => i.order_id === orderId);
          const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

          return {
            id: orderId,
            userId: anyItem?.user_id ?? '',
            createdAt: anyItem?.created_at ?? '',
            customerName: anyItem?.customer_name ?? '',
            customerPhone: anyItem?.customer_phone ?? '',
            customerAddress: anyItem?.customer_address ?? '',
            total,
            orderItems: items,
          };
        }
      );

      ordersWithItems.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setOrders(ordersWithItems);
    } catch (err) {
      console.error('\u274C Erreur chargement commandes :', err);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedOrderId) return;
    setLoading(true);

    try {
      const { error: itemsError } = await supabase.from('order_items').delete().eq('order_id', selectedOrderId);
      const { error: orderError } = await supabase.from('orders').delete().eq('id', selectedOrderId);

      if (itemsError || orderError) {
        console.error('\u274C Erreur lors de la suppression :', itemsError || orderError);
        alert('Erreur lors de la suppression.');
      } else {
        setOrders((prev) => prev.filter((o) => o.id !== selectedOrderId));
      }
    } catch (error) {
      console.error('\u274C Erreur suppression commande :', error);
      alert('Erreur lors de la suppression.');
    } finally {
      setShowDeleteModal(false);
      setSelectedOrderId(null);
      setLoading(false);
    }
  };

  const printSingleOrder = (order: OrderWithItems) => {
    const printContent = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h2>Commande #${order.id}</h2>
        <p><strong>Date :</strong> ${new Date(order.createdAt).toLocaleString('fr-FR')}</p>
        <p><strong>Nom :</strong> ${order.customerName}</p>
        <p><strong>Téléphone :</strong> ${order.customerPhone}</p>
        <p><strong>Adresse :</strong> ${order.customerAddress}</p>
        <hr />
        ${order.orderItems.map(item => `
          <p>${item.title} - ${item.quantity} × ${item.price} FCFA = ${item.quantity * item.price} FCFA</p>
        `).join('')}
        <hr />
        <p><strong>Total :</strong> ${order.total} FCFA</p>
      </div>
    `;

    const newWindow = window.open('', '', 'width=800,height=600');
    if (newWindow) {
      newWindow.document.write('<html><head><title>Impression Commande</title></head><body>');
      newWindow.document.write(printContent);
      newWindow.document.write('</body></html>');
      newWindow.document.close();
      newWindow.focus();
      newWindow.print();
    }
  };

  const isToday = (dateStr: string) => new Date(dateStr).toDateString() === new Date().toDateString();
  const isThisWeek = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return date >= start && date <= end;
  };
  const isThisMonth = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  };
  const isThisYear = (dateStr: string) => new Date(dateStr).getFullYear() === new Date().getFullYear();

  const groupedOrders = {
    today: [] as OrderWithItems[],
    thisWeek: [] as OrderWithItems[],
    thisMonth: [] as OrderWithItems[],
    thisYear: [] as OrderWithItems[],
    older: [] as OrderWithItems[],
  };

  orders.forEach((order) => {
    if (isToday(order.createdAt)) groupedOrders.today.push(order);
    else if (isThisWeek(order.createdAt)) groupedOrders.thisWeek.push(order);
    else if (isThisMonth(order.createdAt)) groupedOrders.thisMonth.push(order);
    else if (isThisYear(order.createdAt)) groupedOrders.thisYear.push(order);
    else groupedOrders.older.push(order);
  });

  const periodColors = {
    today: 'border-red-400 bg-red-50',
    thisWeek: 'border-blue-400 bg-blue-50',
    thisMonth: 'border-yellow-400 bg-yellow-50',
    thisYear: 'border-green-400 bg-green-50',
    older: 'border-gray-300 bg-gray-50',
  };

  const renderGroup = (title: string, items: OrderWithItems[], key: keyof typeof periodColors) => {
    if (items.length === 0) return null;

    return (
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">{title} ({items.length})</h2>
        <ul className="space-y-6">
          {items.map((order) => (
            <li key={order.id} className={`border p-4 rounded shadow-sm ${periodColors[key]}`}>
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold">Commande #{order.id}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => printSingleOrder(order)}
                    className="text-gray-600 hover:text-black text-sm font-semibold flex items-center gap-1"
                  >
                    <Printer size={16} />
                    Imprimer
                  </button>
                  <button
                    onClick={() => openDeleteModal(order.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-semibold flex items-center gap-1"
                    disabled={loading}
                  >
                    <Trash2 size={16} />
                    Supprimer
                  </button>
                </div>
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
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-12 h-12 object-cover rounded border"
                      />
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
          <p>Chargement des commandes...</p>
        ) : orders.length === 0 ? (
          <p>Aucune commande trouvée.</p>
        ) : (
          <>
            {renderGroup('Commandes du jour', groupedOrders.today, 'today')}
            {renderGroup('Commandes de la semaine', groupedOrders.thisWeek, 'thisWeek')}
            {renderGroup('Commandes du mois', groupedOrders.thisMonth, 'thisMonth')}
            {renderGroup("Commandes de l'année", groupedOrders.thisYear, 'thisYear')}
            {renderGroup('Commandes plus anciennes', groupedOrders.older, 'older')}
          </>
        )}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-lg">
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
