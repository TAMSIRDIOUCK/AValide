// src/types/index.ts

export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  sellerId: string;
  sellerName?: string;
  rating: number;
  reviewCount: number;
  stock: number;
  createdAt: string;
};

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: 'buyer' | 'seller' | 'admin';
  createdAt: string;
}

// ✅ Garde UNE SEULE version cohérente avec l’usage dans le panier
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  createdAt: string;
  items: {
    productId: string;
    title: string;
    quantity: number;
    price: number;
    isProcessed: boolean,
    sellerId: string,
  }[];
  total: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
}


export interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  itemCount: number; // 👈 AJOUTEZ CECI
}
