import { supabase } from '../lib/supabaseClient';
import { Product } from '../types';

// 🔹 Récupérer tous les produits
export const getAllProductsFromSupabase = async (): Promise<Product[]> => {
  const { data, error } = await supabase.from('products').select('*');
  if (error) throw error;
  return data;
};

// 🔹 Récupérer les produits d’un vendeur
export const getProductsBySellerFromSupabase = async (sellerId: string): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// 🔹 Récupérer les produits par catégorie
export const getProductsByCategoryFromSupabase = async (category: string): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// 🔹 Ajouter un produit
export const addProductToSupabase = async (
  product: Omit<Product, 'id' | 'created_at'>
): Promise<Product> => {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .single();

  if (error) throw error;
  return data;
};

// 🔹 Mettre à jour un produit
export const updateProduct = async (
  id: string,
  updates: Partial<Product>
): Promise<Product> => {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

// 🔹 Rechercher des produits (dans le titre ou la description)
export const searchProductsInSupabase = async (query: string): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// 🔹 Récupérer les derniers produits publiés (ex: page d’accueil)
export const getLatestProducts = async (limit = 6): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
};

// 🔹 Supprimer un produit (définitivement)
export const deleteProduct = async (productId: string): Promise<{ error: any | null }> => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  return { error }; // 👈 utilisé dans les composants pour gérer l'affichage
};
