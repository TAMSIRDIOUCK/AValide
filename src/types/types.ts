/* ======================================================
   VARIANT PRODUIT
====================================================== */
export interface ProductVariant {
  id?: string;
  size: string;
  color: string;
  price?: number;
  stock?: number;
}

/* ======================================================
   PRODUIT
====================================================== */
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
  seller_phone?: string;

  stock: number;
  likes: number;
  isFromChina?: boolean;
  variants?: ProductVariant[];
}

/* ======================================================
   PANIER
====================================================== */
export interface CartItem {
  product: Product;
  quantity: number;
  sellerId: string;
  selectedVariant?: ProductVariant;
}

/* ======================================================
   ITEM COMMANDE (order_items)
====================================================== */
export interface OrderItem {
  id: string;
  order_id: string;
  productId: string;

  seller_id: string;

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

/* ======================================================
   COMMANDE (orders)
====================================================== */
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

  // ✅ DEVENU OPTIONNEL → FIN DES ERREURS TS
  seller_id?: string;

  items: OrderItem[];
}
