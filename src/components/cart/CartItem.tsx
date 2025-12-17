// src/components/cart/CartItem.tsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash, Plus, Minus } from 'lucide-react';
import { useCart, CartItem as CartContextItem } from '../../context/CartContext';
import { formatPrice } from '../../utils/formatters';

interface CartItemProps {
  item: CartContextItem;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeItem } = useCart();
  const { product, quantity, cartItemId } = item;

  if (!product) return null;

  const [localQuantity, setLocalQuantity] = useState<number>(quantity || 1);
  const price = product.price ?? 0;
  const maxStock = product.stock ?? Infinity;

  // 🔹 Sync avec contexte
  useEffect(() => {
    updateQuantity(cartItemId, localQuantity);
  }, [localQuantity]);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-b border-gray-200">
      
      {/* IMAGE + DÉTAILS */}
      <div className="flex items-center gap-4 w-full sm:w-2/5">
        <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={product.images?.[0] || '/placeholder.png'}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col gap-1 overflow-hidden">
          <span className="font-bold text-sm text-gray-800 line-clamp-1">{product.title}</span>
          <Link
            to={`/products/${product.id}`}
            className="text-sm text-gray-600 hover:text-primary line-clamp-1"
          >
            {product.description}
          </Link>
          <span className="text-primary font-semibold text-sm">{formatPrice(price)}</span>
        </div>
      </div>

      {/* QUANTITÉ + TOTAL + SUPPRESSION */}
      <div className="flex items-center gap-4 w-full sm:w-3/5">
        
        {/* QUANTITÉ */}
        <div className="flex items-center">
          <button
            onClick={() => localQuantity > 1 && setLocalQuantity(localQuantity - 1)}
            className="p-1 border border-gray-300 rounded-full hover:bg-gray-100"
          >
            <Minus size={16} />
          </button>

          <input
            type="text"
            value={localQuantity}
            onChange={(e) => {
              const n = parseInt(e.target.value);
              if (!isNaN(n) && n >= 1) setLocalQuantity(n);
            }}
            className="w-12 mx-2 text-center border border-gray-300 rounded-md p-1 text-sm"
          />

          <button
            onClick={() => localQuantity < maxStock && setLocalQuantity(localQuantity + 1)}
            className="p-1 border border-gray-300 rounded-full hover:bg-gray-100"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* PRIX TOTAL */}
        <div className="font-semibold text-sm">
          {formatPrice(price * localQuantity)}
        </div>

        {/* SUPPRIMER L'ARTICLE */}
        

      </div>
    </div>
  );
};

export default CartItem;
