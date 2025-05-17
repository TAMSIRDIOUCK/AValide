import React from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Amadou Diop',
    role: 'Acheteur',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    content: 'AValide a complètement changé ma façon d\'acheter en ligne. Le paiement par WAV est super pratique et la livraison est toujours rapide. Je recommande vivement !',
    rating: 5
  },
  {
    id: 2,
    name: 'Fatou Ndiaye',
    role: 'Vendeuse',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    content: 'Depuis que j\'ai commencé à vendre sur AValide, mon entreprise a connu une croissance incroyable. La plateforme est facile à utiliser et l\'équipe de support est très réactive.',
    rating: 5
  },
  {
    id: 3,
    name: 'Omar Sall',
    role: 'Acheteur',
    avatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    content: 'Je suis impressionné par la qualité des produits et la fiabilité du service. Le paiement à la livraison m\'a convaincu d\'essayer, et je ne regrette pas mon choix !',
    rating: 4
  }
];

const Testimonials: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Ce que disent nos clients</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Découvrez les témoignages de nos acheteurs et vendeurs satisfaits qui utilisent AValide pour leur commerce en ligne.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white rounded-lg shadow-md p-6 relative">
              <div className="absolute top-6 right-6 text-primary opacity-20">
                <Quote size={48} />
              </div>
              
              <div className="flex items-center mb-4">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name} 
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
              
              <div className="flex text-yellow-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={16} 
                    fill={i < testimonial.rating ? "currentColor" : "none"} 
                    className={i < testimonial.rating ? "" : "text-gray-300"} 
                  />
                ))}
              </div>
              
              <p className="text-gray-700 relative z-10">{testimonial.content}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;