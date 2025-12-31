import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Package, Upload, X } from 'lucide-react';

import Layout from '../../app/api/layout/Layout';
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
  const [sellerPhone, setSellerPhone] = useState('');

  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  // ----- UPLOAD IMAGES -----
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const urls = acceptedFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...urls]);
    setFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": ['.jpg', '.jpeg', '.png', '.webp'] },
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

  // ----- CATEGORIE CHINE -----
  const handleChinaToggle = () => {
    setIsFromChina(!isFromChina);
    setCategory(!isFromChina ? "chine" : "");
  };

  // ----- LISTES -----
  const sizesList = ['M', 'L', 'XL', 'XXL', '36', '37', '38', '39', '40', '41'];
  const colorsList = [
    { name: 'Rouge', color: '#FF0000' },
    { name: 'Bleu', color: '#0000FF' },
    { name: 'Vert', color: '#008000' },
    { name: 'Noir', color: '#000000' },
    { name: 'Blanc', color: '#FFFFFF' },
  ];

  // ----- SELECT VARIANTS -----
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

  // ===== SUBMIT =====
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !user.id) {
      alert("Vous devez être connecté pour publier un produit.");
      return;
    }
    if (!title.trim() || !description.trim() || !price || !category || !sellerPhone) {
      alert("Tous les champs sont obligatoires, y compris le numéro de téléphone.");
      return;
    }
    if (files.length < 2) {
      alert("Ajoutez au moins 2 images.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1️⃣ Upload images
      const imageUrls = await uploadProductImages(files);

      // 2️⃣ Générer les variantes
      let variants: LocalVariant[] = [];

      if (selectedSizes.length && selectedColors.length) {
        selectedSizes.forEach((size) => {
          selectedColors.forEach((color) => {
            variants.push({ size, color });
          });
        });
      } else if (selectedSizes.length) {
        variants = selectedSizes.map((size) => ({ size, color: "" }));
      } else if (selectedColors.length) {
        variants = selectedColors.map((color) => ({ size: "", color }));
      } else {
        variants = [{ size: "", color: "" }];
      }

      // 3️⃣ Insert product
      const { error } = await supabase.from("products").insert([
        {
          title,
          description,
          price: Number(price),
          stock,
          category,
          images_urls: imageUrls,
          seller_id: user.id,
          created_at: new Date().toISOString(),
          rating: 0,
          review_count: 0,
          featured: true,
          is_from_china: isFromChina,
          variants, // <= 🔥 LES VARIANTES SONT ENREGISTRÉES ICI
          seller_phone: sellerPhone, // Include seller phone number
        },
      ]);

      if (error) {
        console.error(error);
        alert("Erreur : " + error.message);
        return;
      }

      alert("Produit publié avec succès !");
      navigate("/seller/dashboard");

    } catch (err: any) {
      alert("Erreur : " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoriesList = [
    { id: "vetement", name: "Vêtements 👕" },
    { id: "accessoire", name: "Accessoires 💍" },
    { id: "meuble", name: "Meubles 🪑" },
    { id: "enfant", name: "Enfants 🧸" },
    { id: "chine", name: "Produits de Chine 🇨🇳" },
    { id: "autre", name: "Autres 🛍️" },
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
          />

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded"
          />

          <input
            type="number"
            placeholder="Prix"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full p-2 border rounded"
          />

          <input
            type="number"
            placeholder="Stock"
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
            className="w-full p-2 border rounded"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 border rounded"
            disabled={isFromChina}
          >
            <option value="">Sélectionnez une catégorie</option>
            {categoriesList.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <input
            type="tel"
            placeholder="Numéro de téléphone du vendeur"
            value={sellerPhone}
            onChange={(e) => setSellerPhone(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />

          {/* Tailles */}
          <div>
            <h3 className="text-sm font-medium">Tailles</h3>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {sizesList.map((size) => (
                <label key={size} className="flex space-x-2 items-center">
                  <input
                    type="checkbox"
                    checked={selectedSizes.includes(size)}
                    onChange={() => toggleSize(size)}
                  />
                  <span>{size}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Couleurs */}
          <div>
            <h3 className="text-sm font-medium">Couleurs</h3>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {colorsList.map((c) => (
                <label key={c.name} className="flex space-x-2 items-center">
                  <input
                    type="checkbox"
                    checked={selectedColors.includes(c.name)}
                    onChange={() => toggleColor(c.name)}
                    style={{ accentColor: c.color }}
                  />
                  <span className="flex items-center gap-1">
                    <span
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: c.color }}
                    />
                    {c.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Upload */}
          <div
            {...getRootProps()}
            className="p-4 border-2 border-dashed rounded text-center cursor-pointer"
          >
            <input {...getInputProps()} />
            {isDragActive ? <p>Déposez les images...</p> : <p>Glissez-déposez ou cliquez</p>}
          </div>

          <div className="flex flex-wrap gap-4 mt-2">
            {previewUrls.map((url, i) => (
              <div key={i} className="relative">
                <img src={url} className="w-24 h-24 rounded object-cover" />
                <button
                  className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                  onClick={() => removeImage(i)}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Produit Chine */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isFromChina}
              onChange={handleChinaToggle}
            />
            <span>Produit de Chine 🇨🇳</span>
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white p-2 rounded w-full"
          >
            {isSubmitting ? "Publication..." : "Publier"}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default AddProductPage;
