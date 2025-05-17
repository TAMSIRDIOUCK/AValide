import React from 'react';
import { CreditCard, ShieldCheck, Truck as TruckDelivery } from 'lucide-react';

const PaymentInfo: React.FC = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Paiement Sécurisé et Pratique</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Chez AValide, nous offrons plusieurs options de paiement pour vous permettre de choisir celle qui vous convient le mieux.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* WAV Payment */}
          <div className="p-6 bg-gray-50 rounded-lg text-center">
            <div className="mx-auto w-16 h-16 flex items-center justify-center bg-primary-light/10 rounded-full text-primary mb-4">
              <CreditCard size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-3">Paiement par WAV</h3>
            <p className="text-gray-600">
              Payez rapidement et en toute sécurité avec votre compte WAV. Une solution simple et pratique pour vos achats en ligne.
            </p>
          </div>

          {/* Cash on Delivery */}
          <div className="p-6 bg-gray-50 rounded-lg text-center">
            <div className="mx-auto w-16 h-16 flex items-center justify-center bg-primary-light/10 rounded-full text-primary mb-4">
              <TruckDelivery size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-3">Paiement à la Livraison</h3>
            <p className="text-gray-600">
              Préférez payer en espèces ? Pas de problème ! Payez uniquement lorsque vous recevez votre commande à votre domicile.
            </p>
          </div>

          {/* Secure Transactions */}
          <div className="p-6 bg-gray-50 rounded-lg text-center">
            <div className="mx-auto w-16 h-16 flex items-center justify-center bg-primary-light/10 rounded-full text-primary mb-4">
              <ShieldCheck size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-3">Transactions Sécurisées</h3>
            <p className="text-gray-600">
              Toutes vos transactions sont protégées par nos protocoles de sécurité avancés pour garantir la protection de vos données.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PaymentInfo;