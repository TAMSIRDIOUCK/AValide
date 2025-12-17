// src/components/customer/ProductDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingCart, Minus, Plus } from 'lucide-react';
import { Product, ProductVariant } from '../types/types';
import { useCart } from '../context/CartContext';

interface ProductDetailPageProps {
  product: Product;
  onClose: () => void;
}

export default function ProductDetailPage({ product, onClose }: ProductDetailPageProps) {
  const { cartItems, addItem } = useCart();

  // 🔹 Gérer les variantes (string, array, undefined)
  const variants: ProductVariant[] = Array.isArray(product.variants)
    ? product.variants
    : typeof product.variants === 'string'
    ? JSON.parse(product.variants)
    : [];

  // 🔹 Sélection du premier variant disponible
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    variants.find(v => (v.stock ?? product.stock ?? 0) > 0) ?? variants[0]
  );

  const [quantity, setQuantity] = useState<number>(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('fr-FR').format(price) + ' F CFA';

  // 🔹 Récupérer tailles/couleurs uniques
  const availableSizes = [...new Set(variants.map(v => v.size))];
  const availableColors = [...new Set(variants.map(v => v.color))];

  // Ajout panier
  const handleAddToCart = () => {
    if (!selectedVariant) return;

    const exists = cartItems.some(
      item =>
        item.product.id === product.id &&
        item.selectedVariant?.size === selectedVariant.size &&
        item.selectedVariant?.color === selectedVariant.color
    );

    if (exists) {
      alert('Ce produit est déjà dans le panier !');
      return;
    }

    addItem(product, quantity, selectedVariant);
    alert(`${product.title} a été ajouté au panier !`);
  };

  // Mise à jour taille/couleur
  const updateVariant = (size?: string, color?: string) => {
    const newVariant = variants.find(
      v =>
        (size ? v.size === size : v.size === selectedVariant?.size) &&
        (color ? v.color === color : v.color === selectedVariant?.color)
    );
    if (newVariant) {
      setSelectedVariant(newVariant);
      setQuantity(1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Retour */}
       

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">

            {/* Images */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={product.images[selectedImageIndex]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {product.images.length > 1 && (
                <div className="flex overflow-x-auto space-x-2 scrollbar-hide">
                  {product.images.map((image, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`min-w-[80px] h-20 rounded-lg overflow-hidden border-2 cursor-pointer ${
                        selectedImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                      }`}
                    >
                      <img src={image} alt="img" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Infos */}
            <div className="space-y-6">

              {/* Titre */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
                <p className="text-gray-600">{product.description}</p>
              </div>

              {/* Prix */}
              <div className="text-3xl font-bold text-blue-800">
                {formatPrice(selectedVariant?.price ?? product.price)}
              </div>

              

              {/* Choix Taille */}
              {availableSizes.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium">Taille</h3>
                  <div className="flex gap-2 mt-2">
                    {availableSizes.map(size => (
                      <button
                        key={size}
                        onClick={() => updateVariant(size)}
                        className={`px-4 py-2 border rounded-xl ${
                          selectedVariant?.size === size
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Choix Couleur */}
              {availableColors.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium">Couleur</h3>
                  <div className="flex gap-2 mt-2">
                    {availableColors.map(color => (
                      <button
                        key={color}
                        onClick={() => updateVariant(undefined, color)}
                        className={`px-4 py-2 border rounded-xl ${
                          selectedVariant?.color === color
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantité */}
              <div>
                <h3 className="text-lg font-medium">Quantité</h3>
                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 border rounded-lg"
                  >
                    <Minus />
                  </button>

                  <span className="px-4 py-2 border rounded-lg">{quantity}</span>

                  <button
                    onClick={() =>
                      setQuantity(
                        Math.min(selectedVariant?.stock ?? product.stock ?? 1, quantity + 1)
                      )
                    }
                    className="p-2 border rounded-lg"
                  >
                    <Plus />
                  </button>
                </div>
              </div>

              {/* Ajouter panier */}
              <button
                onClick={handleAddToCart}
                className="w-full bg-blue-800 text-white py-4 rounded-xl mt-4"
              >
                <ShoppingCart className="w-5 h-5 inline-block mr-2" />
                Ajouter au panier
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
