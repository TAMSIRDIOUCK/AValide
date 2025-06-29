import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';

export type CartItem = {
  product: Product;
  quantity: number;
  sellerId: string;
};

interface CartContextType {
  cartItems: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('avalideCart');
      if (savedCart) {
        const parsed: CartItem[] = JSON.parse(savedCart);
        const filtered = parsed.filter(
          item =>
            item &&
            item.product &&
            typeof item.product.id === 'string' &&
            typeof item.product.price === 'number' &&
            typeof item.quantity === 'number' &&
            typeof item.sellerId === 'string'
        );
        setCartItems(filtered);
      }
    } catch (error) {
      console.error('Erreur de parsing du panier depuis localStorage:', error);
      setCartItems([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('avalideCart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addItem = (product: Product, quantity = 1) => {
    const sellerId = product.sellerId || (product as any).seller_id;

    if (
      !product ||
      typeof product.id !== 'string' ||
      typeof product.price !== 'number' ||
      !sellerId
    ) {
      console.warn('Produit invalide ou sellerId manquant :', product);
      return;
    }

    setCartItems(currentItems => {
      const existingItem = currentItems.find(item => item.product.id === product.id);
      const maxStock = product.stock ?? Infinity;

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > maxStock) {
          alert(`Stock limité. Seulement ${maxStock} en stock.`);
          return currentItems;
        }

        return currentItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        if (quantity > maxStock) {
          alert(`Stock limité. Seulement ${maxStock} en stock.`);
          return currentItems;
        }
        return [...currentItems, { product, quantity, sellerId }];
      }
    });
  };

  const removeItem = (productId: string) => {
    setCartItems(currentItems =>
      currentItems.filter(item => item.product.id !== productId)
    );
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const productInCart = cartItems.find(item => item.product.id === productId);
    const maxStock = productInCart?.product.stock ?? Infinity;

    if (quantity > maxStock) {
      alert(`Stock insuffisant. Seulement ${maxStock} en stock.`);
      return;
    }

    if (quantity <= 0) {
      removeItem(productId);
    } else {
      setCartItems(currentItems =>
        currentItems.map(item =>
          item.product.id === productId
            ? { ...item, quantity }
            : item
        )
      );
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
