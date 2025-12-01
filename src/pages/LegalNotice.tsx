import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

const LegalNotice = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-4">Mentions Légales</h1>
        <p className="text-muted-foreground mb-8">Informations légales relatives au site Rezaclass</p>
        
        <div className="space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Éditeur du Site</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p><strong className="text-card-foreground">Raison sociale :</strong> Rezaclass SAS</p>
              <p><strong className="text-card-foreground">Forme juridique :</strong> Société par Actions Simplifiée</p>
              <p><strong className="text-card-foreground">Capital social :</strong> 100 000 €</p>
              <p><strong className="text-card-foreground">Siège social :</strong> 123 Avenue des Champs-Élysées, 75008 Paris, France</p>
              <p><strong className="text-card-foreground">RCS :</strong> Paris B 123 456 789</p>
              <p><strong className="text-card-foreground">SIRET :</strong> 123 456 789 00012</p>
              <p><strong className="text-card-foreground">Numéro TVA intracommunautaire :</strong> FR 12 123456789</p>
              <p><strong className="text-card-foreground">Email :</strong> <a href="mailto:contact@rezaclass.fr" className="text-primary hover:underline">contact@rezaclass.fr</a></p>
              <p><strong className="text-card-foreground">Téléphone :</strong> +33 1 23 45 67 89</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Directeur de la Publication</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p><strong className="text-card-foreground">Nom :</strong> Jean Dupont</p>
              <p><strong className="text-card-foreground">Fonction :</strong> Président de Rezaclass SAS</p>
              <p><strong className="text-card-foreground">Email :</strong> <a href="mailto:direction@rezaclass.fr" className="text-primary hover:underline">direction@rezaclass.fr</a></p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Hébergement du Site</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p><strong className="text-card-foreground">Hébergeur :</strong> Lovable Cloud (Supabase Infrastructure)</p>
              <p><strong className="text-card-foreground">Localisation :</strong> Serveurs situés dans l'Union Européenne</p>
              <p className="mt-2 text-sm">
                Le site est hébergé sur une infrastructure cloud sécurisée et conforme aux normes européennes 
                de protection des données.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Propriété Intellectuelle</h2>
            <p className="mb-3">
              L'ensemble du contenu de ce site (textes, images, vidéos, logos, graphismes, icônes, sons, logiciels) 
              est la propriété exclusive de Rezaclass SAS ou de ses partenaires, et est protégé par les lois françaises 
              et internationales relatives à la propriété intellectuelle.
            </p>
            <p className="mb-3">
              Toute reproduction, représentation, modification, publication, adaptation totale ou partielle des 
              éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sans l'autorisation 
              écrite préalable de Rezaclass SAS.
            </p>
            <p>
              Toute exploitation non autorisée du site ou de l'un des éléments qu'il contient sera considérée 
              comme constitutive d'une contrefaçon et poursuivie conformément aux dispositions des articles 
              L.335-2 et suivants du Code de Propriété Intellectuelle.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Données Personnelles</h2>
            <p className="mb-3">
              Conformément à la loi « Informatique et Libertés » du 6 janvier 1978 modifiée et au Règlement 
              Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification, 
              de suppression et d'opposition aux données personnelles vous concernant.
            </p>
            <p className="mb-3">
              <strong className="text-foreground">Responsable du traitement :</strong> Rezaclass SAS
            </p>
            <p className="mb-3">
              Pour exercer ces droits, vous pouvez contacter notre Délégué à la Protection des Données :
            </p>
            <div className="bg-card p-4 rounded-lg border border-border">
              <p>Email : <a href="mailto:dpo@rezaclass.fr" className="text-primary hover:underline">dpo@rezaclass.fr</a></p>
              <p>Courrier : DPO Rezaclass, 123 Avenue des Champs-Élysées, 75008 Paris, France</p>
            </div>
            <p className="mt-3">
              Pour plus d'informations, consultez notre <a href="/privacy-policy" className="text-primary hover:underline">Politique de Confidentialité</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Cookies</h2>
            <p>
              Le site utilise des cookies pour améliorer l'expérience utilisateur, réaliser des statistiques 
              de visite et personnaliser le contenu. En naviguant sur ce site, vous acceptez l'utilisation de 
              cookies conformément à notre politique de confidentialité. Vous pouvez paramétrer vos préférences 
              de cookies via les paramètres de votre navigateur.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Limitation de Responsabilité</h2>
            <p className="mb-3">
              Rezaclass s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur ce site. 
              Toutefois, Rezaclass ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations 
              mises à disposition.
            </p>
            <p className="mb-3">
              Rezaclass ne saurait être tenu responsable :
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Des dommages directs ou indirects causés lors de l'accès ou de l'utilisation du site</li>
              <li>De l'impossibilité d'accéder au site temporairement ou définitivement</li>
              <li>Des dommages résultant de virus informatiques ou autres composants nuisibles</li>
              <li>Des transactions effectuées entre utilisateurs via la plateforme</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Liens Hypertextes</h2>
            <p className="mb-3">
              Le site peut contenir des liens vers d'autres sites internet. Rezaclass n'exerce aucun contrôle 
              sur ces sites externes et décline toute responsabilité quant à leur contenu.
            </p>
            <p>
              La création de liens hypertextes vers le site rezaclass.fr nécessite l'autorisation préalable 
              écrite de Rezaclass SAS.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Droit Applicable</h2>
            <p>
              Les présentes mentions légales sont soumises au droit français. Tout litige relatif à l'utilisation 
              du site rezaclass.fr sera soumis à la compétence exclusive des tribunaux français.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Crédits</h2>
            <p className="mb-2">
              <strong className="text-foreground">Conception et développement :</strong> Rezaclass Team
            </p>
            <p className="mb-2">
              <strong className="text-foreground">Photographies :</strong> Les images utilisées sont soit la 
              propriété de Rezaclass, soit libres de droits, soit utilisées avec l'autorisation de leurs auteurs.
            </p>
            <p>
              <strong className="text-foreground">Icônes :</strong> Lucide Icons
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">11. Médiation</h2>
            <p className="mb-3">
              Conformément à l'article L.612-1 du Code de la consommation, en cas de litige avec un consommateur, 
              Rezaclass s'engage à proposer un dispositif de médiation de la consommation.
            </p>
            <div className="bg-card p-4 rounded-lg border border-border">
              <p><strong className="text-card-foreground">Médiateur de la consommation :</strong> Médiateur du Tourisme et du Voyage</p>
              <p>BP 80 303 - 75 823 Paris Cedex 17</p>
              <p>Site web : <a href="https://www.mtv.travel" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.mtv.travel</a></p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">12. Contact</h2>
            <p>
              Pour toute question concernant ces mentions légales, vous pouvez nous contacter :
            </p>
            <div className="mt-3 bg-card p-4 rounded-lg border border-border">
              <p>Email : <a href="mailto:legal@rezaclass.fr" className="text-primary hover:underline">legal@rezaclass.fr</a></p>
              <p>Téléphone : +33 1 23 45 67 89</p>
              <p>Courrier : Rezaclass SAS, 123 Avenue des Champs-Élysées, 75008 Paris, France</p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LegalNotice;
