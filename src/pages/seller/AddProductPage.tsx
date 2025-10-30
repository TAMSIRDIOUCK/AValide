import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Package, Upload, X, Plus, Trash2 } from 'lucide-react';

import Layout from '../../components/layout/Layout';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { uploadProductImages } from '../../lib/productImage';

interface LocalVariant {
  size: string;
  color: string;
  stock: number;
}

const AddProductPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFromChina, setIsFromChina] = useState(false);

  // ✅ Variantes (tailles, couleurs, stock)
  const [variants, setVariants] = useState<LocalVariant[]>([
    { size: 'M', color: 'Bleu', stock: 0 },
  ]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const urls = acceptedFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...urls]);
    setFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 20,
    maxSize: 20 * 1024 * 1024,
  });

  const removeImage = (index: number) => {
    setPreviewUrls((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChinaToggle = () => {
    setIsFromChina(!isFromChina);
    setCategory(!isFromChina ? 'chine' : '');
  };

  // ✅ Gestion des variantes
  const addVariant = () =>
    setVariants([...variants, { size: 'M', color: 'Bleu', stock: 0 }]);

  const updateVariant = (index: number, field: keyof LocalVariant, value: string | number) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const removeVariant = (index: number) =>
    variants.length > 1 && setVariants(variants.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !user.id) {
      alert('Vous devez être connecté pour publier un produit.');
      return;
    }

    if (!title.trim() || !description.trim() || !price || !stock || !category) {
      alert('Tous les champs sont obligatoires.');
      return;
    }

    if (files.length < 2) {
      alert('Ajoutez au moins 2 images pour publier.');
      return;
    }

    setIsSubmitting(true);

    try {
      const imageUrls = await uploadProductImages(files);

      const { error } = await supabase.from('products').insert([
        {
          title,
          description,
          price: parseFloat(price),
          stock: parseInt(stock, 10),
          category,
          images_urls: imageUrls,
          seller_id: user.id,
          created_at: new Date().toISOString(),
          rating: 0,
          review_count: 0,
          featured: true,
          is_from_china: isFromChina,
          variants: variants, // ✅ Ajout des variantes dans Supabase
        },
      ]);

      if (error) {
        console.error('Erreur insertion produit :', error.message);
        alert(`Erreur : ${error.message}`);
      } else {
        alert('✅ Produit publié avec succès !');
        navigate('/seller/dashboard');
      }
    } catch (err: any) {
      console.error('Erreur inconnue :', err.message || err);
      alert('Une erreur est survenue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoriesList = [
    { id: 'vetement', name: 'Vêtements 👕' },
    { id: 'accessoire', name: 'Accessoires 💍' },
    { id: 'meuble', name: 'Meubles 🪑' },
    { id: 'enfant', name: 'Enfants 🧸' },
    { id: 'chine', name: 'Produits de Chine 🇨🇳' },
    { id: 'autre', name: 'Autres 🛍️' },
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Package className="w-6 h-6" />
          Ajouter un produit
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nom du produit"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />

          <input
            type="number"
            placeholder="Prix"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full p-2 border rounded"
            min={0}
            required
          />

          <input
            type="number"
            placeholder="Stock total"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="w-full p-2 border rounded"
            min={0}
            required
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 border rounded"
            required
            disabled={isFromChina}
          >
            <option value="">Sélectionnez une catégorie</option>
            {categoriesList.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* ✅ Gestion des variantes (tailles et couleurs) */}
          <div>
            <label className="text-sm font-medium text-gray-700">Variantes (taille, couleur, stock)</label>
            <div className="space-y-3 mt-2">
              {variants.map((variant, index) => (
                <div key={index} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <input
                    type="text"
                    placeholder="Taille"
                    value={variant.size}
                    onChange={(e) => updateVariant(index, 'size', e.target.value)}
                    className="p-2 border rounded"
                  />
                  <input
                    type="text"
                    placeholder="Couleur"
                    value={variant.color}
                    onChange={(e) => updateVariant(index, 'color', e.target.value)}
                    className="p-2 border rounded"
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    value={variant.stock}
                    onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value))}
                    className="p-2 border rounded"
                  />
                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addVariant}
                className="flex items-center text-blue-600 hover:underline"
              >
                <Plus className="w-4 h-4 mr-1" />
                Ajouter une variante
              </button>
            </div>
          </div>

          {/* Zone d’upload */}
          <div
            {...getRootProps()}
            className="border-2 border-dashed border-gray-400 p-4 rounded cursor-pointer text-center"
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Déposez les images ici...</p>
            ) : (
              <p className="flex items-center justify-center gap-2">
                <Upload className="w-5 h-5" />
                Glissez-déposez ou cliquez pour sélectionner vos images
              </p>
            )}
          </div>

          {/* Aperçu des images */}
          <div className="flex flex-wrap gap-4 mt-4">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative">
                <img src={url} alt={`preview-${index}`} className="w-24 h-24 object-cover rounded" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Produit de Chine */}
          <div className="mb-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isFromChina}
                onChange={handleChinaToggle}
                className="form-checkbox"
              />
              <span>Ce produit vient de Chine 🇨🇳</span>
            </label>
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Publication...' : 'Publier le produit'}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default AddProductPage;
