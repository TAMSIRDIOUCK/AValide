// src/context/CartContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types/types';

// ✅ Type pour la variante dans le panier
export type Variant = {
  id?: string;
  size: string;
  color: string;
  price?: number;
  stock?: number;
};

// ✅ Type pour un article du panier
export type CartItem = {
  product: Product;
  quantity: number;
  sellerId: string;
  selectedVariant?: Variant;
  cartItemId: string;
};

interface CartContextType {
  cartItems: CartItem[];
  addItem: (product: Product, quantity?: number, variant?: Variant) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  updateVariant: (cartItemId: string, newVariant: Variant) => void;
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
        setCartItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Erreur lors du chargement du panier depuis localStorage :', error);
      setCartItems([]);
    }
  }, []);

  // 🔹 Sauvegarder automatiquement dans localStorage
  useEffect(() => {
    localStorage.setItem('avalideCart', JSON.stringify(cartItems));
  }, [cartItems]);

  // ✅ Ajouter un produit au panier
  const addItem = (product: Product, quantity = 1, variant?: Variant) => {
    if (!product) return;
    const sellerId = product.sellerId;

    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) =>
          item.product.id === product.id &&
          (variant
            ? item.selectedVariant?.size === variant.size &&
              item.selectedVariant?.color === variant.color
            : !item.selectedVariant)
      );

      const maxStock = variant?.stock ?? product.stock ?? Infinity;

      if (existingItem) {
        const newQty = existingItem.quantity + quantity;
        if (newQty > maxStock) {
          alert(`Stock limité. Seulement ${maxStock} en stock.`);
          return currentItems;
        }
        return currentItems.map((item) =>
          item === existingItem ? { ...item, quantity: newQty } : item
        );
      } else {
        if (quantity > maxStock) {
          alert(`Stock limité. Seulement ${maxStock} en stock.`);
          return currentItems;
        }

        return [
          ...currentItems,
          {
            product,
            quantity,
            sellerId,
            selectedVariant: variant || undefined,
            cartItemId: `${product.id}-${variant?.size ?? ''}-${variant?.color ?? ''}-${Date.now()}`,
          },
        ];
      }
    });
  };

  // ✅ Supprimer un produit du panier
  const removeItem = (cartItemId: string) => {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item.cartItemId !== cartItemId)
    );
  };

  // ✅ Mettre à jour la quantité d’un produit
  const updateQuantity = (cartItemId: string, quantity: number) => {
    setCartItems((currentItems) =>
      currentItems.map((item) => {
        if (item.cartItemId === cartItemId) {
          const maxStock = item.selectedVariant?.stock ?? item.product.stock ?? Infinity;
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

  // ✅ Mettre à jour la variante (taille, couleur)
  const updateVariant = (cartItemId: string, newVariant: Variant) => {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.cartItemId === cartItemId
          ? { ...item, selectedVariant: newVariant, quantity: 1 }
          : item
      )
    );
  };

  // ✅ Vider tout le panier
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('avalideCart');
  };

  // 🔹 Calcul du nombre total d’articles
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // 🔹 Calcul du total global
  const total = cartItems.reduce(
    (sum, item) =>
      sum + (item.selectedVariant?.price ?? item.product.price) * item.quantity,
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

// ✅ Hook personnalisé pour accéder facilement au panier
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
