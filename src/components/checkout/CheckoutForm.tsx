// src/components/checkout/CheckoutForm.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/formatters';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../lib/supabaseClient';
import { AnimatePresence, motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import OrderConfirmation from '../../components/OrderConfirmation';

const CheckoutForm: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, total, clearCart } = useCart();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // ⚠️ Avalide Pay non disponible
  const handleAvalidePay = () => {
    setAlertMessage('⚠️ Avalide Pay n’est pas encore disponible. Veuillez utiliser Wave.');
    setPaymentMethod('avalide');
    setTimeout(() => setAlertMessage(null), 3000);
  };

  // ✅ Passer la commande avec Wave
  const handleWavePayment = async () => {
    if (!name || !phone || !address) {
      setAlertMessage('❌ Veuillez remplir votre nom, téléphone et adresse.');
      setTimeout(() => setAlertMessage(null), 3000);
      return;
    }

    setIsSubmitting(true);

    try {
      const orderId = uuidv4();
      const orderDate = new Date().toISOString();

      // 1️⃣ Insertion de la commande principale
      const { error: orderError } = await supabase.from('orders').insert([
        {
          id: orderId,
          user_id: null,
          total,
          payment_method: 'wave',
          customer_name: name,
          customer_phone: phone,
          customer_address: address,
          customer_email: email || null,
          additional_info: additionalInfo,
          created_at: orderDate,
          status: 'en_attente',
        },
      ]);
      if (orderError) throw new Error(orderError.message);

      // 2️⃣ Insertion des articles avec variantes
      const orderItems = cartItems.map((item) => ({
        id: uuidv4(),
        order_id: orderId,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.selectedVariant?.price ?? item.product.price,
        seller_id: item.product.sellerId,
        image_url:
          Array.isArray(item.product.images) && item.product.images.length > 0
            ? item.product.images[0]
            : null,
        created_at: orderDate,
        title: item.product.title,
        customer_name: name,
        customer_phone: phone,
        customer_address: address,
        status: 'en_attente',
        variant_size: item.selectedVariant?.size || null,
        variant_color: item.selectedVariant?.color || null,
      }));

      const { error: itemError } = await supabase.from('order_items').insert(orderItems);
      if (itemError) throw new Error(itemError.message);

      // 3️⃣ Confirmation locale
      localStorage.setItem('lastOrderId', orderId);
      localStorage.setItem('lastOrderTime', Date.now().toString());
      setShowConfirmation(true);
      clearCart();

      // 4️⃣ Redirection vers Wave
      setTimeout(() => {
        window.location.href = 'https://pay.wave.com/m/M_sn__ztPYhnBp3l5/c/sn/';
      }, 1500);
    } catch (error: any) {
      console.error('💥 Erreur pendant la commande :', error);
      setAlertMessage(`❌ ${error.message || 'Une erreur est survenue.'}`);
      setTimeout(() => setAlertMessage(null), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* 🔹 Alert */}
      <AnimatePresence>
        {alertMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-md shadow-lg z-50"
          >
            {alertMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔹 Confirmation */}
      <AnimatePresence>{showConfirmation && <OrderConfirmation />}</AnimatePresence>

      {!showConfirmation && (
        <form className="space-y-8">
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
                    className="input border border-gray-300 rounded-md p-2 w-full"
                  />
                </div>
                <div>
                  <label className="label">Email (facultatif)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input border border-gray-300 rounded-md p-2 w-full"
                  />
                </div>
                <div>
                  <label className="label">Téléphone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input border border-gray-300 rounded-md p-2 w-full"
                  />
                </div>
                <div>
                  <label className="label">Adresse</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="input border border-gray-300 rounded-md p-2 w-full min-h-[80px]"
                  />
                </div>
                <div>
                  <label className="label">Informations supplémentaires</label>
                  <textarea
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    className="input border border-gray-300 rounded-md p-2 w-full min-h-[80px]"
                  />
                </div>
              </div>
            </div>

            {/* Paiement */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Méthode de paiement</h3>
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleAvalidePay}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-md bg-gray-400 hover:bg-gray-500 text-white font-semibold transition"
                >
                  <Zap size={20} />
                  Avalide Pay (bientôt disponible)
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('wave')}
                  className={`flex items-center justify-center gap-7 w-full px-5 py-6 rounded-md bg-blue-700 hover:bg-blue-700 text-white font-semibold transition ${
                    paymentMethod === 'wave' ? 'ring-2 ring-offset-2 ring-blue-400' : ''
                  }`}
                >
                  <img src="/videos/wave.png" alt="Wave" className="w-10 h-6" />
                  Wave
                </button>
              </div>

              {paymentMethod === 'wave' && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">Résumé de la commande</h3>
                  <div className="space-y-2">
                    {cartItems.map((item) => (
                      <div key={item.cartItemId} className="flex justify-between text-sm">
                        <span>
                          {item.quantity} × {item.product.title}
                          {item.selectedVariant?.size && ` (Taille: ${item.selectedVariant.size})`}
                          {item.selectedVariant?.color && ` (Couleur: ${item.selectedVariant.color})`}
                        </span>
                        <span>
                          {formatPrice(
                            (item.selectedVariant?.price ?? item.product.price) * item.quantity
                          )}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between font-semibold border-t pt-2">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={handleWavePayment}
                      className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-md transition flex items-center justify-center gap-2"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Validation en cours...' : 'Passer la commande'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      )}
    </>
  );
};

export default CheckoutForm;
