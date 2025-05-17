import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../utils/formatters';
import { CreditCard, Truck, Shield, ChevronRight } from 'lucide-react';
import { saveOrder } from '../../utils/orderService';
import { v4 as uuidv4 } from 'uuid';

const CheckoutForm: React.FC = () => {
  const { cartItems, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'wav' | 'cash_on_delivery'>('wav');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    const order = {
      id: uuidv4(),
      userId: user?.id || 'guest-' + Date.now(),
      createdAt: new Date().toISOString(),
      total,
      items: cartItems.map((item) => ({
        productId: item.product.id,
        title: item.product.title,
        price: item.product.price,
        quantity: item.quantity,
        sellerId: item.product.sellerId,
        isProcessed: false,  
        status: 'En attente', // Statut pour chaque élément de la commande
      })),
      customerName: name,
      customerPhone: phone,
      customerAddress: address,
      additionalInfo,
      paymentMethod,
      email,
      status: 'En attente', // Statut global pour la commande
    };
    

    saveOrder(order);
    clearCart();
    navigate('/order-success');
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Informations client */}
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
              <label className="label">Numéro de téléphone</label>
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
          <h3 className="text-lg font-semibold mb-4">Mode de paiement</h3>
          <div className="space-y-4">
            <div
              className={`border rounded-md p-4 cursor-pointer ${
                paymentMethod === 'wav' ? 'border-primary bg-primary-light/10' : 'border-gray-300'
              }`}
              onClick={() => setPaymentMethod('wav')}
            >
              <div className="flex items-center">
                <div className={`h-5 w-5 rounded-full border ${
                  paymentMethod === 'wav' ? 'border-primary' : 'border-gray-400'
                }`}>
                  {paymentMethod === 'wav' && (
                    <div className="h-3 w-3 rounded-full bg-primary m-0.5"></div>
                  )}
                </div>
                <div className="ml-3 flex items-center">
                  <CreditCard className="h-5 w-5 text-primary mr-2" />
                  <span className="font-medium">Payer avec WAV</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2 ml-8">
                Payez en toute sécurité avec votre compte WAV.
              </p>
            </div>

            <div
              className={`border rounded-md p-4 cursor-pointer ${
                paymentMethod === 'cash_on_delivery' ? 'border-primary bg-primary-light/10' : 'border-gray-300'
              }`}
              onClick={() => setPaymentMethod('cash_on_delivery')}
            >
              <div className="flex items-center">
                <div className={`h-5 w-5 rounded-full border ${
                  paymentMethod === 'cash_on_delivery' ? 'border-primary' : 'border-gray-400'
                }`}>
                  {paymentMethod === 'cash_on_delivery' && (
                    <div className="h-3 w-3 rounded-full bg-primary m-0.5"></div>
                  )}
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
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Récapitulatif de la commande</h3>
            <div className="bg-gray-50 rounded-md p-4">
              <div className="space-y-2 mb-4">
                {cartItems.map((item) => (
                  <div key={item.product.id} className="flex justify-between">
                    <span className="text-gray-600">
                      {item.product.title} ({item.quantity})
                    </span>
                    <span className="font-medium">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-300 pt-3 mt-3">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-lg">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-600 mt-4">
              <Shield className="h-4 w-4 mr-2 text-primary" />
              <span>Toutes les transactions sont sécurisées et chiffrées</span>
            </div>
          </div>
        </div>
      </div>

      <div className="text-right">
      <button
  type="submit"
  disabled={isSubmitting}
  className={`w-full flex items-center justify-center px-6 py-3 rounded-2xl font-semibold text-white transition duration-300 shadow ${
    isSubmitting
      ? 'bg-gray-400 cursor-not-allowed'
      : 'bg-primary hover:bg-primary-dark'
  }`}
>
  {isSubmitting ? 'Traitement en cours...' : 'Confirmer la commande'}
  {!isSubmitting && <ChevronRight className="ml-2 h-5 w-5" />}
</button>

      </div>
    </form>
  );
};

export default CheckoutForm;
