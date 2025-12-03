export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-16">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-4 text-card-foreground">Rezaclass</h3>
            <p className="text-muted-foreground">
              Votre partenaire de confiance pour des locations de vacances exceptionnelles en France.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4 text-card-foreground">Liens rapides</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="/about" className="hover:text-primary transition-colors">À propos</a></li>
              <li><a href="/destinations" className="hover:text-primary transition-colors">Destinations</a></li>
              <li><a href="/contact" className="hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4 text-card-foreground">Légal</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="/terms-of-service" className="hover:text-primary transition-colors">Conditions générales</a></li>
              <li><a href="/privacy-policy" className="hover:text-primary transition-colors">Politique de confidentialité</a></li>
              <li><a href="/legal-notice" className="hover:text-primary transition-colors">Mentions légales</a></li>
            </ul>
          </div>
        </div>
        <div className="text-center pt-8 border-t border-border text-muted-foreground">
          <p>© 2025 Rezaclass. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};
