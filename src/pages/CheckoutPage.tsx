// src/pages/CheckoutPage.tsx
import React from 'react';
import CheckoutForm from '../components/checkout/CheckoutForm';

const CheckoutPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-16"> {/* Changed py-8 to py-16 for more spacing */}
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
        <CheckoutForm />
      </div>
    </div>
  );
};

export default CheckoutPage;
