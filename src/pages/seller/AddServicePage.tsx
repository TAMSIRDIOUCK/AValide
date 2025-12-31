// src/pages/seller/AddServicePage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../app/api/layout/Layout";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { Plus, X } from "lucide-react";

type UploadedImage = {
  file: File;
  previewUrl: string;
};

const SERVICE_CATEGORIES: { id: string; label: string }[] = [
  { id: "daily", label: "Services du quotidien" },
  { id: "menage", label: "Ménage & nettoyage" },
  { id: "repassage", label: "Repassage & entretien du linge" },
  { id: "cuisine", label: "Cuisine à domicile / traiteur" },
  { id: "livraison", label: "Livraison à domicile (courses, repas)" },
  { id: "babysitting", label: "Baby-sitting / garde d’enfants" },
  { id: "pet", label: "Garde d’animaux (pet-sitting, promenade)" },
  { id: "jardinage", label: "Jardinage / entretien des espaces verts" },
  { id: "bricolage", label: "Bricolage / petits travaux" },
  { id: "demenagement", label: "Déménagement / transport" },
  { id: "beauty", label: "Beauté & Bien-être" },
  { id: "coiffure", label: "Coiffure (hommes, femmes, enfants)" },
  { id: "tresses", label: "Tresses, mèches, locks" },
  { id: "manucure", label: "Manucure & pédicure" },
  { id: "maquillage", label: "Maquillage" },
  { id: "massage", label: "Massage & soins du corps" },
  { id: "esthetique", label: "Esthétique" },
  { id: "education", label: "Éducation & Formation" },
  { id: "coursparticuliers", label: "Cours particuliers" },
  { id: "soutien", label: "Soutien scolaire à domicile" },
  { id: "formationpro", label: "Formation professionnelle" },
  { id: "digital", label: "Services numériques" },
  { id: "web", label: "Création de sites web" },
  { id: "apps", label: "Développement d’applications" },
  { id: "graphisme", label: "Graphisme & design" },
  { id: "health", label: "Santé & Bien-être" },
  { id: "real_estate", label: "Immobilier & Habitat" },
  { id: "transport", label: "Transport & Mobilité" },
  { id: "event", label: "Événementiel" },
  { id: "commerce", label: "Commerce & Artisanat" },
  { id: "other", label: "Autres services utiles" },
];

const MAX_GALLERY = 6;

const AddServicePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [providerName, setProviderName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState(SERVICE_CATEGORIES[0].id);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [profileImage, setProfileImage] = useState<UploadedImage | null>(null);
  const [gallery, setGallery] = useState<UploadedImage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const handleProfileImageChange = (files: FileList | null) => {
    if (!files?.length) return;
    const file = files[0];
    const previewUrl = URL.createObjectURL(file);
    if (profileImage) URL.revokeObjectURL(profileImage.previewUrl);
    setProfileImage({ file, previewUrl });
  };

  const handleGalleryChange = (files: FileList | null) => {
    if (!files) return;
    const incoming = Array.from(files);
    const allowed = MAX_GALLERY - gallery.length;
    if (incoming.length > allowed) {
      alert(`Vous pouvez ajouter au maximum ${MAX_GALLERY} photos.`);
    }
    const toAdd = incoming.slice(0, allowed).map((f) => ({
      file: f,
      previewUrl: URL.createObjectURL(f),
    }));
    setGallery((prev) => [...prev, ...toAdd]);
  };

  const removeGalleryImage = (index: number) => {
    setGallery((prev) => {
      const copy = [...prev];
      const [removed] = copy.splice(index, 1);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return copy;
    });
  };

  const removeProfileImage = () => {
    if (profileImage) {
      URL.revokeObjectURL(profileImage.previewUrl);
      setProfileImage(null);
    }
  };

  // ✅ Upload vers le bucket `product-images`
  const uploadFileToSupabase = async (file: File, pathPrefix: string): Promise<string> => {
    const bucket = "product-images";
    const filenameSafe = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
    const path = `${pathPrefix}/${filenameSafe}`;

    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (error) {
      console.error("Erreur upload:", error.message);
      throw error;
    }

    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(path);
    return publicUrlData.publicUrl;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!user) return alert("Connectez-vous pour ajouter un service.");

    if (!providerName.trim() || !phone.trim() || !title.trim() || !category) {
      return alert("Champs obligatoires manquants : Nom, Téléphone, Titre, Catégorie.");
    }
    if (gallery.length > MAX_GALLERY) {
      return alert(`Max ${MAX_GALLERY} images autorisées.`);
    }

    setIsSubmitting(true);
    setUploadProgress("Téléversement...");

    try {
      let profile_image_url: string | null = null;
      if (profileImage) {
        profile_image_url = await uploadFileToSupabase(profileImage.file, `services/profile/${user.id}`);
      }

      const images_urls: string[] = [];
      for (let i = 0; i < gallery.length; i++) {
        const url = await uploadFileToSupabase(gallery[i].file, `services/gallery/${user.id}`);
        images_urls.push(url);
      }

      const { error } = await supabase.from("services").insert([
        {
          seller_id: user.id,
          name: providerName,
          phone,
          address: address || null,
          city: city || null,
          category,
          title,
          description: description || null,
          profile_image_url,
          images_urls,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error('Erreur détaillée lors de l’ajout du service dans Supabase:', error);
        alert(`Une erreur est survenue lors de l'ajout du service : ${error.message || 'Erreur inconnue'}`);
        throw error;
      }

      alert("✅ Service ajouté avec succès !");
      if (profileImage) URL.revokeObjectURL(profileImage.previewUrl);
      gallery.forEach((g) => URL.revokeObjectURL(g.previewUrl));
      navigate("/seller/services");
    } catch (err: any) {
      console.error("Erreur ajout service:", err);
      alert("Une erreur est survenue.");
    } finally {
      setUploadProgress(null);
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container-custom py-12 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">Ajouter un service</h1>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6">
          {/* Upload profile */}
          <div>
            <label className="block text-sm font-medium mb-2">Photo de profil</label>
            <div className="flex items-center gap-4">
              {profileImage ? (
                <div className="relative w-24 h-24">
                  <img src={profileImage.previewUrl} alt="preview" className="w-24 h-24 object-cover rounded-full border" />
                  <button type="button" onClick={removeProfileImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">Avatar</div>
              )}
              <input type="file" accept="image/*" onChange={(e) => handleProfileImageChange(e.target.files)} />
            </div>
          </div>

          {/* Infos prestataire */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label>Nom *</label><input type="text" value={providerName} onChange={(e) => setProviderName(e.target.value)} className="w-full border rounded px-3 py-2" /></div>
            <div><label>Téléphone *</label><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border rounded px-3 py-2" /></div>
            <div><label>Adresse</label><input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full border rounded px-3 py-2" /></div>
            <div><label>Ville</label><input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full border rounded px-3 py-2" /></div>
          </div>

          {/* Service */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label>Titre du service *</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border rounded px-3 py-2" /></div>
            <div>
              <label>Catégorie *</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border rounded px-3 py-2">
                {SERVICE_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} className="w-full border rounded px-3 py-2" />
          </div>

          {/* Gallery */}
          <div>
            <label>Photos du service (max {MAX_GALLERY})</label>
            <div className="flex gap-3 flex-wrap">
              {gallery.map((g, idx) => (
                <div key={idx} className="relative">
                  <img src={g.previewUrl} alt="" className="w-24 h-24 object-cover rounded" />
                  <button type="button" onClick={() => removeGalleryImage(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={14} /></button>
                </div>
              ))}
              {gallery.length < MAX_GALLERY && (
                <label className="w-24 h-24 border flex items-center justify-center cursor-pointer">
                  <input type="file" accept="image/*" multiple onChange={(e) => handleGalleryChange(e.target.files)} className="hidden" />
                  <Plus size={20} />
                </label>
              )}
            </div>
          </div>

          {uploadProgress && <div>{uploadProgress}</div>}

          <div className="flex justify-between">
            <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 border rounded" disabled={isSubmitting}>Annuler</button>
            <button type="submit" className={`px-6 py-2 rounded text-white ${isSubmitting ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`} disabled={isSubmitting}>
              {isSubmitting ? "Enregistrement..." : "Créer le service"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AddServicePage;
