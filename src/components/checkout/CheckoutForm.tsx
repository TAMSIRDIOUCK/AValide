// src/components/checkout/CheckoutForm.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart, CartItem } from '../../context/CartContext';
import { formatPrice } from '../../utils/formatters';
import { v4 as uuidv4 } from 'uuid';
import { AnimatePresence, motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import OrderConfirmation from '../../components/OrderConfirmation';
import { createOrder } from '../../utils/orderService';

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
  const [paymentMethod, setPaymentMethod] = useState<'wave' | 'avalide' | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const handleAvalidePay = () => {
    setAlertMessage('⚠️ Avalide Pay n’est pas encore disponible. Veuillez utiliser Wave.');
    setPaymentMethod('avalide');
    setTimeout(() => setAlertMessage(null), 3000);
  };

  const handleWavePayment = async () => {
    if (!name || !phone || !address) {
      setAlertMessage('❌ Veuillez remplir votre nom, téléphone et adresse.');
      setTimeout(() => setAlertMessage(null), 3000);
      return;
    }

    setIsSubmitting(true);
    const orderDate = new Date().toISOString();

    try {
      // Grouper les items par vendeur
      const itemsBySeller: Record<string, CartItem[]> = cartItems.reduce((acc, item) => {
        const sellerId = item.product.sellerId;
        if (!acc[sellerId]) acc[sellerId] = [];
        acc[sellerId].push(item);
        return acc;
      }, {} as Record<string, CartItem[]>);

      // Créer une commande pour chaque vendeur
      const orderPromises = Object.entries(itemsBySeller).map(async ([sellerId, items]) => {
        const orderId = uuidv4();

        const orderData = {
          id: orderId,
          user_id: null,
          total: items.reduce((sum, i) => sum + (i.selectedVariant?.price ?? i.product.price) * i.quantity, 0),
          payment_method: 'wave',
          customer_name: name,
          customer_phone: phone,
          customer_address: address,
          customer_email: email || null,
          additional_info: additionalInfo,
          created_at: orderDate,
          status: 'en_attente',
          order_items: items.map(item => {
            const vr = item.selectedVariant;
            return {
              id: uuidv4(),
              product_id: item.product.id,
              seller_id: item.product.sellerId, // ✅ correct dans order_items
              quantity: item.quantity,
              price: vr?.price ?? item.product.price,
              title: item.product.title,
              image_url: Array.isArray(item.product.images) && item.product.images.length > 0
                ? item.product.images[0]
                : null,
              selected_variant: vr ? JSON.stringify(vr) : null,
              customer_name: name,
              customer_phone: phone,
              customer_address: address,
              created_at: orderDate,
              status: 'en_attente',
            };
          }),
        };

        return createOrder(orderData);
      });

      await Promise.all(orderPromises);

      localStorage.setItem('lastOrderTime', Date.now().toString());
      setShowConfirmation(true);
      clearCart();

      setTimeout(() => {
        window.location.href = 'https://pay.wave.com/m/M_sn__ztPYhnBp3l5/c/sn/';
      }, 1500);

    } catch (error: any) {
      setAlertMessage(`Erreur : ${error.message}`);
      setTimeout(() => setAlertMessage(null), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {alertMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-md shadow-lg z-50"
          >
            {alertMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showConfirmation && <OrderConfirmation />}
      </AnimatePresence>

      {!showConfirmation && (
        <form className="space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Informations de livraison</h3>
              <div className="space-y-4">
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Nom complet" className="input border p-2 w-full"/>
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email (facultatif)" className="input border p-2 w-full"/>
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Téléphone" className="input border p-2 w-full"/>
                <textarea value={address} onChange={e => setAddress(e.target.value)} placeholder="Adresse" className="input border p-2 w-full min-h-[80px]"/>
                <textarea value={additionalInfo} onChange={e => setAdditionalInfo(e.target.value)} placeholder="Informations supplémentaires" className="input border p-2 w-full min-h-[80px]"/>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Méthode de paiement</h3>

              <button type="button" onClick={handleAvalidePay} className="w-full px-4 py-3 bg-gray-400 text-white rounded-md flex justify-center gap-2">
                <Zap size={20} /> Avalide Pay (bientôt)
              </button>

              <button type="button" onClick={() => setPaymentMethod('wave')} className={`w-full px-5 py-6 rounded-md bg-blue-700 text-white mt-4 ${paymentMethod === 'wave' ? 'ring-2 ring-blue-400' : ''}`}>
                <img src="/videos/wave.png" className="w-10 inline-block mr-3" /> Wave
              </button>

              {paymentMethod === 'wave' && (
                <div className="mt-6 space-y-2">
                  {cartItems.map(item => (
                    <div key={item.cartItemId} className="flex justify-between text-sm">
                      <span>
                        {item.quantity} × {item.product.title}
                        {item.selectedVariant?.size && ` (Taille : ${item.selectedVariant.size})`}
                        {item.selectedVariant?.color && ` (Couleur : ${item.selectedVariant.color})`}
                      </span>
                      <span>{formatPrice((item.selectedVariant?.price ?? item.product.price) * item.quantity)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <button type="button" onClick={handleWavePayment} disabled={isSubmitting} className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-md mt-4">
                    {isSubmitting ? 'Validation...' : 'Passer la commande'}
                  </button>
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
