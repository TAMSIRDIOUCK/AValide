// pages/seller/AddProductPage.tsx

import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Package, Upload, X } from 'lucide-react';

import Layout from '../../components/layout/Layout';
import { categories } from '../../data/categories';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { uploadProductImages } from '../../lib/productImage';

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

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const urls = acceptedFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...urls]);
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 20, // accepte toutes les images d’un produit
    maxSize: 20 * 1024 * 1024, // taille max 20MB par image
  });

  const removeImage = (index: number) => {
    setPreviewUrls(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !user.id) {
      alert("Vous devez être connecté pour publier un produit.");
      return;
    }

    if (!title.trim() || !description.trim() || !price || !stock || !category) {
      alert("Tous les champs (nom, description, prix, stock, catégorie) sont obligatoires.");
      return;
    }

    if (files.length < 2) {
      alert("Veuillez ajouter au moins 2 images pour publier le produit.");
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
          category_id: category,
          images_urls: imageUrls,
          seller_id: user.id,
          created_at: new Date().toISOString(),
          rating: 0,
          review_count: 0,
          featured: true,
        },
      ]);

      if (error) {
        console.error('Erreur insertion produit :', error.message);
        alert(`Erreur lors de la publication: ${error.message}`);
      } else {
        alert('Produit publié avec succès !');
        navigate('/seller/dashboard');
      }
    } catch (err: any) {
      console.error('Erreur inconnue :', err.message || err);
      alert("Une erreur est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
            onChange={e => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="number"
            placeholder="Prix"
            value={price}
            onChange={e => setPrice(e.target.value)}
            className="w-full p-2 border rounded"
            min={0}
            required
          />
          <input
            type="number"
            placeholder="Stock"
            value={stock}
            onChange={e => setStock(e.target.value)}
            className="w-full p-2 border rounded"
            min={0}
            required
          />

          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Sélectionnez une catégorie</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <div
            {...getRootProps()}
            className="border-2 border-dashed border-gray-400 p-4 rounded cursor-pointer text-center"
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Déposez les images ici...</p>
            ) : (
              <p className="flex items-center justify-center gap-2">
                <Upload className="w-5 h-5" /> Glissez-déposez vos images ou cliquez pour sélectionner
              </p>
            )}
          </div>

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
