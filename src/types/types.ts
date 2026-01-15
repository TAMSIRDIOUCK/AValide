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
  order_id: string;          // correspond à order_items.order_id
  productId: string;
  seller_id: string;          // correspond à order_items.seller_id
  seller_email: string;       // correspond à order_items.seller_email
  title: string;
  images: string[];
  quantity: number;
  price: number;
  variantSize: string;
  variantColor: string;
  variantPrice: number | null;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  status: string;
  created_at: string;
}

export interface Order {
  id: string;
  userId: string;
  createdAt: string;
  total: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  paymentMethod: string;
  status: string;
  seller_id: string;          // ajouté
  seller_email: string;       // ajouté
  items: OrderItem[];
}
