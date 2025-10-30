// src/components/cart/CartItem.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Trash, Plus, Minus } from 'lucide-react';
import { useCart, CartItem as CartContextItem } from '../../context/CartContext';
import { ProductVariant } from '../../types/types'; // ✅ Import depuis types.ts
import { formatPrice } from '../../utils/formatters';

interface CartItemProps {
  item: CartContextItem;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeItem, updateVariant } = useCart();
  const { product, quantity, selectedVariant } = item;

  const maxStock = selectedVariant?.stock ?? product.stock ?? Infinity;

  const handleIncrement = () => {
    if (quantity < maxStock) {
      updateQuantity(product.id, quantity + 1, selectedVariant);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      updateQuantity(product.id, quantity - 1, selectedVariant);
    } else {
      removeItem(product.id, selectedVariant);
    }
  };

  const handleRemove = () => {
    removeItem(product.id, selectedVariant);
  };

  // ✅ Récupération des tailles et couleurs depuis les variantes
  const availableSizes = product.variants?.map((v: ProductVariant) => v.size) ?? [];
  const availableColors = product.variants?.map((v: ProductVariant) => v.color) ?? [];

  const price = selectedVariant?.price ?? product.price;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-b border-gray-200">
      {/* IMAGE + DÉTAILS PRODUIT */}
      <div className="flex items-center gap-4 w-full sm:w-2/5">
        <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
          <img src={product.images[0]} alt={product.description} className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col gap-1 overflow-hidden">
          <span className="font-bold text-sm text-gray-800 line-clamp-1">{product.title}</span>

          <Link
            to={`/products/${product.id}`}
            className="text-base font-medium text-gray-700 hover:text-primary line-clamp-1"
          >
            {product.description}
          </Link>

          <span className="text-primary font-semibold text-sm">{formatPrice(price)}</span>

          {product.variants && product.variants.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div>
                <label className="block text-sm font-medium mb-2">Taille</label>
                <select
                  value={selectedVariant?.size || ''}
                  onChange={(e) => {
                    const newSize = e.target.value;
                    const newVariant = product.variants?.find(
                      (v) => v.size === newSize && v.color === selectedVariant?.color
                    );
                    if (newVariant) updateVariant(product.id, newVariant);
                  }}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {availableSizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Couleur</label>
                <select
                  value={selectedVariant?.color || ''}
                  onChange={(e) => {
                    const newColor = e.target.value;
                    const newVariant = product.variants?.find(
                      (v) => v.color === newColor && v.size === selectedVariant?.size
                    );
                    if (newVariant) updateVariant(product.id, newVariant);
                  }}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {availableColors.map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* QUANTITÉ + TOTAL + SUPPRIMER */}
      <div className="flex flex-col sm:flex-row items-center justify-between w-full sm:w-3/5 gap-4">
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
                updateQuantity(product.id, val, selectedVariant);
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

        <div className="font-semibold text-sm sm:text-base">{formatPrice(price * quantity)}</div>

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
