// src/context/CartContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, ProductVariant } from '../types/types';

// ✅ Type pour la variante dans le panier (adapté avec price)
export type Variant = {
  id?: string;        // ID optionnel (peut venir de Supabase)
  size: string;
  color: string;
  price?: number;     // Prix spécifique à la variante
  stock?: number;     // Stock spécifique à la variante
};

// ✅ Type pour un item dans le panier
export type CartItem = {
  product: Product;
  quantity: number;
  sellerId: string;
  selectedVariant?: Variant; // Variante sélectionnée
};

interface CartContextType {
  cartItems: CartItem[];
  addItem: (product: Product, quantity?: number, variant?: Variant) => void;
  removeItem: (productId: string, variant?: Variant) => void;
  updateQuantity: (productId: string, quantity: number, variant?: Variant) => void;
  updateVariant: (productId: string, newVariant: Variant) => void;
  clearCart: () => void;
  itemCount: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // 🔹 Charger le panier depuis localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('avalideCart');
      if (savedCart) {
        const parsed: CartItem[] = JSON.parse(savedCart);
        setCartItems(parsed);
      }
    } catch (error) {
      console.error('Erreur de parsing du panier depuis localStorage:', error);
      setCartItems([]);
    }
  }, []);

  // 🔹 Sauvegarder le panier dans localStorage
  useEffect(() => {
    localStorage.setItem('avalideCart', JSON.stringify(cartItems));
  }, [cartItems]);

  // ✅ Ajouter un produit (avec ou sans variante)
  const addItem = (product: Product, quantity = 1, variant?: Variant) => {
    const sellerId = product.sellerId;
    if (!product || !sellerId) return;

    setCartItems(currentItems => {
      const existingItem = currentItems.find(
        item =>
          item.product.id === product.id &&
          (variant
            ? item.selectedVariant?.size === variant.size &&
              item.selectedVariant?.color === variant.color
            : !item.selectedVariant)
      );

      const maxStock = variant?.stock ?? product.stock ?? Infinity;

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > maxStock) {
          alert(`Stock limité. Seulement ${maxStock} en stock.`);
          return currentItems;
        }
        return currentItems.map(item =>
          item === existingItem ? { ...item, quantity: newQuantity } : item
        );
      } else {
        if (quantity > maxStock) {
          alert(`Stock limité. Seulement ${maxStock} en stock.`);
          return currentItems;
        }
        return [...currentItems, { product, quantity, sellerId, selectedVariant: variant }];
      }
    });
  };

  // ✅ Supprimer un produit ou une variante spécifique
  const removeItem = (productId: string, variant?: Variant) => {
    setCartItems(currentItems =>
      currentItems.filter(
        item =>
          !(
            item.product.id === productId &&
            (variant
              ? item.selectedVariant?.size === variant.size &&
                item.selectedVariant?.color === variant.color
              : true)
          )
      )
    );
  };

  // ✅ Mettre à jour la quantité
  const updateQuantity = (productId: string, quantity: number, variant?: Variant) => {
    setCartItems(currentItems =>
      currentItems.map(item => {
        const isSameProduct = item.product.id === productId;
        const isSameVariant =
          variant
            ? item.selectedVariant?.size === variant.size &&
              item.selectedVariant?.color === variant.color
            : true;

        if (isSameProduct && isSameVariant) {
          const maxStock = variant?.stock ?? item.selectedVariant?.stock ?? item.product.stock ?? Infinity;

          if (quantity > maxStock) {
            alert(`Stock insuffisant. Seulement ${maxStock} en stock.`);
            return item;
          }

          if (quantity <= 0) return item;
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  // ✅ Changer la variante d’un produit
  const updateVariant = (productId: string, newVariant: Variant) => {
    setCartItems(currentItems =>
      currentItems.map(item =>
        item.product.id === productId
          ? { ...item, selectedVariant: newVariant, quantity: 1 }
          : item
      )
    );
  };

  const clearCart = () => setCartItems([]);

  const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  // ✅ Total en prenant en compte la variante si elle a un prix
  const total = cartItems.reduce(
    (sum, item) => sum + (item.selectedVariant?.price ?? item.product.price) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addItem,
        removeItem,
        updateQuantity,
        updateVariant,
        clearCart,
        itemCount,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// ✅ Hook pour utiliser le panier
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
