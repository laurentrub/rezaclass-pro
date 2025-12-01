import { Navigation } from "@/components/Navigation";
import { ContactDialog } from "@/components/ContactDialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

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

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-card rounded-xl p-8 border border-border">
            <h2 className="text-2xl font-semibold text-card-foreground mb-6">Informations de Contact</h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-card-foreground mb-1">Email</h3>
                  <a href="mailto:contact@rezaclass.fr" className="text-primary hover:underline">
                    contact@rezaclass.fr
                  </a>
                  <p className="text-sm text-muted-foreground mt-1">
                    Réponse sous 24h en semaine
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-card-foreground mb-1">Téléphone</h3>
                  <a href="tel:+33123456789" className="text-primary hover:underline">
                    +33 1 23 45 67 89
                  </a>
                  <p className="text-sm text-muted-foreground mt-1">
                    Du lundi au vendredi, 9h - 18h
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-card-foreground mb-1">Horaires d'ouverture</h3>
                  <p className="text-muted-foreground">Lundi - Vendredi : 9h00 - 18h00</p>
                  <p className="text-muted-foreground">Weekend : Support d'urgence uniquement</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-card-foreground mb-1">Adresse</h3>
                  <p className="text-muted-foreground">
                    123 Avenue des Champs-Élysées<br />
                    75008 Paris, France
                  </p>
                </div>
              </div>
            </div>
          </div>

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
    </div>
  );
};

export default Contact;
