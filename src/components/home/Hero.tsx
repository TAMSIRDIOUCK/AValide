import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaVolumeMute, FaVolumeUp } from 'react-icons/fa';

const Hero: React.FC = () => {
  const videoAds = [
    {
      id: 1,
      src: "/videos/ScreenRecording_07-25-2025 01-47-46_1.mov",
      poster: "/videos/IMG_1706.jpg",
    },
    {
      id: 2,
      src: "/videos/ScreenRecording_07-25-2025 02-07-18_1.mov",
      poster: "/videos/IMG_1712.jpg",
    },
    {
      id: 3,
      src: "/videos/ScreenRecording_07-25-2025 02-11-38_1.mov",
      poster: "/videos/IMG_1721.jpg",
    },
    {
      id: 4,
      src: "/videos/v24044gl0000cuqebffog65qkuqjht9g.MP4",
      poster: "/videos/IMG_1330.jpg",
    },
  ];

  const featuredImages = [
    "/videos/IMG_1706.jpg",
    "/videos/IMG_1707.jpg",
    "/videos/IMG_1708.jpg",
    "/videos/IMG_1710.jpg",
    "/videos/IMG_1711.jpg",
    "/videos/IMG_1712.jpg",
    "/videos/IMG_1713.jpg",
    "/videos/IMG_1716.jpg",
    "/videos/IMG_1717.jpg",
    "/videos/IMG_1718.jpg",
    "/videos/IMG_1719.jpg",
    "/videos/IMG_1720.jpg",
    "/videos/IMG_1721.jpg",
    // Tu peux en ajouter autant que tu veux ici
  ];

  const videoRefs = useRef<HTMLVideoElement[]>([]);
  const [mutedStates, setMutedStates] = useState<boolean[]>(
    videoAds.map(() => false)
  );

  const location = useLocation();

  useEffect(() => {
    const savedPosition = sessionStorage.getItem("homeScrollPos");
    if (savedPosition && location.pathname === "/") {
      window.scrollTo(0, parseInt(savedPosition, 10));
      sessionStorage.removeItem("homeScrollPos");
    }
  }, [location.pathname]);

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
      { threshold: 0.9 }
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

  const saveScrollPosition = () => {
    sessionStorage.setItem("homeScrollPos", window.scrollY.toString());
  };

  return (
    <div className="bg-white">
      {/* Vidéos publicitaires */}
      <div className="w-full overflow-x-auto flex space-x-4 snap-x snap-mandatory scrollbar-hide">
        {videoAds.map((video, index) => (
          <div key={video.id} className="snap-center flex-shrink-0 w-full md:w-[500px] relative">
            <video
              ref={(el) => {
                if (el) videoRefs.current[index] = el;
              }}
              src={video.src}
              loop
              muted={mutedStates[index]}
              className="w-full h-64 md:h-80 object-cover"
              poster={video.poster}
              playsInline
              controls={false}
              preload="metadata"
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

      {/* Texte + boutons */}
      <div className="container-custom py-10 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-black mb-4">
          Achetez et Vendez au Sénégal Facilement et en Sécurité
        </h1>
        <p className="text-base md:text-lg text-gray-700 mb-6">
          Paiement par AValide_pay ou à la livraison.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <a
            href="#categories"
            onClick={saveScrollPosition}
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-2xl shadow hover:bg-green-700 transition"
          >
            Acheter
          </a>
          <Link
            to="/seller/dashboard"
            onClick={saveScrollPosition}
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-2xl shadow hover:bg-green-700 transition"
          >
            Vendre
          </Link>
        </div>
      </div>

      {/* Produits en vedette - défilement automatique & manuel */}
      <div className="bg-white pt-4 pb-0 -mb-4">
        <h2 className="text-xl md:text-2xl font-semibold text-center text-gray-800 mb-4">
          Produits en vedette
        </h2>
        <div className="overflow-x-auto whitespace-nowrap scrollbar-hide relative">
          <div className="flex gap-4 px-4 animate-slide-horizontal hover:pause">
            {featuredImages.concat(featuredImages).map((src, index) => (
              <img
                key={index}
                src={src}
                alt={`Produit ${index + 1}`}
                className="h-48 w-auto object-contain flex-shrink-0 rounded-xl transition-transform duration-300 hover:scale-105"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
