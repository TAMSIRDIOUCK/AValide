import React, { useEffect } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import CheckoutForm from '../components/checkout/CheckoutForm';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CreditCard } from 'lucide-react';

const CheckoutPage: React.FC = () => {
  const { cartItems } = useCart(); // anciennement "items" → doit être "cartItems"
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Ajout d'une vérification pour afficher un message si le panier est vide
  if (!cartItems || cartItems.length === 0) {
    return (
      <Layout>
        <div className="container-custom py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Votre panier est vide</h1>
          <p className="text-gray-600 mb-6">Ajoutez des articles à votre panier pour finaliser votre commande.</p>
          <Link
            to="/products"
            className="inline-block bg-primary text-white font-semibold px-6 py-2.5 rounded-2xl shadow-md hover:bg-primary-dark transition"
          >
            Parcourir les produits
          </Link>
        </div>
      </Layout>
    );
  }

  // Gestion utilisateur non connecté
  if (!isAuthenticated) {
    console.error("Erreur : utilisateur non connecté. Redirection vers /login.");
    return <Navigate to={`/login?redirect=${location.pathname}`} replace />;
  }

  // Ajout d'un effet pour faire défiler la page vers le haut lors du chargement
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Layout>
      <div className="container-custom py-16">
        {/* Titre de page */}
        <div className="flex items-center mb-8">
          <CreditCard size={24} className="text-primary mr-3" />
          <h1 className="text-2xl font-bold">Finaliser la commande</h1>
        </div>

        {/* Boîte principale */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          {/* Barre d'étapes */}
          <div className="mb-10">
            <div className="flex items-center justify-between">
              {/* Étape 1 : Panier */}
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold shadow">
                  1
                </div>
                <span className="ml-2 font-medium text-primary">Panier</span>
              </div>
              <div className="flex-1 border-t-2 border-primary mx-2" />

              {/* Étape 2 : Paiement */}
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold shadow">
                  2
                </div>
                <span className="ml-2 font-medium text-primary">Paiement</span>
              </div>
              <div className="flex-1 border-t-2 border-gray-300 mx-2" />

              {/* Étape 3 : Confirmation */}
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-500 flex items-center justify-center font-semibold">
                  3
                </div>
                <span className="ml-2 font-medium text-gray-500">Confirmation</span>
              </div>
            </div>
          </div>

          {/* Formulaire de commande */}
          <CheckoutForm />
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage;
