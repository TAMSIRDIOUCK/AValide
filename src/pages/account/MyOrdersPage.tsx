import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../context/AuthContext';
import { getOrdersByUser, Order } from '../../utils/orderService';

const MyOrdersPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (user?.id) {
      const storedOrders = localStorage.getItem('orders');
      let userOrders = getOrdersByUser(user.id);

      if (storedOrders) {
        const parsed = JSON.parse(storedOrders) as Order[];
        userOrders = parsed.filter(order => order.userId === user.id || order.items.some(item => item.sellerId === user.id));
      }

      const sorted = userOrders.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setOrders(sorted);
    }
  }, [user]);

  // Fonction pour valider une commande
  const handleValidateOrder = (orderId: string) => {
    const updatedOrders = orders.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          status: 'Validée', // Change le statut de la commande
        };
      }
      return order;
    });

    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
  };

  // Fonction pour rejeter une commande
  const handleRejectOrder = (orderId: string) => {
    const updatedOrders = orders.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          status: 'Rejetée', // Change le statut de la commande
        };
      }
      return order;
    });

    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
  };

  return (
    <Layout>
      <div className="container-custom py-10">
        <h1 className="text-2xl font-bold mb-6">Mes commandes</h1>

        {orders.length === 0 ? (
          <p className="text-gray-600">Aucune commande trouvée.</p>
        ) : (
          <ul className="space-y-4">
            {orders.map(order => {
              const sellerItems = order.items.filter(item => item.sellerId === user?.id);

              return (
                <li key={order.id} className="border p-4 rounded-lg">
                  <p className="font-semibold">Commande #{order.id}</p>
                  <p className="text-sm text-gray-500">Passée le {new Date(order.createdAt).toLocaleDateString()}</p>

                  <div className="mt-2 text-sm text-gray-700">
                    <p><strong>Client :</strong> {order.customerName}</p>
                    <p><strong>Téléphone :</strong> {order.customerPhone}</p>
                    <p><strong>Adresse :</strong> {order.customerAddress}</p>
                  </div>

                  <ul className="mt-4">
                    {order.items.map(item => (
                      <li key={item.productId} className="text-sm text-gray-700">
                        {item.title} - {item.quantity} × {item.price} FCFA
                      </li>
                    ))}
                  </ul>

                  <p className="mt-2 font-medium">Total : {order.total} FCFA</p>

                  {/* Affiche les boutons pour valider ou rejeter la commande */}
                  <div className="mt-4">
                    {order.status === 'Validée' ? (
                      <span className="text-green-600 font-semibold">✔ Commande validée</span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleValidateOrder(order.id)}
                          className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700 mr-2"
                        >
                          Valider la commande
                        </button>
                       
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Layout>
  );
};

export default MyOrdersPage;
