import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { Phone, MessageCircle, MapPin } from "lucide-react";

interface Service {
  id: string;
  seller_id: string;
  name: string;
  phone: string;
  address: string;
  category: string;
  description: string | null;
  profile_image_url: string | null;
  images_urls: string[];
  created_at: string;
  title: string;
}

const ServiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // ID du service depuis l'URL
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchService = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Erreur lors de la récupération du service :", error.message);
      } else {
        setService(data);
      }
      setLoading(false);
    };

    if (id) fetchService();
  }, [id]);

  if (loading) {
    return <div className="p-6 text-center text-gray-600">Chargement du service...</div>;
  }

  if (!service) {
    return <div className="p-6 text-center text-red-500">Service introuvable.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Titre du service */}
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        {service.title}
      </h1>

      {/* Informations du vendeur */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-4 mb-6">
        <img
          src={service.profile_image_url || "/images/default-profile.png"}
          alt={service.name}
          className="w-20 h-20 rounded-full object-cover border shadow"
        />
        <div className="text-center sm:text-left mt-4 sm:mt-0">
          <h2 className="text-2xl font-semibold">{service.name}</h2>
          <p className="flex items-center justify-center sm:justify-start text-gray-600 mt-1">
            <MapPin size={16} className="mr-1" /> {service.address}
          </p>
        </div>
      </div>

      {/* Boutons d’action */}
      <div className="flex justify-center sm:justify-start space-x-4 mb-10">
        <a
          href={`tel:${service.phone}`}
          className="flex items-center px-5 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition"
        >
          <Phone className="mr-2" size={18} /> Appeler
        </a>

        <a
          href={`https://wa.me/${service.phone}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center px-5 py-2 bg-green-600 text-white rounded-xl shadow hover:bg-green-700 transition"
        >
          <MessageCircle className="mr-2" size={18} /> WhatsApp
        </a>
      </div>

      {/* Description */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2 text-gray-800">
          Description du service
        </h3>
        <p className="text-gray-700 leading-relaxed">
          {service.description || "Aucune description disponible."}
        </p>
      </div>

      {/* Galerie d’images */}
      {service.images_urls && service.images_urls.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            Photos du service
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {service.images_urls.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Photo du service ${index + 1}`}
                className="w-full h-48 object-cover rounded-lg shadow-md hover:scale-105 transition-transform"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceDetailPage;
