export interface ProductVariant {
  id?: string;
  size: string;
  color: string;
  price?: number;
  stock?: number;
}

// Produit principal
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  images_urls?: string[];
  rating: number;
  reviewCount: number;
  createdAt: string;
  category: string;
  sellerId: string;
  sellerName?: string;
  seller_phone?: string; // Add seller_phone as an optional property
  stock: number;
  likes: number;
  isFromChina?: boolean;
  variants?: ProductVariant[];
}

// Item du panier
export interface CartItem {
  product: Product;
  quantity: number;
  sellerId: string;
  selectedVariant?: ProductVariant;
}

// ------------ Types Commandes ------------

// Item d’une commande (tel que Supabase le renvoie)
export interface OrderItem {
  id: string;
  order_id: string;            // 🔥 ajouté
  created_at: string;          // 🔥 ajouté par Supabase automatiquement

  productId: string;
  sellerId: string;
  title: string;
  images: string[];
  quantity: number;
  price: number;
  status: string;

  customerName: string;
  customerPhone: string;
  customerAddress: string;

  selectedVariant?: ProductVariant; // Variant sélectionnée
}

// Commande complète
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

  paymentMethod: string;
  status: string;

  items: OrderItem[];
}
