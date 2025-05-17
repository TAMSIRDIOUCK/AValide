
const PRODUCTS_KEY = 'products';

export interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  images: string[];
  sellerId: string;
  createdAt: string;
  sellerName?: string;
  rating: number;
  reviewCount: number;
}

// Enregistrer un produit
export function saveProduct(product: Product) {
  const existing = getProducts();
  const updated = [...existing, product];
  setProducts(updated);
}

// Récupérer tous les produits
export function getProducts(): Product[] {
  return JSON.parse(localStorage.getItem(PRODUCTS_KEY) || '[]');
}

// Enregistrer une liste complète de produits
function setProducts(products: Product[]) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

// Récupérer les produits les plus récents
export function getLatestProducts(limit = 6): Product[] {
  return getProducts()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

// Produits d’un vendeur
export function getProductsBySeller(sellerId: string): Product[] {
  return getProducts().filter(product => product.sellerId === sellerId);
}

// Produits par catégorie
export function getProductsByCategory(categoryId: string): Product[] {
  return getProducts().filter(product => product.category === categoryId);
}

// Recherche de produits par mot-clé (titre ou description)
export function searchProducts(query: string): Product[] {
  const lowerQuery = query.toLowerCase();
  return getProducts().filter(product =>
    product.title.toLowerCase().includes(lowerQuery) ||
    product.description.toLowerCase().includes(lowerQuery)
  );
}

// Supprimer un produit
export function deleteProduct(id: string) {
  const products = getProducts();
  const updated = products.filter(product => product.id !== id);
  setProducts(updated);
}


