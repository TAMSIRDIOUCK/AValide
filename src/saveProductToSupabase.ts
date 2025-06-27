import { supabase } from './lib/supabaseClient';

export async function saveProductToSupabase(product: any, imageFiles: File[]) {
  // Étape 1 : uploader les images
  const imageUrls: string[] = [];

  for (const file of imageFiles) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error: uploadError } = await supabase.storage
      .from('products') // nom du bucket
      .upload(filePath, file);

    if (uploadError) {
      throw new Error('Erreur lors de l’upload de l’image : ' + uploadError.message);
    }

    const publicUrl = supabase.storage
      .from('products')
      .getPublicUrl(filePath).data.publicUrl;

    imageUrls.push(publicUrl);
  }

  // Étape 2 : insérer le produit dans la base
  const { error } = await supabase
    .from('products')
    .insert([
      {
        title: product.title,
        description: product.description,
        price: product.price,
        category: product.category,
        stock: product.stock,
        rating: product.rating,
        reviewCount: product.reviewCount,
        seller_id: product.sellerId,
        image_urls: imageUrls
      }
    ]);

  if (error) {
    throw new Error('Erreur d’insertion du produit : ' + error.message);
  }
}
