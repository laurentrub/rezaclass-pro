import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-4">Conditions Générales d'Utilisation</h1>
        <p className="text-muted-foreground mb-8">Dernière mise à jour : 1er décembre 2025</p>
        
        <div className="space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Présentation du Service</h2>
            <p>
              Rezaclass est une plateforme de mise en relation entre propriétaires de biens immobiliers 
              destinés à la location saisonnière et voyageurs à la recherche d'un hébergement en France. 
              En utilisant notre service, vous acceptez les présentes conditions générales.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Inscription et Compte Utilisateur</h2>
            <p className="mb-3">
              Pour réserver une propriété, vous devez créer un compte utilisateur. Vous vous engagez à :
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Fournir des informations exactes, complètes et à jour</li>
              <li>Maintenir la confidentialité de vos identifiants de connexion</li>
              <li>Notifier immédiatement toute utilisation non autorisée de votre compte</li>
              <li>Être responsable de toutes les activités effectuées depuis votre compte</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Réservations et Paiements</h2>
            <p className="mb-3">
              <strong>3.1 Processus de Réservation :</strong> Toute réservation est soumise à l'acceptation 
              du propriétaire. Une réservation n'est confirmée qu'après validation du paiement.
            </p>
            <p className="mb-3">
              <strong>3.2 Prix :</strong> Les prix affichés incluent le prix de la nuitée, les frais de ménage 
              et les frais de service. Les taxes de séjour peuvent s'appliquer en supplément.
            </p>
            <p className="mb-3">
              <strong>3.3 Modalités de Paiement :</strong> Le paiement s'effectue par virement bancaire. 
              Vous recevrez les coordonnées bancaires par email après validation de votre réservation.
            </p>
            <p>
              <strong>3.4 Preuve de Paiement :</strong> Vous devez télécharger une preuve de paiement 
              (capture d'écran ou reçu bancaire) via votre espace client ou le lien reçu par email.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Annulation et Remboursement</h2>
            <p className="mb-3">
              Les conditions d'annulation varient selon la propriété réservée. En règle générale :
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Annulation plus de 30 jours avant l'arrivée : remboursement intégral</li>
              <li>Annulation entre 30 et 14 jours avant l'arrivée : remboursement à 50%</li>
              <li>Annulation moins de 14 jours avant l'arrivée : aucun remboursement</li>
            </ul>
            <p className="mt-3">
              Les frais de service ne sont pas remboursables. Le propriétaire peut définir des conditions 
              d'annulation spécifiques affichées sur la page de la propriété.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Obligations des Voyageurs</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Respecter le règlement intérieur de la propriété</li>
              <li>Traiter la propriété avec soin et respect</li>
              <li>Respecter le nombre maximum d'occupants autorisé</li>
              <li>Ne pas sous-louer ou organiser des événements non autorisés</li>
              <li>Laisser la propriété dans l'état initial (sauf accord contraire)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Responsabilités</h2>
            <p className="mb-3">
              <strong>6.1 Rezaclass :</strong> En tant qu'intermédiaire, Rezaclass n'est pas responsable 
              de la qualité, la sécurité ou la légalité des propriétés annoncées. Notre rôle se limite à 
              la mise en relation entre voyageurs et propriétaires.
            </p>
            <p className="mb-3">
              <strong>6.2 Propriétaires :</strong> Les propriétaires sont responsables de l'exactitude des 
              descriptions, de la conformité légale de leur propriété et de la qualité du service fourni.
            </p>
            <p>
              <strong>6.3 Voyageurs :</strong> Les voyageurs sont responsables de tout dommage causé à la 
              propriété pendant leur séjour et doivent souscrire une assurance voyage appropriée.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Avis et Commentaires</h2>
            <p>
              Les voyageurs peuvent laisser un avis après leur séjour. Les avis doivent être honnêtes, 
              constructifs et respectueux. Rezaclass se réserve le droit de supprimer tout contenu inapproprié, 
              diffamatoire ou frauduleux.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Propriété Intellectuelle</h2>
            <p>
              Tous les contenus présents sur la plateforme (textes, images, logos, graphismes) sont la 
              propriété de Rezaclass ou de ses partenaires et sont protégés par les lois sur la propriété 
              intellectuelle. Toute reproduction non autorisée est interdite.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Modification des CGU</h2>
            <p>
              Rezaclass se réserve le droit de modifier les présentes conditions générales à tout moment. 
              Les modifications prennent effet dès leur publication sur le site. Il est de votre responsabilité 
              de consulter régulièrement ces conditions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Droit Applicable et Juridiction</h2>
            <p>
              Les présentes conditions générales sont régies par le droit français. Tout litige relatif à 
              leur interprétation ou leur exécution relève de la compétence exclusive des tribunaux français.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">11. Contact</h2>
            <p>
              Pour toute question concernant ces conditions générales, vous pouvez nous contacter à 
              l'adresse : <a href="mailto:legal@rezaclass.fr" className="text-primary hover:underline">legal@rezaclass.fr</a>
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfService;
