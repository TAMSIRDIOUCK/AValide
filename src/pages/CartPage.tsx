import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import CartItem from '../components/cart/CartItem';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatters';
import { ShoppingCart, ArrowRight, ShoppingBag } from 'lucide-react';

const CartPage: React.FC = () => {
  const { items: cartItems, clearCart } = useCart();

  const total = cartItems.reduce((acc, item) => {
    return acc + item.product.price * item.quantity;
  }, 0);

  return (
    <Layout>
      <div className="container-custom py-16">
        <div className="flex items-center mb-8">
          <ShoppingCart size={24} className="text-primary mr-3" />
          <h1 className="text-2xl font-bold">Mon Panier</h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-gray-100 rounded-full">
              <ShoppingBag size={32} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Votre panier est vide</h2>
            <p className="text-gray-600 mb-6">
              Parcourez notre catalogue et ajoutez des produits à votre panier.
            </p>
            <Link
              to="/products"
              className="inline-block bg-primary text-white font-semibold px-6 py-2.5 rounded-2xl shadow-md hover:bg-primary-dark transition"
            >
              Commencer vos achats
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="border-b pb-4 mb-4 flex justify-between items-center">
                  <h2 className="text-lg font-semibold">
                    Articles ({cartItems.length})
                  </h2>
                  <button
                    onClick={clearCart}
                    className="text-sm text-red-600 hover:text-red-700 font-medium hover:underline transition"
                  >
                    Vider le panier
                  </button>
                </div>

                <div>
                  {cartItems.map((item) => (
                    <CartItem item={item} key={item.product.id} />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h2 className="text-lg font-semibold border-b pb-4 mb-4">Récapitulatif</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sous-total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Frais de livraison</span>
                    <span>Calculé à la prochaine étape</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between font-semibold mb-6">
                    <span>Total</span>
                    <span className="text-xl">{formatPrice(total)}</span>
                  </div>

                  <Link
                    to="/checkout"
                    className="w-full inline-flex items-center justify-center bg-primary text-white font-semibold px-6 py-2.5 rounded-2xl shadow-md hover:bg-primary-dark transition"
                  >
                    Commander <ArrowRight size={18} className="ml-2" />
                  </Link>

                  <Link
                    to="/products"
                    className="mt-4 block text-center text-primary hover:underline transition"
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
