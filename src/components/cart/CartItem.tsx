// src/components/cart/CartItem.tsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash, Plus, Minus } from 'lucide-react';
import { useCart, CartItem as CartContextItem, Variant } from '../../context/CartContext';
import { ProductVariant } from '../../types/types';
import { formatPrice } from '../../utils/formatters';

interface CartItemProps {
  item: CartContextItem;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeItem, updateVariant } = useCart();
  const { product, quantity, selectedVariant, cartItemId } = item;

  if (!product) return null;

  // 🔹 Récupération des variantes
  let variants: ProductVariant[] = [];
  try {
    if (typeof product.variants === 'string') {
      variants = JSON.parse(product.variants);
    } else if (Array.isArray(product.variants)) {
      variants = product.variants;
    }
  } catch (error) {
    console.error('Erreur parsing variantes :', error);
  }

  const availableSizes = [...new Set(variants.map((v) => v.size).filter(Boolean))];
  const availableColors = [...new Set(variants.map((v) => v.color).filter(Boolean))];

  const currentVariant: Variant = selectedVariant || {
    size: '',
    color: '',
    price: product.price,
    stock: product.stock ?? Infinity,
  };

  const [localVariant, setLocalVariant] = useState<Variant>(currentVariant);
  const [localQuantity, setLocalQuantity] = useState<number>(quantity || 1);

  const price = localVariant.price ?? product.price ?? 0;
  const maxStock = localVariant.stock ?? product.stock ?? Infinity;

  // 🔹 Synchroniser la quantité avec le contexte
  useEffect(() => {
    updateQuantity(cartItemId, localQuantity);
  }, [localQuantity]);

  // 🔹 Gestion des variantes
  const handleSizeSelect = (size: string) => {
    const newVariant: Variant =
      variants.find((v) => v.size === size && v.color === localVariant.color) ||
      { ...localVariant, size };
    setLocalVariant(newVariant);
    updateVariant(cartItemId, newVariant);
  };

  const handleColorSelect = (color: string) => {
    const newVariant: Variant =
      variants.find((v) => v.color === color && v.size === localVariant.size) ||
      { ...localVariant, color };
    setLocalVariant(newVariant);
    updateVariant(cartItemId, newVariant);
  };

  // 🔹 Gestion de la quantité
  const handleIncrement = () => {
    if (localQuantity < maxStock) setLocalQuantity(localQuantity + 1);
  };

  const handleDecrement = () => {
    if (localQuantity > 1) setLocalQuantity(localQuantity - 1);
  };

  const handleQuantityChange = (val: string) => {
    const parsed = parseInt(val);
    if (isNaN(parsed) || parsed < 1) return setLocalQuantity(1);
    if (parsed > maxStock) return setLocalQuantity(maxStock);
    setLocalQuantity(parsed);
  };

  

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-b border-gray-200">
      {/* IMAGE + DÉTAILS */}
      <div className="flex items-center gap-4 w-full sm:w-2/5">
        <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={product.images?.[0] || '/placeholder.png'}
            alt={product.title || 'Produit'}
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

          {/* Variantes */}
          {variants.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              {availableSizes.length > 0 && (
                <div>
                  <span className="block text-sm font-medium mb-1">Taille</span>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => handleSizeSelect(size)}
                        className={`px-3 py-1 rounded-lg border text-sm transition ${
                          localVariant.size === size
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {availableColors.length > 0 && (
                <div>
                  <span className="block text-sm font-medium mb-1">Couleur</span>
                  <div className="flex flex-wrap gap-2">
                    {availableColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => handleColorSelect(color)}
                        className={`px-3 py-1 rounded-lg border text-sm transition ${
                          localVariant.color === color
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quantité + Total + Supprimer */}
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
            value={localQuantity.toString()}
            onChange={(e) => handleQuantityChange(e.target.value)}
            className="w-12 mx-2 text-center border border-gray-300 rounded-md p-1 text-sm"
          />

          <button
            onClick={handleIncrement}
            disabled={localQuantity >= maxStock}
            className={`p-1.5 border rounded-full ${
              localQuantity >= maxStock
                ? 'border-gray-300 text-gray-400 cursor-not-allowed bg-gray-100'
                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
            aria-label="Augmenter"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="font-semibold text-sm sm:text-base">
          {formatPrice(price * localQuantity)}
        </div>

       
      </div>
    </div>
  );
};

export default CartItem;
