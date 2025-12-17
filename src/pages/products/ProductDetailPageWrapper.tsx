// src/pages/products/ProductDetailPageWrapper.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { Product } from '../../types/types';
import ProductDetailPage from '../../components/ProductDetailPage';

// Wrapper pour récupérer l'ID du produit depuis l'URL et charger les données
const ProductDetailPageWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erreur fetch produit:', error.message);
        setLoading(false);
        return;
      }

      const adapted: Product = {
        id: data.id,
        title: data.title,
        description: data.description,
        price: data.price,
        images: data.images_urls || [],
        rating: data.rating || 0,
        reviewCount: data.review_count || 0,
        createdAt: data.created_at,
        category: data.category || 'autre',
        sellerId: data.seller_id,
        stock: data.stock || 0,
        likes: data.likes || 0,
        isFromChina: Boolean(data.is_from_china),
        variants: (() => {
          try {
            if (typeof data.variants === 'string') return JSON.parse(data.variants);
            if (Array.isArray(data.variants)) return data.variants;
            return [];
          } catch {
            return [];
          }
        })(),
      };

      setProduct(adapted);
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  if (loading)
    return (
      <div className="pt-20 text-center">
        Chargement du produit...
      </div>
    );

  if (!product)
    return (
      <div className="pt-20 text-center">
        Produit introuvable.
      </div>
    );

  // ⚡ On passe le produit à ProductDetailPage avec un padding-top pour espacer du header
  return (
    <div className="pt-20">
      <ProductDetailPage product={product} onClose={() => {}} />
    </div>
  );
};

export default ProductDetailPageWrapper;
