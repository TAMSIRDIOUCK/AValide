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
  images_urls?: string[]; // 👈 optionnellement ajouté
  likes?: number;
};

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  createdAt: string;
}

// ✅ CartItem avec produit complet et quantité
export interface CartItem {
  product: Product;
  quantity: number;
}

// ✅ Article dans une commande avec infos client
export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  title: string;
  price: number;
  quantity: number;
  sellerId: string;
  image_url?: string;
  is_processed?: boolean;
  status?: string;

  // ✅ Champs client ajoutés par article
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
}

// ✅ Commande complète
export interface Order {
  id: string;
  userId: string;
  createdAt: string;
  total: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerEmail?: string;
  additionalInfo?: string;
  paymentMethod?: string;
  status: string;

  // ✅ Liste complète d’articles avec toutes infos
  items: Array<{
    productId: string;
    sellerId: string;
    title: string;
    image?: string[];
    quantity: number;
    price: number;

    // ✅ Champs client (pour affichage même au niveau des items)
    customerName?: string;
    customerPhone?: string;
    customerAddress?: string;
  }>;
}

// ✅ Contexte panier global
export interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  itemCount: number;
}
