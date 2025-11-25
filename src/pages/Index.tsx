import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { PropertyCard } from "@/components/PropertyCard";

import apartmentParis from "@/assets/apartment-paris.jpg";
import cottageCounryside from "@/assets/cottage-countryside.jpg";
import villaRiviera from "@/assets/villa-riviera.jpg";
import chaletAlps from "@/assets/chalet-alps.jpg";
import beachBrittany from "@/assets/beach-brittany.jpg";
import heroVilla from "@/assets/hero-villa.jpg";

const properties = [
  {
    id: 1,
    image: apartmentParis,
    title: "Appartement Haussmannien",
    location: "Paris, Île-de-France",
    price: 180,
    guests: 4,
    rating: 4.9
  },
  {
    id: 2,
    image: cottageCounryside,
    title: "Maison de Campagne",
    location: "Normandie",
    price: 120,
    guests: 6,
    rating: 4.8
  },
  {
    id: 3,
    image: villaRiviera,
    title: "Villa avec Piscine",
    location: "Côte d'Azur",
    price: 350,
    guests: 8,
    rating: 5.0
  },
  {
    id: 4,
    image: chaletAlps,
    title: "Chalet de Montagne",
    location: "Alpes",
    price: 250,
    guests: 10,
    rating: 4.9
  },
  {
    id: 5,
    image: beachBrittany,
    title: "Maison de Plage",
    location: "Bretagne",
    price: 160,
    guests: 6,
    rating: 4.7
  },
  {
    id: 6,
    image: heroVilla,
    title: "Villa Provençale",
    location: "Provence",
    price: 280,
    guests: 8,
    rating: 4.9
  }
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      
      {/* Properties Section */}
      <section className="py-20 container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Nos locations de vacances
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Des hébergements soigneusement sélectionnés dans les plus belles régions de France
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property) => (
            <PropertyCard 
              key={property.id}
              id={String(property.id)}
              image={property.image}
              title={property.title}
              location={property.location}
              price={property.price}
              guests={property.guests}
              rating={property.rating}
            />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4 text-card-foreground">VacancesFrance</h3>
              <p className="text-muted-foreground">
                Votre partenaire de confiance pour des locations de vacances exceptionnelles en France.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4 text-card-foreground">Liens rapides</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">À propos</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Destinations</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4 text-card-foreground">Légal</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Conditions générales</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Politique de confidentialité</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Mentions légales</a></li>
              </ul>
            </div>
          </div>
          <div className="text-center pt-8 border-t border-border text-muted-foreground">
            <p>© 2025 VacancesFrance. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
