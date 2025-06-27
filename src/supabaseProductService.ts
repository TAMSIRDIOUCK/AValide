// utils/supabaseProductService.ts
import { supabase } from './lib/supabaseClient';

export const uploadImagesToSupabase = async (files: File[]): Promise<string[]> => {
  const urls: string[] = [];

  for (const file of files) {
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase
      .storage
      .from('products')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Erreur upload image :', uploadError.message);
      throw uploadError;
    }

    const { data: urlData } = supabase
      .storage
      .from('products')
      .getPublicUrl(filePath);

    urls.push(urlData.publicUrl);
  }

  return urls;
};

export const saveProductToSupabase = async (product: any, imageFiles: File[]) => {
  const imageUrls = await uploadImagesToSupabase(imageFiles);

  const productWithImages = {
    ...product,
    images: imageUrls,
  };

  const { data, error } = await supabase
    .from('products')
    .insert([productWithImages]);

  if (error) {
    console.error('Erreur Supabase insert:', error.message);
    throw error;
  }

  return data;
};
