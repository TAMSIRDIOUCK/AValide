// src/components/checkout/CheckoutForm.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../utils/formatters';
import { Truck } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../lib/supabaseClient';
import { AnimatePresence } from 'framer-motion';
import OrderConfirmation from '../../components/OrderConfirmation';

const CheckoutForm: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, total, clearCart } = useCart();
  const { user } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-lg mb-4">Votre panier est vide</p>
        <button onClick={() => navigate('/products')} className="btn-primary">
          Parcourir les produits
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const orderId = uuidv4();
      const orderDate = new Date().toISOString();

      // ✅ 1. Enregistrement dans orders
      const { error: orderError } = await supabase.from('orders').insert([
        {
          id: orderId,
          user_id: user?.id || null,
          total,
          payment_method: 'cash_on_delivery',
          customer_name: name,
          customer_phone: phone,
          customer_address: address,
          customer_email: email || null,
          additional_info: additionalInfo,
          created_at: orderDate,
          status: 'en_attente',
        },
      ]);

      if (orderError) throw new Error(`Erreur insertion commande : ${orderError.message}`);

      // ✅ 2. Enregistrement des articles
      const orderItems = cartItems.map((item) => {
        const imageUrl = Array.isArray(item.product.images) && item.product.images.length > 0
          ? item.product.images[0]
          : null;

        return {
          id: uuidv4(),
          order_id: orderId,
          product_id: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
          seller_id: item.product.sellerId,
          image_url: imageUrl,
          created_at: orderDate,
          title: item.product.title,
          customer_name: name,
          customer_phone: phone,
          customer_address: address,
          status: 'en_attente',
        };
      });

      const { error: itemError } = await supabase.from('order_items').insert(orderItems);
      if (itemError) throw new Error(`Erreur insertion articles : ${itemError.message}`);

      // ✅ 3. Marqueur de commande réussie pour l'affichage du message dans le header
      localStorage.setItem('lastOrderTime', Date.now().toString());

      // ✅ Confirmation
      setShowConfirmation(true);
      setTimeout(() => {
        setShowConfirmation(false);
        clearCart();
        navigate('/mes-commandes');
      }, 3000);
    } catch (error: any) {
      console.error('💥 Erreur pendant la commande :', error);
      alert(error.message || 'Une erreur est survenue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AnimatePresence>{showConfirmation && <OrderConfirmation />}</AnimatePresence>

      {!showConfirmation && (
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-2 gap-8">
            {/* Infos client */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Informations de livraison</h3>
              <div className="space-y-4">
                <div>
                  <label className="label">Nom complet</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Email (facultatif)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Téléphone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Adresse de livraison</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="input min-h-[80px]"
                    required
                  />
                </div>
                <div>
                  <label className="label">Informations supplémentaires</label>
                  <textarea
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    className="input min-h-[80px]"
                  />
                </div>
              </div>
            </div>

            {/* Paiement et résumé */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Paiement</h3>
              <div className="border rounded-md p-4 bg-primary-light/10 border-primary">
                <div className="flex items-center">
                  <div className="h-5 w-5 rounded-full border border-primary">
                    <div className="h-3 w-3 rounded-full bg-primary m-0.5" />
                  </div>
                  <div className="ml-3 flex items-center">
                    <Truck className="h-5 w-5 text-primary mr-2" />
                    <span className="font-medium">Paiement à la livraison</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2 ml-8">
                  Payez en espèces à la réception de votre commande.
                </p>
              </div>

              <div className="mt-8 space-y-4">
                <h3 className="text-lg font-semibold mb-2">Résumé de la commande</h3>
                {cartItems.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span>{item.quantity} × {item.product.title}</span>
                    <span>{formatPrice(item.product.price * item.quantity)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-semibold border-t pt-2">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <div className="mt-6">
                <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Validation en cours...' : 'Passer la commande'}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </>
  );
};

export default CheckoutForm;
