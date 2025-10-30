// src/types/types.ts

// ✅ Type pour les variantes de produit (taille, couleur, stock, prix)
export interface ProductVariant {
  id?: string;          // ID optionnel (peut venir de Supabase)
  size: string;         // Taille de la variante (ex: "M", "L")
  color: string;        // Couleur de la variante
  price?: number;       // Prix spécifique à la variante (facultatif)
  stock?: number;       // Stock spécifique à la variante (facultatif)
}

// ✅ Type principal pour les produits
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;                   // Prix par défaut si aucune variante
  images: string[];                // Chemins locaux ou URL
  images_urls?: string[];          // URL uploadées vers Supabase
  rating: number;
  reviewCount: number;
  createdAt: string;
  category: string;
  sellerId: string;
  sellerName?: string;             // Nom du vendeur
  stock: number;                   // Stock global si pas de variantes
  likes: number;
  isFromChina?: boolean;           // Produit venant de Chine
  variants?: ProductVariant[];     // Liste des variantes disponibles
}

// ✅ Type pour les items du panier
export interface CartItem {
  product: Product;                 // Produit complet
  quantity: number;                 // Quantité choisie
  sellerId: string;                 // ID du vendeur
  selectedVariant?: ProductVariant; // Variante sélectionnée par le client
}

// ✅ Type pour les commandes
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
  items: {
    id: string;
    productId: string;
    sellerId: string;
    title: string;
    images: string[];
    quantity: number;
    price: number;                   // Prix réel de l'article (variant ou produit)
    status: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    selectedVariant?: ProductVariant; // Variante sélectionnée
  }[];
}
