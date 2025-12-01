import { Navigation } from "@/components/Navigation";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-8">À propos de Rezaclass</h1>
        
        <div className="space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Notre Mission</h2>
            <p>
              Rezaclass est votre partenaire de confiance pour découvrir et réserver des locations de vacances 
              exceptionnelles partout en France. Nous mettons en relation les voyageurs avec des propriétaires 
              passionnés qui proposent des hébergements authentiques et uniques.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Notre Histoire</h2>
            <p>
              Fondée avec la vision de révolutionner le marché de la location saisonnière en France, Rezaclass 
              s'engage à offrir une expérience de réservation simple, sécurisée et transparente. Nous croyons 
              que chaque voyage mérite un hébergement exceptionnel qui devient partie intégrante de l'expérience.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Nos Valeurs</h2>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Confiance :</strong> Nous vérifions chaque propriété pour garantir la qualité et l'authenticité</li>
              <li><strong>Transparence :</strong> Aucun frais caché, des prix clairs et honnêtes</li>
              <li><strong>Service :</strong> Une équipe disponible 24/7 pour vous accompagner</li>
              <li><strong>Diversité :</strong> Des hébergements pour tous les goûts et tous les budgets</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Pourquoi Choisir Rezaclass ?</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-card rounded-lg border border-border">
                <h3 className="font-semibold text-card-foreground mb-2">Sélection Rigoureuse</h3>
                <p className="text-sm">Chaque propriété est vérifiée et sélectionnée avec soin</p>
              </div>
              <div className="p-4 bg-card rounded-lg border border-border">
                <h3 className="font-semibold text-card-foreground mb-2">Paiement Sécurisé</h3>
                <p className="text-sm">Transactions protégées et sécurisées</p>
              </div>
              <div className="p-4 bg-card rounded-lg border border-border">
                <h3 className="font-semibold text-card-foreground mb-2">Assistance 24/7</h3>
                <p className="text-sm">Une équipe dédiée à votre service à tout moment</p>
              </div>
              <div className="p-4 bg-card rounded-lg border border-border">
                <h3 className="font-semibold text-card-foreground mb-2">Annulation Flexible</h3>
                <p className="text-sm">Options d'annulation adaptées à vos besoins</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Contactez-nous</h2>
            <p>
              Vous avez des questions ? Notre équipe est là pour vous aider. N'hésitez pas à nous contacter 
              via notre formulaire de contact ou par email à <a href="mailto:contact@rezaclass.fr" className="text-primary hover:underline">contact@rezaclass.fr</a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default About;
