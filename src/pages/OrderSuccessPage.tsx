import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { CheckCircle, ShoppingBag, Home } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface OrderItem {
  id: number;
  product_id: string;
  title: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_email?: string;
  payment_method: string;
  status: string;
  order_items: OrderItem[];
}

const OrderSuccessPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', orderId)
        .single();

      if (error) {
        console.error('❌ Erreur lors de la récupération de la commande :', error);
      } else {
        setOrder(data);
      }
      setLoading(false);
    }

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const calculateTotal = () => {
    if (!order) return 0;
    return order.order_items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container-custom py-16 text-center">
          <p className="text-gray-600">Chargement de votre commande...</p>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="container-custom py-16 text-center">
          <p className="text-gray-600">Aucune commande trouvée.</p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-primary text-white rounded-2xl font-semibold hover:bg-primary-dark transition"
          >
            Retour à l'accueil
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-custom py-16">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-md p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-green-100 rounded-full">
            <CheckCircle size={40} className="text-green-500" />
          </div>

          <h1 className="text-2xl font-bold mb-2">Commande confirmée !</h1>
          <p className="text-gray-600 mb-6">
            Merci pour votre commande, elle a été enregistrée avec succès.
          </p>

          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h2 className="font-semibold mb-4">Détails de la commande</h2>
            <p><strong>Numéro :</strong> {order.id}</p>
            <p><strong>Date :</strong> {new Date(order.created_at).toLocaleDateString('fr-SN')}</p>
            <p><strong>Total :</strong> {calculateTotal()} FCFA</p>

            <h3 className="font-semibold mt-6 mb-2">Produits</h3>
            <ul className="text-sm text-gray-700 list-disc pl-5">
              {order.order_items.map((item) => (
                <li key={item.id}>
                  {item.title} – {item.quantity} × {item.price} FCFA
                </li>
              ))}
            </ul>

            <h3 className="font-semibold mt-6 mb-2">Livraison</h3>
            <p><strong>Nom :</strong> {order.customer_name}</p>
            <p><strong>Téléphone :</strong> {order.customer_phone}</p>
            <p><strong>Adresse :</strong> {order.customer_address}</p>

            <p className="mt-2 text-gray-600">
              Vous recevrez un SMS lorsque votre commande sera en route.
            </p>
            <p className="text-gray-600">Livraison estimée : 1–3 jours ouvrables.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/orders"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-2xl font-semibold hover:bg-primary-dark transition"
            >
              <ShoppingBag size={18} className="mr-2" />
              Voir mes commandes
            </Link>
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-800 rounded-2xl font-semibold hover:bg-gray-200 transition"
            >
              <Home size={18} className="mr-2" />
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderSuccessPage;
