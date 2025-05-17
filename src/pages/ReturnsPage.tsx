import React from 'react';

const ReturnsPage = () => {
  return (
    <div className="container-custom py-10 px-4 md:px-8">
      <h1 className="text-3xl font-bold text-primary mb-6 text-center mt-12">Retours & Remboursements</h1>

      <div className="max-w-3xl mx-auto space-y-6 text-neutral-700">

        <p>
          Chez <strong>AValide</strong>, nous souhaitons que votre expérience d'achat soit satisfaisante. Cependant, étant donné que chaque vendeur est responsable de ses produits, les retours et remboursements dépendent de leurs politiques spécifiques.
        </p>

        {/* Politique générale */}
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">🔁 Politique générale</h2>
          <p>
            AValide n'impose pas une politique de retour unique. Toutefois, les vendeurs peuvent choisir d'offrir une garantie de satisfaction. Si tel est le cas, cela sera clairement indiqué sur la page du produit.
          </p>
        </div>

        {/* Cas acceptés */}
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">📦 Dans quels cas un retour est-il possible ?</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Produit reçu endommagé ou cassé</li>
            <li>Produit non conforme à la description (modèle, taille, couleur)</li>
            <li>Produit manquant dans la commande</li>
          </ul>
        </div>

        {/* Démarches à suivre */}
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">📝 Que faire si vous avez un problème ?</h2>
          <p>
            Si vous rencontrez un problème avec un article :
          </p>
          <ul className="list-disc pl-5 mt-2">
            <li>Contactez directement le vendeur via la messagerie ou ses coordonnées</li>
            <li>Fournissez des preuves (photos, description, numéro de commande)</li>
            <li>Discutez des modalités de retour ou de remboursement</li>
          </ul>
        </div>

        {/* Frais et délais */}
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">💰 Frais et délais</h2>
          <p>
            Les frais de retour sont à la charge de l’acheteur sauf indication contraire du vendeur. Le remboursement, s’il est accepté, sera effectué dans un délai maximum de 7 jours après validation.
          </p>
        </div>

        {/* Limites */}
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">⚠️ Produits non remboursables</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Articles personnalisés ou faits sur mesure</li>
            <li>Produits hygiéniques (ex : sous-vêtements, cosmétiques)</li>
            <li>Produits alimentaires ou périssables</li>
          </ul>
        </div>

        {/* Rôle d’AValide */}
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">🤝 Le rôle d’AValide</h2>
          <p>
            AValide facilite les transactions mais ne peut pas garantir les décisions des vendeurs. Nous restons cependant à votre écoute en cas de litige grave.
            Vous pouvez nous contacter si vous pensez qu'un vendeur agit de manière abusive.
          </p>
        </div>

        {/* Contact */}
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">📩 Besoin d'aide ?</h2>
          <p>
            Écrivez-nous à <a href="mailto:support@avalide.sn" className="text-primary underline">support@avalide.sn</a> pour toute question ou signalement.
          </p>
        </div>

        {/* Mise à jour */}
        <div>
          <p className="text-sm text-neutral-500 mt-6">
            Cette politique peut évoluer. Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>

      </div>
    </div>
  );
};

export default ReturnsPage;

