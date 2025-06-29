// src/components/cart/CartItem.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Trash, Plus, Minus } from 'lucide-react';
import { CartItem as CartItemType } from '../../types';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/formatters';

interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeItem } = useCart();
  const { product, quantity } = item;
  const maxStock = product.stock ?? Infinity;

  const handleIncrement = () => {
    if (quantity < maxStock) {
      updateQuantity(product.id, quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      updateQuantity(product.id, quantity - 1);
    } else {
      removeItem(product.id);
    }
  };

  const handleRemove = () => {
    removeItem(product.id);
  };

  const imageUrl =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : '/placeholder.jpg';

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-b border-gray-200">
      {/* IMAGE + DÉTAILS PRODUIT */}
      <div className="flex items-center gap-4 w-full sm:w-2/5">
        <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
          <img src={imageUrl} alt={product.description} className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col gap-1 overflow-hidden">
          <Link
            to={`/products/${product.id}`}
            className="text-base font-semibold text-gray-800 hover:text-primary line-clamp-1"
          >
            {product.description}
          </Link>
          <span className="text-sm text-gray-500 line-clamp-1">
            Vendeur : {product.sellerName || 'Inconnu'}
          </span>
          <span className="text-primary font-semibold text-sm">
            {formatPrice(product.price)}
          </span>
        </div>
      </div>

      {/* QUANTITÉ + TOTAL + SUPPRIMER */}
      <div className="flex flex-col sm:flex-row items-center justify-between w-full sm:w-3/5 gap-4">
        {/* Contrôle de quantité */}
        <div className="flex items-center">
          <button
            onClick={handleDecrement}
            className="p-1.5 border border-gray-300 rounded-full hover:bg-gray-100"
            aria-label="Diminuer"
          >
            <Minus size={16} />
          </button>

          <input
            type="text"
            value={quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (!isNaN(val) && val > 0 && val <= maxStock) {
                updateQuantity(product.id, val);
              }
            }}
            className="w-12 mx-2 text-center border border-gray-300 rounded-md p-1"
          />

          <button
            onClick={handleIncrement}
            disabled={quantity >= maxStock}
            className={`p-1.5 border rounded-full ${
              quantity >= maxStock
                ? 'border-gray-300 text-gray-400 cursor-not-allowed bg-gray-100'
                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
            aria-label="Augmenter"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Total par ligne */}
        <div className="font-semibold text-sm sm:text-base">
          {formatPrice(product.price * quantity)}
        </div>

        {/* Bouton supprimer */}
        <button
          onClick={handleRemove}
          className="text-gray-400 hover:text-red-600 transition"
          aria-label="Supprimer"
        >
          <Trash size={18} />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
