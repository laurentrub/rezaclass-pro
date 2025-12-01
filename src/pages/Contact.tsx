import { Navigation } from "@/components/Navigation";
import { ContactDialog } from "@/components/ContactDialog";
import { Footer } from "@/components/Footer";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const Contact = () => {
  const [showContactDialog, setShowContactDialog] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <h1 className="text-4xl font-bold text-foreground mb-4">Nous Contacter</h1>
        <p className="text-lg text-muted-foreground mb-12 max-w-3xl">
          Notre équipe est à votre disposition pour répondre à toutes vos questions. 
          N'hésitez pas à nous contacter, nous serons ravis de vous aider.
        </p>

        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-card rounded-xl p-8 border border-border">
            <h2 className="text-2xl font-semibold text-card-foreground mb-6">Envoyez-nous un Message</h2>
            <p className="text-muted-foreground mb-6">
              Remplissez notre formulaire de contact et nous vous répondrons dans les plus brefs délais.
            </p>
            <Button 
              onClick={() => setShowContactDialog(true)}
              className="w-full"
              size="lg"
            >
              Ouvrir le Formulaire de Contact
            </Button>

            <div className="mt-8 pt-8 border-t border-border">
              <h3 className="font-semibold text-card-foreground mb-4">Questions Fréquentes</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>• Pour une réservation en cours, consultez votre espace client</li>
                <li>• Pour devenir hôte, sélectionnez le sujet approprié dans le formulaire</li>
                <li>• Pour une réclamation, notre service client vous répondra sous 48h</li>
                <li>• Pour toute urgence durant votre séjour, contactez directement votre hôte</li>
              </ul>
            </div>
          </div>
        </div>

        <section className="bg-card rounded-xl p-8 border border-border">
          <h2 className="text-2xl font-semibold text-card-foreground mb-4">Support et Assistance</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-card-foreground mb-2">Avant la Réservation</h3>
              <p className="text-sm text-muted-foreground">
                Questions sur une propriété, disponibilités, tarifs, conditions d'annulation
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-card-foreground mb-2">Pendant votre Séjour</h3>
              <p className="text-sm text-muted-foreground">
                Assistance d'urgence 24/7, problèmes techniques, questions sur la propriété
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-card-foreground mb-2">Après votre Séjour</h3>
              <p className="text-sm text-muted-foreground">
                Avis, réclamations, remboursements, questions sur votre facture
              </p>
            </div>
          </div>
        </section>
      </main>

      <ContactDialog open={showContactDialog} onOpenChange={setShowContactDialog} />
      <Footer />
    </div>
  );
};

export default Contact;
