import React, { useEffect } from 'react';

const FaqPage = () => {
  // Ajout d'un effet pour faire défiler la page vers le haut lors du chargement
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container-custom py-10 px-4 md:px-8">



<h1 className="text-3xl font-bold text-primary mb-6 text-center mt-12">
  Foire aux Questions (FAQ)
</h1>

      <div className="space-y-8 text-neutral-700 max-w-3xl mx-auto">

        {/* Question 1 */}
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">❓ Comment fonctionne AValide ?</h2>
          <p>
            AValide est une plateforme 100% sénégalaise qui connecte acheteurs et vendeurs en toute sécurité.
            Vous pouvez parcourir les produits, contacter les vendeurs et commander facilement avec des paiements adaptés à notre réalité : via WAV ou à la livraison.
          </p>
        </div>

        {/* Question 2 */}
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">📦 Puis-je suivre ma commande ?</h2>
          <p>
            Oui. Une fois la commande passée, le vendeur est immédiatement notifié. Il vous contactera via téléphone ou message pour convenir de la livraison.
            Nous encourageons les vendeurs à proposer un suivi simple et transparent.
          </p>
        </div>

        {/* Question 3 */}
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">📞 Que faire si j’ai un souci avec un vendeur ou un produit ?</h2>
          <p>
            Vous pouvez nous contacter via la page <strong>Contact</strong> ou écrire à <a href="mailto:support@avalide.sn" className="text-primary underline">support@avalide.sn</a>. 
            Nous analysons chaque cas pour garantir une expérience juste et transparente pour tous.
          </p>
        </div>

        {/* Question 4 */}
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">💸 Quels sont les moyens de paiement disponibles ?</h2>
          <p>
            Actuellement, nous proposons :
            <ul className="list-disc pl-5 mt-2">
              <li><strong>AValide_pay</strong> (wallet numérique local, rapide et sécurisé)</li>
              <li><strong>À la livraison</strong> (paiement en espèces à réception)</li>
            </ul>
            Nous travaillons à intégrer d'autres moyens de paiement très bientôt.
          </p>
        </div>

        {/* Question 5 */}
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">🔐 Mes informations personnelles sont-elles protégées ?</h2>
          <p>
            Oui, absolument. Vos données ne sont jamais revendues ni partagées sans votre consentement.
            Consultez notre <a href="/privacy" className="text-primary underline">Politique de confidentialité</a> pour plus de détails.
          </p>
        </div>

        {/* Question 6 */}
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">⏱️ Combien de temps faut-il pour recevoir ma commande ?</h2>
          <p>
            Cela dépend du vendeur et de votre localisation. En général, les livraisons à Dakar prennent entre 1 à 3 jours.
            En dehors de Dakar, cela peut prendre un peu plus de temps. Le vendeur vous contactera pour convenir du jour et de l'heure.
          </p>
        </div>

        {/* Question 7 */}
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">🚫 Et si le produit ne correspond pas à ma commande ?</h2>
          <p>
            Si un produit reçu ne correspond pas à votre commande (ex : mauvais article, défectueux, etc.), contactez immédiatement le vendeur.
            Si aucun accord n’est trouvé, vous pouvez signaler le problème à AValide. Nous intervenons dans les cas avérés de non-respect des règles.
          </p>
        </div>

      </div>
    </div>
  );
};

export default FaqPage;
