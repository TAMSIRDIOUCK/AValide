import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Package, Upload, X } from 'lucide-react';

import Layout from '../../components/layout/Layout';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { uploadProductImages } from '../../lib/productImage';

interface LocalVariant {
  size: string;
  color: string;
}

const AddProductPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState(0);
  const [category, setCategory] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFromChina, setIsFromChina] = useState(false);

  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

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

  const sizesList = ['M', 'L', 'XL', 'XXL', '36', '37', '38', '39', '40', '41'];
  const colorsList = [
    { name: 'Rouge', color: '#FF0000' },
    { name: 'Bleu', color: '#0000FF' },
    { name: 'Vert', color: '#008000' },
    { name: 'Noir', color: '#000000' },
    { name: 'Blanc', color: '#FFFFFF' },
  ];

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !user.id) {
      alert('Vous devez être connecté pour publier un produit.');
      return;
    }

    if (!title.trim() || !description.trim() || !price || !category) {
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

      // Génération automatique des variantes combinant tailles et couleurs
      let variants: LocalVariant[] = [];
      if (selectedSizes.length && selectedColors.length) {
        selectedSizes.forEach((size) => {
          selectedColors.forEach((color) => {
            variants.push({ size, color });
          });
        });
      } else if (selectedSizes.length) {
        variants = selectedSizes.map((size) => ({ size, color: '' }));
      } else if (selectedColors.length) {
        variants = selectedColors.map((color) => ({ size: '', color }));
      } else {
        variants = [{ size: '', color: '' }]; // Pas de taille ni couleur
      }

      const { error } = await supabase.from('products').insert([
        {
          title,
          description,
          price: parseFloat(price),
          stock,
          category,
          images_urls: imageUrls,
          seller_id: user.id,
          created_at: new Date().toISOString(),
          rating: 0,
          review_count: 0,
          featured: true,
          is_from_china: isFromChina,
          variants,
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
            placeholder="Stock global"
            value={stock}
            onChange={(e) => setStock(parseInt(e.target.value))}
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

          {/* ✅ Tailles */}
          <div>
            <label className="text-sm font-medium text-gray-700">Tailles disponibles</label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {sizesList.map((size) => (
                <label key={size} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedSizes.includes(size)}
                    onChange={() => toggleSize(size)}
                    className="form-checkbox"
                  />
                  <span>{size}</span>
                </label>
              ))}
            </div>
          </div>

          {/* ✅ Couleurs */}
          <div>
            <label className="text-sm font-medium text-gray-700">Couleurs disponibles</label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {colorsList.map((c) => (
                <label key={c.name} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedColors.includes(c.name)}
                    onChange={() => toggleColor(c.name)}
                    className="form-checkbox"
                    style={{ accentColor: c.color }}
                  />
                  <span className="flex items-center space-x-1">
                    <span
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: c.color }}
                    ></span>
                    <span>{c.name}</span>
                  </span>
                </label>
              ))}
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
