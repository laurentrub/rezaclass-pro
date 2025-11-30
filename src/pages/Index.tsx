import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { PropertyCard } from "@/components/PropertyCard";
import { WeekendGetaways } from "@/components/home/WeekendGetaways";
import { CategoryFilters } from "@/components/home/CategoryFilters";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

import apartmentParis from "@/assets/apartment-paris.jpg";
import cottageCounryside from "@/assets/cottage-countryside.jpg";
import villaRiviera from "@/assets/villa-riviera.jpg";
import chaletAlps from "@/assets/chalet-alps.jpg";
import beachBrittany from "@/assets/beach-brittany.jpg";
import heroVilla from "@/assets/hero-villa.jpg";

const Index = () => {
  const { data: properties, isLoading } = useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      
      {/* Weekend Getaways Section */}
      <WeekendGetaways />

      {/* Category Filters Section */}
      <CategoryFilters />
      
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

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-64 w-full rounded-xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties?.map((property) => (
              <PropertyCard 
                key={property.id}
                id={property.id}
                image={property.image_url || apartmentParis}
                title={property.title}
                location={property.location}
                price={Number(property.price_per_night)}
                guests={property.max_guests}
                rating={Number(property.rating) || 4.5}
              />
            ))}
          </div>
        )}
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
