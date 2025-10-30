import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import * as LucideIcons from "lucide-react";
import { useNavigate } from 'react-router-dom';

// ✅ Type manuel pour un service (au lieu de Database)
interface Service {
  id: string;
  seller_id: string;
  name: string;
  phone: string;
  address: string;
  category: string;
  description?: string;
  profile_image?: string;
  images_urls?: string[];
  created_at?: string;
}

// ✅ Catégories avec icônes adaptées
const SERVICE_CATEGORIES = [
  { id: "daily", label: "Services du quotidien", icon: "Calendar" },
  { id: "menage", label: "Ménage & nettoyage", icon: "Brush" },
  { id: "repassage", label: "Repassage & linge", icon: "Shirt" },
  { id: "cuisine", label: "Cuisine / Traiteur", icon: "Utensils" },
  { id: "livraison", label: "Livraison (courses, repas)", icon: "Truck" },
  { id: "babysitting", label: "Baby-sitting", icon: "Baby" },
  { id: "pet", label: "Animaux (pet-sitting)", icon: "Dog" },
  { id: "jardinage", label: "Jardinage", icon: "Leaf" },
  { id: "bricolage", label: "Bricolage", icon: "Hammer" },
  { id: "demenagement", label: "Déménagement", icon: "Package" },
  { id: "beauty", label: "Beauté & Bien-être", icon: "Heart" },
  { id: "coiffure", label: "Coiffure", icon: "Scissors" },
  { id: "tresses", label: "Tresses / Locks", icon: "ScissorsSquare" },
  { id: "manucure", label: "Manucure & pédicure", icon: "Hand" },
  { id: "maquillage", label: "Maquillage", icon: "Palette" },
  { id: "massage", label: "Massage & soins", icon: "Hand" },
  { id: "education", label: "Éducation & Formation", icon: "BookOpen" },
  { id: "coursparticuliers", label: "Cours particuliers", icon: "GraduationCap" },
  { id: "soutien", label: "Soutien scolaire", icon: "Notebook" },
  { id: "digital", label: "Services numériques", icon: "Laptop" },
  { id: "web", label: "Création de sites", icon: "Globe" },
  { id: "apps", label: "Applications", icon: "Smartphone" },
  { id: "graphisme", label: "Graphisme & design", icon: "PenTool" },
  { id: "health", label: "Santé & Bien-être", icon: "Stethoscope" },
  { id: "real_estate", label: "Immobilier & Habitat", icon: "Home" },
  { id: "transport", label: "Transport & Mobilité", icon: "Car" },
  { id: "event", label: "Événementiel", icon: "PartyPopper" },
  { id: "commerce", label: "Commerce & Artisanat", icon: "ShoppingBag" },
  { id: "other", label: "Autres services utiles", icon: "HelpCircle" },
];

const CategorySection: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const navigate = useNavigate(); // Ajout du hook useNavigate pour la navigation

  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase.from("services").select("*");
      if (error) {
        console.error("Erreur lors de la récupération des services:", error.message);
      } else {
        setServices(data || []);
      }
    };

    fetchServices();
  }, []);

  // ✅ Récupère l’icône adaptée
  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName];
    return Icon ? (
      <Icon size={32} className="text-primary" />
    ) : (
      <LucideIcons.HelpCircle size={32} className="text-gray-400" />
    );
  };

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/category/${categoryId}`); // Redirection vers la page de la catégorie
  };

  return (
    <section id="services" className="py-24 bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Parcourir par Service</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explorez notre large sélection de services disponibles pour répondre à vos besoins.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {SERVICE_CATEGORIES.map((category) => (
            <div
              key={category.id}
              onClick={() => handleCategoryClick(category.id)} // Ajout de l'événement onClick
              className="bg-neutral-50 rounded-lg p-6 text-center transition duration-300 hover:shadow-md hover:bg-neutral-100 hover:scale-105 cursor-pointer"
            >
              <div className="mb-3 mx-auto w-16 h-16 flex items-center justify-center bg-primary-light/10 rounded-full">
                {getIcon(category.icon)}
              </div>
              <h3 className="font-semibold text-lg mb-1">{category.label}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
