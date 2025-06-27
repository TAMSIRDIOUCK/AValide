// src/components/OrderConfirmation.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ShoppingBag } from 'lucide-react';

const OrderConfirmation: React.FC = () => {
  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-xl shadow-2xl p-8 w-[90%] max-w-lg text-center font-sans"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
      >
        {/* Logo / Icon custom AValide */}
        <div className="mx-auto mb-5 flex items-center justify-center space-x-2">
          <ShoppingBag className="w-12 h-12 text-yellow-600" />
          <h1 className="text-3xl font-bold text-yellow-700 tracking-wide select-none">
            AValide
          </h1>
        </div>

        {/* Confirmation Icon */}
        <CheckCircle className="text-green-600 mx-auto w-20 h-20 mb-6" />

        <h2 className="text-2xl font-extrabold mb-3 text-gray-800">
          Commande confirmée !
        </h2>

        <p className="text-gray-700 mb-4 leading-relaxed px-4">
          Un grand merci pour votre achat chez <span className="font-semibold text-yellow-700">AValide</span>.<br />
          Votre commande est bien reçue et sera traitée rapidement.
        </p>

        <p className="text-sm text-gray-500 mb-6">
          Vous serez contacté sous peu pour les détails de la livraison.
        </p>

        <p className="text-xs text-gray-400 italic">
          Redirection automatique vers vos commandes en cours…
        </p>
      </motion.div>
    </motion.div>
  );
};

export default OrderConfirmation;
