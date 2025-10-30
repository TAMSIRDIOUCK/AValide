import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

const CategoryPage: React.FC = () => {
  const { id } = useParams(); // Récupérer l'ID de la catégorie depuis l'URL
  const [services, setServices] = useState<any[]>([]);
  const navigate = useNavigate(); // Pour la navigation programmatique

  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('category', id);

      if (error) {
        console.error('Erreur lors de la récupération des services:', error.message);
      } else {
        setServices(data || []);
      }
    };

    fetchServices();
  }, [id]);

  const handleServiceClick = (serviceId: string) => {
    navigate(`/services/${serviceId}`); // Redirection vers ServiceDetailPage
  };

  return (
    <div className="container mx-auto py-16">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Services pour la catégorie : {id}
      </h1>
      <p className="text-center text-gray-500 mb-4">
        Nom de la catégorie : {id}
      </p>

      {services.length === 0 ? (
        <p className="text-center text-gray-500">
          Aucun service disponible pour cette catégorie.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              onClick={() => handleServiceClick(service.id)}
              className="flex items-center gap-4 p-4 border rounded-lg shadow hover:shadow-md transition cursor-pointer"
            >
              <img
                src={service.profile_image_url || '/default-profile.png'}
                alt={service.provider_name || service.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h2 className="text-lg font-semibold">
                  {service.provider_name || service.name || 'Nom non spécifié'}
                </h2>
                <p className="text-sm text-gray-500">Service : {service.title}</p>
                <p className="text-sm text-gray-500">
                  Adresse : {service.address || 'Non spécifiée'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
