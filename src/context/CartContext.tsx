// src/context/CartContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types/types';
import { supabase } from '../lib/supabaseClient'; // Assuming supabaseClient is where Supabase is initialized

// -----------------------------
// ✅ Type pour une variante
// -----------------------------
export type Variant = {
  size: string;
  color: string;
  price?: number;
  stock?: number;
};

// -----------------------------
// ✅ Type pour un item du panier
// -----------------------------
export type CartItem = {
  product: Product;
  quantity: number;
  selectedVariant?: Variant;
  cartItemId: string;
};

// -----------------------------
// ✅ Type du contexte
// -----------------------------
interface CartContextType {
  cartItems: CartItem[];
  addItem: (product: Product, quantity?: number, variant?: Variant) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  updateVariant: (cartItemId: string, variant: Variant) => void;
  clearCart: () => void;
  itemCount: number;
  total: number;
}

// -----------------------------
// 🔹 Création du contexte
// -----------------------------
const CartContext = createContext<CartContextType | undefined>(undefined);

// -----------------------------
// ✅ Fournisseur du contexte
// -----------------------------
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Charger le panier depuis localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('avalideCart');
      if (saved) setCartItems(JSON.parse(saved));
    } catch (err) {
      console.error('Erreur chargement panier :', err);
      setCartItems([]);
    }
  }, []);

  // Sauvegarder automatiquement
  useEffect(() => {
    localStorage.setItem('avalideCart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Ajouter un produit
  const addItem = (product: Product, quantity = 1, variant?: Variant) => {
    setCartItems(prev => {
      const existing = prev.find(
        item =>
          item.product.id === product.id &&
          (variant
            ? item.selectedVariant?.size === variant.size &&
              item.selectedVariant?.color === variant.color
            : !item.selectedVariant)
      );

      const maxStock = variant?.stock ?? product.stock ?? Infinity;

      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > maxStock) {
          alert(`Stock limité. Seulement ${maxStock} disponible.`);
          return prev;
        }
        return prev.map(i => (i === existing ? { ...i, quantity: newQty } : i));
      }

      if (quantity > maxStock) {
        alert(`Stock limité. Seulement ${maxStock} disponible.`);
        return prev;
      }

      return [
        ...prev,
        {
          product,
          quantity,
          selectedVariant: variant,
          cartItemId: `${product.id}-${variant?.size ?? ''}-${variant?.color ?? ''}-${Date.now()}`,
        },
      ];
    });
  };

  // Supprimer
  const removeItem = (cartItemId: string) => {
    setCartItems(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  // Mettre à jour la quantité
  const updateQuantity = (cartItemId: string, quantity: number) => {
    setCartItems(prev =>
      prev.map(item => {
        if (item.cartItemId === cartItemId) {
          const maxStock = item.selectedVariant?.stock ?? item.product.stock ?? Infinity;
          if (quantity > maxStock) {
            alert(`Stock limité. Seulement ${maxStock} disponible.`);
            return item;
          }
          if (quantity < 1) return item;
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  // Mettre à jour la variante
  const updateVariant = async (cartItemId: string, variant: Variant) => {
    setCartItems(prev =>
      prev.map(item =>
        item.cartItemId === cartItemId
          ? { ...item, selectedVariant: variant, quantity: 1 } // reset quantité sur changement variant
          : item
      )
    );

    try {
      const { data, error } = await supabase
        .from('cart_items')
        .update({ selectedVariant: variant })
        .eq('cartItemId', cartItemId);

      if (error) {
        console.error('Erreur lors de la mise à jour de la variante dans Supabase :', error);
      } else {
        console.log('Variante mise à jour avec succès dans Supabase :', data);
      }
    } catch (err) {
      console.error('Erreur inattendue lors de la mise à jour de la variante :', err);
    }
  };

  // Vider le panier
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('avalideCart');
  };

  // Nombre d’articles
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Total
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

// Hook
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
