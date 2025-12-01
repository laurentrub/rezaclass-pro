import { Navigation } from "@/components/Navigation";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-4">Politique de Confidentialité</h1>
        <p className="text-muted-foreground mb-8">Dernière mise à jour : 1er décembre 2025</p>
        
        <div className="space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
            <p>
              Rezaclass s'engage à protéger la vie privée de ses utilisateurs. Cette politique de confidentialité 
              décrit comment nous collectons, utilisons, stockons et protégeons vos données personnelles conformément 
              au Règlement Général sur la Protection des Données (RGPD).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Données Collectées</h2>
            <p className="mb-3">Nous collectons les types de données suivantes :</p>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">2.1 Données d'identification</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Nom et prénom</li>
                  <li>Adresse email</li>
                  <li>Numéro de téléphone</li>
                  <li>Adresse postale (si nécessaire pour la réservation)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">2.2 Données de réservation</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Dates de séjour</li>
                  <li>Nombre de voyageurs</li>
                  <li>Demandes spéciales</li>
                  <li>Historique de réservations</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">2.3 Données de paiement</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Coordonnées bancaires (pour les propriétaires uniquement)</li>
                  <li>Preuves de paiement téléchargées</li>
                  <li>Historique des transactions</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">2.4 Données de navigation</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Adresse IP</li>
                  <li>Type de navigateur</li>
                  <li>Pages consultées</li>
                  <li>Cookies et traceurs</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Utilisation des Données</h2>
            <p className="mb-3">Vos données sont utilisées pour :</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Traiter et confirmer vos réservations</li>
              <li>Communiquer avec vous concernant vos réservations</li>
              <li>Gérer votre compte utilisateur</li>
              <li>Améliorer nos services et votre expérience</li>
              <li>Envoyer des communications marketing (avec votre consentement)</li>
              <li>Prévenir la fraude et assurer la sécurité de la plateforme</li>
              <li>Respecter nos obligations légales et réglementaires</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Partage des Données</h2>
            <p className="mb-3">
              Nous ne vendons jamais vos données personnelles. Nous pouvons partager vos données avec :
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Les propriétaires :</strong> pour faciliter votre réservation et votre séjour</li>
              <li><strong>Les prestataires de services :</strong> qui nous aident à opérer notre plateforme 
                (hébergement, paiement, email)</li>
              <li><strong>Les autorités légales :</strong> si la loi l'exige ou pour protéger nos droits</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Conservation des Données</h2>
            <p>
              Nous conservons vos données personnelles aussi longtemps que nécessaire pour fournir nos services 
              et respecter nos obligations légales. Les données de réservation sont conservées pendant 5 ans après 
              la fin du séjour. Les données comptables sont conservées 10 ans conformément aux obligations légales.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Vos Droits</h2>
            <p className="mb-3">Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Droit d'accès :</strong> obtenir une copie de vos données personnelles</li>
              <li><strong>Droit de rectification :</strong> corriger vos données inexactes ou incomplètes</li>
              <li><strong>Droit à l'effacement :</strong> demander la suppression de vos données</li>
              <li><strong>Droit à la limitation :</strong> limiter le traitement de vos données</li>
              <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré</li>
              <li><strong>Droit d'opposition :</strong> vous opposer au traitement de vos données</li>
              <li><strong>Droit de retrait :</strong> retirer votre consentement à tout moment</li>
            </ul>
            <p className="mt-3">
              Pour exercer ces droits, contactez-nous à : <a href="mailto:privacy@rezaclass.fr" className="text-primary hover:underline">privacy@rezaclass.fr</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Sécurité des Données</h2>
            <p>
              Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos 
              données contre tout accès non autorisé, modification, divulgation ou destruction. Cela inclut le 
              chiffrement des données sensibles, des contrôles d'accès stricts et des audits de sécurité réguliers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Cookies</h2>
            <p className="mb-3">
              Notre site utilise des cookies pour améliorer votre expérience. Les cookies sont de petits fichiers 
              stockés sur votre appareil. Nous utilisons :
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Cookies essentiels :</strong> nécessaires au fonctionnement du site</li>
              <li><strong>Cookies de préférence :</strong> mémorisent vos choix (langue, devise)</li>
              <li><strong>Cookies analytiques :</strong> nous aident à comprendre l'utilisation du site</li>
            </ul>
            <p className="mt-3">
              Vous pouvez gérer vos préférences de cookies via les paramètres de votre navigateur.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Transferts de Données</h2>
            <p>
              Vos données sont hébergées au sein de l'Union Européenne. Si un transfert hors UE est nécessaire, 
              nous nous assurons que des garanties appropriées sont en place conformément au RGPD.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Mineurs</h2>
            <p>
              Nos services ne sont pas destinés aux personnes de moins de 18 ans. Nous ne collectons pas 
              sciemment de données personnelles de mineurs. Si vous pensez qu'un mineur nous a fourni des 
              données, contactez-nous immédiatement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">11. Modifications</h2>
            <p>
              Nous pouvons mettre à jour cette politique de confidentialité périodiquement. Les modifications 
              importantes vous seront notifiées par email ou via un avis sur notre site. La date de dernière 
              mise à jour est indiquée en haut de cette page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">12. Réclamations</h2>
            <p>
              Si vous estimez que vos droits à la protection des données n'ont pas été respectés, vous pouvez 
              déposer une réclamation auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés) 
              à l'adresse : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.cnil.fr</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">13. Contact</h2>
            <p>
              Pour toute question concernant cette politique de confidentialité ou vos données personnelles :
            </p>
            <p className="mt-2">
              Email : <a href="mailto:privacy@rezaclass.fr" className="text-primary hover:underline">privacy@rezaclass.fr</a><br />
              Adresse : Rezaclass, 123 Avenue des Champs-Élysées, 75008 Paris, France
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
