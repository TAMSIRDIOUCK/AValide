// src/pages/CartPage.tsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import CartItem from '../components/cart/CartItem';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatters';
import { ShoppingCart, ArrowRight, ShoppingBag } from 'lucide-react';

const CartPage: React.FC = () => {
  const { cartItems, clearCart } = useCart();
  const total = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center mb-6">
          <ShoppingCart size={24} className="text-primary mr-3" />
          <h1 className="text-2xl font-bold">Mon Panier</h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-gray-100 rounded-full">
              <ShoppingBag size={32} className="text-gray-400" />
            </div>
            <h2 className="text-lg font-semibold mb-2">Votre panier est vide</h2>
            <p className="text-gray-600 mb-4">Parcourez notre catalogue et ajoutez des produits.</p>
            <Link
              to="/products"
              className="inline-block bg-primary text-white font-semibold px-5 py-2.5 rounded-full shadow hover:bg-primary-dark transition"
            >
              Commencer vos achats
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-2/3">
              <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                <div className="border-b pb-4 mb-4 flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Articles ({cartItems.length})</h2>
                  <button
                    onClick={clearCart}
                    className="text-sm text-red-600 hover:text-red-700 font-medium hover:underline transition"
                  >
                    Vider le panier
                  </button>
                </div>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <CartItem item={item} key={item.product.id} />
                  ))}
                </div>
              </div>
            </div>

            <div className="w-full lg:w-1/3">
              <div className="bg-white rounded-lg shadow p-4 sm:p-6 sticky top-20">
                <h2 className="text-lg font-semibold border-b pb-4 mb-4">Récapitulatif</h2>

                <div className="space-y-3 mb-6 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sous-total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Frais de livraison</span>
                    <span>Calculé à l’étape suivante</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between font-semibold mb-4 text-base">
                    <span>Total</span>
                    <span className="text-xl">{formatPrice(total)}</span>
                  </div>

                  <Link
                    to="/checkout"
                    className="w-full inline-flex items-center justify-center bg-primary text-white font-semibold px-6 py-2.5 rounded-full shadow hover:bg-primary-dark transition"
                  >
                    Commander <ArrowRight size={18} className="ml-2" />
                  </Link>

                  <Link
                    to="/products"
                    className="mt-4 block text-center text-primary hover:underline transition text-sm"
                  >
                    Continuer vos achats
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CartPage;
