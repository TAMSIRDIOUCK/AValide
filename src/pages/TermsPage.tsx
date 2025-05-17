import React from 'react';

const TermsPage = () => {
  return (
    <div className="container-custom py-10 px-4 md:px-8">



      <h1 className="text-3xl font-bold text-primary mb-6 text-center mt-12">Conditions Générales d’Utilisation</h1>

      <div className="max-w-3xl mx-auto space-y-6 text-neutral-700">

        {/* Introduction */}
        <p>
          Bienvenue sur <strong>AValide</strong>, la plateforme de commerce en ligne dédiée aux Sénégalais. En accédant à notre site ou en l’utilisant, vous acceptez les présentes conditions générales d’utilisation (CGU). Ces conditions sont mises en place pour garantir un cadre de confiance entre acheteurs, vendeurs et notre plateforme.
        </p>

        {/* Nature de la plateforme */}
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">🧩 Rôle d’AValide</h2>
          <p>
            AValide est une plateforme intermédiaire. Nous mettons en relation des vendeurs (professionnels ou particuliers) avec des acheteurs via une interface sécurisée et simple. Nous ne produisons, ne stockons, ni ne livrons de produits. 
          </p>
        </div>

        {/* Comptes et sécurité */}
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">🔐 Création et gestion de compte</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Vous êtes responsable des informations fournies lors de votre inscription.</li>
            <li>Ne partagez jamais vos identifiants avec une tierce personne.</li>
            <li>En cas d’utilisation suspecte de votre compte, contactez notre support immédiatement.</li>
          </ul>
        </div>

        {/* Commandes et paiements */}
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">💳 Commandes et paiements</h2>
          <p>
            Les paiements sur AValide peuvent se faire via <strong>WAV</strong> ou <strong>à la livraison</strong>. Nous vous encourageons à n'utiliser que les moyens de paiement disponibles sur notre plateforme pour garantir votre sécurité.
          </p>
        </div>

        {/* Responsabilités */}
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">⚠️ Responsabilités et limites</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>AValide ne garantit pas la qualité des produits vendus, ni les délais de livraison.</li>
            <li>En cas de litige, nous mettons à disposition un support pour faciliter la résolution entre parties.</li>
            <li>Les vendeurs sont seuls responsables de la conformité de leurs produits.</li>
          </ul>
        </div>

        {/* Comportements interdits */}
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">🚫 Ce qui est interdit</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>La vente de produits illégaux ou contrefaits</li>
            <li>Les fausses annonces ou descriptions trompeuses</li>
            <li>Le harcèlement ou l’usage abusif de la messagerie</li>
          </ul>
        </div>

        {/* Résiliation */}
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">🔚 Suspension ou suppression de compte</h2>
          <p>
            Nous nous réservons le droit de suspendre ou supprimer un compte en cas de non-respect de ces conditions, sans préavis.
          </p>
        </div>

        {/* Modification des CGU */}
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">📄 Mise à jour des conditions</h2>
          <p>
            Les présentes conditions peuvent être modifiées à tout moment. Nous vous conseillons de les consulter régulièrement. En continuant à utiliser AValide, vous acceptez ces changements.
          </p>
        </div>

        {/* Contact */}
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">📩 Contact</h2>
          <p>
            Pour toute question concernant ces conditions, écrivez-nous à <a href="mailto:legal@avalide.sn" className="text-primary underline">legal@avalide.sn</a>.
          </p>
        </div>

        {/* Mise à jour */}
        <p className="text-sm text-neutral-500 mt-6">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
        </p>
      </div>
    </div>
  );
};

export default TermsPage;

