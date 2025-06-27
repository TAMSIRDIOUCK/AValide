// lib/productImage.ts

import { supabase } from './supabaseClient';
import { v4 as uuidv4 } from 'uuid';

/**
 * Upload une ou plusieurs images dans le bucket Supabase 'product-images'
 * et retourne les URLs publiques.
 *
 * @param files - La liste de fichiers (File[])
 * @returns - Liste des URLs publiques
 */
export const uploadProductImages = async (files: File[]): Promise<string[]> => {
  const urls: string[] = [];

  for (const file of files) {
    const ext = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${ext}`;
    const filePath = `products/${fileName}`; // Dossier virtuel dans le bucket

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      console.error('Erreur upload image Supabase:', uploadError.message);
      throw new Error('Échec de l’upload de l’image');
    }

    const { data: publicUrlData } = supabase
      .storage
      .from('product-images')
      .getPublicUrl(filePath);

    if (!publicUrlData?.publicUrl) {
      console.warn(`Aucune URL publique générée pour ${filePath}`);
      continue;
    }

    urls.push(publicUrlData.publicUrl);
  }

  return urls;
};
