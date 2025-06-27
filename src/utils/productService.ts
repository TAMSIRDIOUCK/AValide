import { supabase } from '../lib/supabaseClient'; // adapte le chemin si besoin
import { Product } from '../types'; // ajuste le chemin si nécessaire

// Récupérer tous les produits depuis Supabase
export const getAllProductsFromSupabase = async (): Promise<Product[]> => {
  const { data, error } = await supabase.from('products').select('*');
  if (error) throw error;
  return data;
};

// Récupérer les produits d’un vendeur spécifique
export const getProductsBySellerFromSupabase = async (sellerId: string): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

// Récupérer les produits par catégorie
export const getProductsByCategoryFromSupabase = async (category: string): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

// Ajouter un produit dans Supabase
export const addProductToSupabase = async (product: Omit<Product, 'id' | 'created_at'>): Promise<Product> => {
  const { data, error } = await supabase.from('products').insert([product]).single();
  if (error) throw error;
  return data;
};

// Supprimer un produit par ID dans Supabase
export const deleteProduct = async (id: string): Promise<void> => {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
};

// Mettre à jour un produit (ex : stock, titre, prix...)
export const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product> => {
  const { data, error } = await supabase.from('products').update(updates).eq('id', id).single();
  if (error) throw error;
  return data;
};

// Rechercher des produits par mot-clé (titre ou description)
export const searchProductsInSupabase = async (query: string): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .ilike('title', `%${query}%`)
    .or(`description.ilike.%${query}%`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

// Récupérer les derniers produits ajoutés (limite)
export const getLatestProducts = async (limit = 6): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
};
