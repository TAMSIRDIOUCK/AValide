// src/utils/cartService.ts
import { Product } from './productService';

export const addToCart = (product: Product) => {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const existing = cart.find((item: any) => item.id === product.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
};

