import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { PropertyCard } from "@/components/PropertyCard";
import { WeekendGetaways } from "@/components/home/WeekendGetaways";
import { CategoryFilters } from "@/components/home/CategoryFilters";
import { PopularDestinations } from "@/components/home/PopularDestinations";
import ServicesSection from "@/components/home/ServicesSection";
import AboutSection from "@/components/home/AboutSection";
import InspirationSection from "@/components/home/InspirationSection";
import NewsletterSection from "@/components/home/NewsletterSection";
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpDown } from "lucide-react";

import apartmentParis from "@/assets/apartment-paris.jpg";
import cottageCounryside from "@/assets/cottage-countryside.jpg";
import villaRiviera from "@/assets/villa-riviera.jpg";
import chaletAlps from "@/assets/chalet-alps.jpg";
import beachBrittany from "@/assets/beach-brittany.jpg";
import heroVilla from "@/assets/hero-villa.jpg";

type SortOption = "rating" | "price_asc" | "price_desc" | "recent";

const Index = () => {
  const PROPERTIES_PER_PAGE = 8;
  const [sortBy, setSortBy] = useState<SortOption>("rating");
  
  // Infinite query pour charger les propriétés avec tri
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["properties", "sorted", sortBy],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from("properties")
        .select("*");

      // Appliquer l'ordre de tri
      switch (sortBy) {
        case "rating":
          query = query.order("rating", { ascending: false });
          break;
        case "price_asc":
          query = query.order("price_per_night", { ascending: true });
          break;
        case "price_desc":
          query = query.order("price_per_night", { ascending: false });
          break;
        case "recent":
          query = query.order("created_at", { ascending: false });
          break;
      }

      query = query.range(pageParam, pageParam + PROPERTIES_PER_PAGE - 1);

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PROPERTIES_PER_PAGE) return undefined;
      return allPages.length * PROPERTIES_PER_PAGE;
    },
    initialPageParam: 0,
  });

  // IntersectionObserver pour détecter quand on arrive en bas
  const { ref, inView } = useInView({
    threshold: 0,
  });

  // Charger la page suivante quand on arrive en bas
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Fusionner toutes les pages en un seul tableau
  const properties = data?.pages.flat() || [];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      
      {/* Weekend Getaways Section */}
      <WeekendGetaways />

      {/* Category Filters Section */}
      <CategoryFilters />

      {/* Popular Destinations Section */}
      <PopularDestinations />

      {/* Services Section */}
      <ServicesSection />
      
      {/* Properties Section */}
      <section className="py-20 container mx-auto px-4">
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Nos meilleures locations
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Découvrez notre sélection des hébergements les mieux notés
            </p>
          </div>

          {/* Sélecteur de tri */}
          <div className="flex justify-end items-center gap-2 max-w-7xl mx-auto">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Trier par:</span>
            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Meilleure note</SelectItem>
                <SelectItem value="price_asc">Prix croissant</SelectItem>
                <SelectItem value="price_desc">Prix décroissant</SelectItem>
                <SelectItem value="recent">Plus récent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-64 w-full rounded-xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

        {/* Zone de détection pour le scroll infini */}
        {!isLoading && (
          <div ref={ref} className="mt-8 flex justify-center">
            {isFetchingNextPage && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span>Chargement...</span>
              </div>
            )}
            {!hasNextPage && properties.length > 0 && (
              <p className="text-muted-foreground">Toutes les propriétés ont été chargées</p>
            )}
          </div>
        )}
      </section>

      {/* About Section */}
      <AboutSection />

      {/* Inspiration Section */}
      <InspirationSection />

      {/* Newsletter Section */}
      <NewsletterSection />

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
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
    </div>
  );
};

export default Index;
