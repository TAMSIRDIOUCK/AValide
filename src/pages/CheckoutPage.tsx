import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import CheckoutForm from '../components/checkout/CheckoutForm';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CreditCard } from 'lucide-react';

const CheckoutPage: React.FC = () => {
  const { items } = useCart();
  const { isAuthenticated } = useAuth();

  if (items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login?redirect=checkout" replace />;
  }

  return (
    <Layout>
      <div className="container-custom py-16">
        <div className="flex items-center mb-8">
          <CreditCard size={24} className="text-primary mr-3" />
          <h1 className="text-2xl font-bold">Finaliser la commande</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-8">
          <div className="mb-10">
            <div className="flex items-center justify-between">
              {/* Étape 1 */}
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold shadow">
                  1
                </div>
                <span className="ml-2 font-medium text-primary">Panier</span>
              </div>
              <div className="flex-1 border-t-2 border-primary mx-2"></div>

              {/* Étape 2 */}
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold shadow">
                  2
                </div>
                <span className="ml-2 font-medium text-primary">Paiement</span>
              </div>
              <div className="flex-1 border-t-2 border-gray-300 mx-2"></div>

              {/* Étape 3 */}
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-500 flex items-center justify-center font-semibold">
                  3
                </div>
                <span className="ml-2 font-medium text-gray-500">Confirmation</span>
              </div>
            </div>
          </div>

          <CheckoutForm />
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage;
