import React from 'react';

const PrivacyPage = () => {
  return (
    <div className="container-custom py-10 px-4 md:px-8">
      <h1 className="text-3xl font-bold text-primary mb-6 text-center mt-12">Politique de confidentialité</h1>

      <div className="max-w-3xl mx-auto space-y-6 text-neutral-700">

        <p>
          Chez <strong>AValide</strong>, la sécurité et la confidentialité de vos données sont une priorité. Nous nous engageons à respecter votre vie privée et à protéger les informations personnelles que vous nous confiez.
        </p>

        {/* Données collectées */}
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">📋 Quelles données collectons-nous ?</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Nom complet</li>
            <li>Adresse e-mail (facultative)</li>
            <li>Numéro de téléphone</li>
            <li>Adresse de livraison</li>
            <li>Historique de commandes</li>
          </ul>
        </div>

        {/* Utilisation des données */}
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">💼 Comment utilisons-nous vos informations ?</h2>
          <p>
            Les informations que vous nous fournissez sont utilisées uniquement dans le but de :
          </p>
          <ul className="list-disc pl-5 mt-2">
            <li>Traiter et livrer vos commandes</li>
            <li>Vous contacter en cas de besoin (confirmation, livraison, etc.)</li>
            <li>Améliorer notre service et l'expérience utilisateur</li>
            <li>Envoyer des notifications si vous y avez consenti</li>
          </ul>
        </div>

        {/* Partage avec des tiers */}
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">🤝 Partageons-nous vos données ?</h2>
          <p>
            Non. <strong>AValide ne vend, ne loue et ne partage jamais vos données</strong> avec des tiers à des fins commerciales.
            Vos données peuvent uniquement être partagées avec les vendeurs pour assurer la livraison ou répondre à votre demande.
          </p>
        </div>

        {/* Sécurité */}
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">🔐 Sécurité de vos informations</h2>
          <p>
            Nous utilisons des mesures de sécurité techniques et organisationnelles pour protéger vos données contre tout accès non autorisé, perte ou vol.
            Notre site est régulièrement mis à jour et sécurisé.
          </p>
        </div>

        {/* Vos droits */}
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">📝 Vos droits</h2>
          <p>
            Vous avez le droit de :
          </p>
          <ul className="list-disc pl-5 mt-2">
            <li>Consulter les données que nous avons sur vous</li>
            <li>Demander leur modification ou suppression</li>
            <li>Retirer votre consentement à tout moment</li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">📩 Contact</h2>
          <p>
            Pour toute question concernant vos données ou cette politique, vous pouvez nous contacter à :
            <br />
            <a href="mailto:support@avalide.sn" className="text-primary underline">support@avalide.sn</a>
          </p>
        </div>

        {/* Mise à jour */}
        <div>
          <p className="text-sm text-neutral-500 mt-6">
            Cette politique peut être mise à jour. Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>

      </div>
    </div>
  );
};

export default PrivacyPage;

