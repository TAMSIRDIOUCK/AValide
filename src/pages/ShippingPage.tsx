import React from 'react';

const ShippingPage = () => {
  return (
    <div className="container-custom py-10 px-4 md:px-8">
      <h1 className="text-3xl font-bold text-primary mb-6 text-center mt-12">Informations sur la Livraison</h1>

      <div className="max-w-3xl mx-auto space-y-6 text-neutral-700">

        {/* Introduction */}
        <p>
          Chez <strong>AValide</strong>, nous voulons que votre expérience d'achat soit simple, rapide et fiable. Pour cela, nous permettons aux vendeurs de choisir les options de livraison les plus adaptées à leurs produits et à votre localisation.
        </p>

        {/* Modes de livraison */}
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">🚚 Modes de livraison disponibles</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Livraison à domicile :</strong> votre commande vous est livrée directement à votre adresse par le vendeur ou son prestataire.</li>
            <li><strong>Point de rendez-vous :</strong> certains vendeurs proposent de fixer un lieu de retrait sécurisé.</li>
            <li><strong>Retrait en boutique ou au marché :</strong> si le vendeur a un point de vente physique, vous pouvez y retirer votre commande.</li>
          </ul>
        </div>

        {/* Délais de livraison */}
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">⏱ Délais estimés</h2>
          <p>
            Les délais peuvent varier selon :
          </p>
          <ul className="list-disc pl-5 mt-2">
            <li>La localisation du vendeur</li>
            <li>La disponibilité du produit</li>
            <li>La méthode de livraison choisie</li>
          </ul>
          <p className="mt-2">En général, les livraisons sont effectuées sous 1 à 5 jours ouvrables.</p>
        </div>

        {/* Tarification */}
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">💳 Frais de livraison</h2>
          <p>
            Les frais sont fixés par chaque vendeur et s'affichent lors du passage de la commande. Certains vendeurs peuvent offrir la livraison gratuite à partir d’un certain montant d’achat.
          </p>
        </div>

        {/* Suivi de commande */}
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">📦 Suivi et contact</h2>
          <p>
            Vous recevrez les coordonnées du vendeur une fois votre commande validée. Vous pourrez le contacter pour suivre l’état de la livraison ou poser des questions.
          </p>
        </div>

        {/* Responsabilité */}
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">⚠️ Responsabilité d’AValide</h2>
          <p>
            AValide est une plateforme facilitatrice. Nous mettons en relation acheteurs et vendeurs, mais nous ne gérons pas directement la livraison.
            En cas de problème, nous vous encourageons à contacter le vendeur. Si une situation grave se présente, notre service client reste à votre écoute.
          </p>
        </div>

        {/* Conseils pour une bonne réception */}
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">📌 Conseils pour une livraison réussie</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Vérifiez que votre numéro de téléphone est correct</li>
            <li>Indiquez clairement votre adresse et tout point de repère utile</li>
            <li>Restez joignable les jours suivant votre commande</li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">📩 Besoin d’aide ?</h2>
          <p>
            Contactez-nous à <a href="mailto:support@avalide.sn" className="text-primary underline">support@avalide.sn</a> si vous avez un problème lié à la livraison ou à un vendeur injoignable.
          </p>
        </div>

        {/* Mise à jour */}
        <div>
          <p className="text-sm text-neutral-500 mt-6">
            Cette page a été mise à jour le {new Date().toLocaleDateString('fr-FR')}.
          </p>
        </div>

      </div>
    </div>
  );
};

export default ShippingPage;

