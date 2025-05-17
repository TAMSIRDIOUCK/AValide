import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { useDropzone } from 'react-dropzone';
import { categories } from '../../data/categories';
import { mockProducts } from '../../data/mockProducts';
import { Package, Upload, X } from 'lucide-react';

const EditProductPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const product = mockProducts.find(p => p.id === id);
    if (product) {
      setTitle(product.title);
      setDescription(product.description);
      setPrice(product.price.toString());
      setCategory(product.category);
      setStock(product.stock.toString());
      setPreviewUrls(product.images);
    }
    setIsLoading(false);
  }, [id]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setImages(prev => [...prev, ...acceptedFiles]);
    const urls = acceptedFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...urls]);
  }, []);

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => {
      if (!prev[index].startsWith('http')) {
        URL.revokeObjectURL(prev[index]);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 5242880,
    maxFiles: 5
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log('Updating product:', {
        id,
        title,
        description,
        price: parseFloat(price),
        category,
        stock: parseInt(stock),
        images: previewUrls
      });

      await new Promise(resolve => setTimeout(resolve, 1500));
      navigate('/seller/dashboard');
    } catch (error) {
      console.error('Error updating product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container-custom py-16">
          <div className="text-center">Chargement...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-custom py-16">
        <div className="flex items-center mb-8">
          <Package size={24} className="text-primary mr-3" />
          <h1 className="text-2xl font-bold">Modifier le produit</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="label">Titre du produit</label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input"
                required
                maxLength={100}
              />
            </div>

            <div>
              <label htmlFor="description" className="label">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input min-h-[120px]"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="price" className="label">Prix (FCFA)</label>
                <input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="input"
                  required
                  min="0"
                  step="1"
                />
              </div>

              <div>
                <label htmlFor="category" className="label">Catégorie</label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="input"
                  required
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="stock" className="label">Stock disponible</label>
                <input
                  id="stock"
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="input"
                  required
                  min="0"
                  step="1"
                />
              </div>
            </div>

            <div>
              <label className="label">Images du produit</label>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragActive 
                    ? 'border-primary bg-primary-light/10' 
                    : 'border-gray-300 hover:border-primary'
                }`}
              >
                <input {...getInputProps()} />
                <Upload 
                  size={32} 
                  className={`mx-auto mb-4 ${
                    isDragActive ? 'text-primary' : 'text-gray-400'
                  }`} 
                />
                {isDragActive ? (
                  <p className="text-primary">Déposez les images ici...</p>
                ) : (
                  <div className="text-gray-600">
                    <p className="font-medium">
                      Glissez-déposez des images ici ou cliquez pour sélectionner
                    </p>
                    <p className="text-sm mt-1">
                      PNG, JPG ou WEBP (max. 5MB par image)
                    </p>
                  </div>
                )}
              </div>

              {previewUrls.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {previewUrls.map((url, index) => (
                    <div key={url} className="relative group">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={16} className="text-error" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4 mt-8">
              <button
                type="button"
                onClick={() => navigate('/seller/dashboard')}
                className="rounded-2xl bg-gray-200 text-gray-700 hover:bg-gray-300 px-5 py-2.5 font-medium shadow-md transition-all"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-2xl bg-primary text-white hover:bg-primary-dark px-5 py-2.5 font-semibold shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Mise à jour...' : 'Mettre à jour le produit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default EditProductPage;
