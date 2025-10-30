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
  title: string; // Ajout de la propriété manquante 'title'
}

const ServiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Récupère l'ID depuis l'URL
  const [service, setService] = useState<Service | null>(null);

  useEffect(() => {
    const fetchService = async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Erreur récupération service:", error.message);
      } else {
        setService(data);
      }
    };

    fetchService();
  }, [id]);

  if (!service) {
    return <div className="p-6 text-center">Chargement du service...</div>;
  }

  return (
    <div className="container-custom py-16"> {/* Ajout de py-16 pour espacer le contenu du header */}
      <h1 className="text-3xl font-bold mb-6 text-center">{service.title}</h1> {/* Affichage du titre du service */}


      {/* Profil vendeur */}
      <div className="flex items-center space-x-4 mb-6">
        <img
          src={service.profile_image_url || "/images/default-profile.png"}
          alt={service.name}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div>
          <h2 className="text-2xl font-bold">{service.name}</h2>
          <p className="flex items-center text-gray-600">
            <MapPin size={16} className="mr-1" /> {service.address}
          </p>
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="flex space-x-4 mb-8">
        <a
          href={`tel:${service.phone}`}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600"
        >
          <Phone className="mr-2" size={18} /> Appeler
        </a>
        <a
          href={`https://wa.me/${service.phone}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600"
        >
          <MessageCircle className="mr-2" size={18} /> WhatsApp
        </a>
      </div>

      {/* Infos service */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Description du service</h3>
        <p className="text-gray-700">{service.description}</p>
      </div>

      {/* Galerie */}
      {service.images_urls && service.images_urls.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Photos du service</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {service.images_urls.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Service ${index + 1}`}
                className="w-full h-48 object-cover rounded-lg shadow"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceDetailPage;