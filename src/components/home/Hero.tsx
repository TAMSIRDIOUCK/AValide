
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaVolumeMute, FaVolumeUp } from 'react-icons/fa';

const Hero: React.FC = () => {
  const videoAds = [
    { id: 1, src: "/videos/v09044g40000chmhjtrc77u2nr6r4bjg.MP4" },
    { id: 2, src: "/videos/v09044g40000cqgjl1vog65h43efqcc0.MP4" },
    { id: 3, src: "/videos/v09044g40000cufkbufog65rnn06q2q0.MP4" },
    { id: 3, src: "/videos/v24044gl0000cuqebffog65qkuqjht9g.MP4"},
  ];

  const videoRefs = useRef<HTMLVideoElement[]>([]);
  const [mutedStates, setMutedStates] = useState<boolean[]>(
    videoAds.map(() => false) // son activé par défaut
  );

  const toggleMute = (index: number) => {
    setMutedStates((prev) => {
      const newStates = [...prev];
      newStates[index] = !newStates[index];
      return newStates;
    });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.9 } // doit être presque complètement visible pour jouer
    );

    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => {
      videoRefs.current.forEach((video) => {
        if (video) observer.unobserve(video);
      });
    };
  }, []);

  return (
    <div className="relative bg-gradient-to-r from-primary-dark to-primary overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-dark to-primary opacity-90"></div>
      </div>

      <div className="relative container-custom py-16 md:py-24">
        {/* Présentation */}
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4 animate-slide-up">
            Achetez et Vendez au Sénégal <br />
            Facilement et en Sécurité
          </h1>
          <p className="text-lg md:text-xl text-white opacity-90 mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            AValide est la meilleure plateforme pour acheter et vendre des produits et services au Sénégal. Paiement par WAV ou à la livraison.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <a
              href="#categories"
              className="inline-block px-6 py-3 bg-white text-primary font-semibold border border-primary rounded-2xl shadow hover:bg-primary hover:text-white transition duration-300 text-center"
            >
              Parcourir les catégories
            </a>
            <Link
              to="/seller/dashboard"
              className="btn bg-white text-primary hover:bg-gray-100 focus:ring-white text-center"
            >
              Commencer à vendre
            </Link>
          </div>
        </div>

        {/* Vidéos publicitaires */}
        <div className="mt-16">
          <h2 className="text-2xl font-semibold text-white mb-4">Publicités en vedette</h2>

          <div className="flex overflow-x-auto space-x-4 snap-x snap-mandatory scrollbar-hide pb-4">
            {videoAds.map((video, index) => (
              <div key={video.id} className="relative snap-center flex-shrink-0 w-full md:w-[500px]">
                <video
                  ref={(el) => {
                    if (el) videoRefs.current[index] = el;
                  }}
                  src={video.src}
                  loop
                  muted={mutedStates[index]}
                  className="w-full h-64 md:h-80 rounded-lg object-cover border-2 border-white"
                  playsInline
                  controls={false}
                />
                <button
                  onClick={() => toggleMute(index)}
                  className="absolute bottom-3 right-3 p-2 bg-white bg-opacity-80 rounded-full text-primary hover:bg-primary hover:text-white transition"
                >
                  {mutedStates[index] ? <FaVolumeMute size={20} /> : <FaVolumeUp size={20} />}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
