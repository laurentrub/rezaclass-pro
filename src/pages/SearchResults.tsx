import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { PropertyCard } from "@/components/PropertyCard";
import { SearchDestination } from "@/components/search/SearchDestination";
import { SearchDates } from "@/components/search/SearchDates";
import { SearchGuests } from "@/components/search/SearchGuests";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal } from "lucide-react";
import { usePropertySearch } from "@/hooks/usePropertySearch";
import { SearchCriteria } from "@/types/search";
import { Skeleton } from "@/components/ui/skeleton";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>(() => {
    const destination = searchParams.get("destination");
    const adults = parseInt(searchParams.get("adults") || "2");
    const children = parseInt(searchParams.get("children") || "0");

    return {
      destination: destination ? JSON.parse(destination) : null,
      dates: {
        mode: "flexible",
        duration: "flexible",
        months: [],
      },
      guests: { adults, children },
    };
  });

  const { data: properties, isLoading } = usePropertySearch(searchCriteria);

  useEffect(() => {
    // Update URL when search criteria changes
    const params = new URLSearchParams();
    if (searchCriteria.destination) {
      params.set("destination", JSON.stringify(searchCriteria.destination));
    }
    params.set("adults", searchCriteria.guests.adults.toString());
    params.set("children", searchCriteria.guests.children.toString());
    navigate(`/search?${params.toString()}`, { replace: true });
  }, [searchCriteria, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Sticky Search Bar */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-[2fr,2fr,1.5fr,auto] gap-3">
            <SearchDestination
              value={searchCriteria.destination}
              onChange={(destination) =>
                setSearchCriteria({ ...searchCriteria, destination })
              }
            />
            <SearchDates
              value={searchCriteria.dates}
              onChange={(dates) =>
                setSearchCriteria({ ...searchCriteria, dates })
              }
            />
            <SearchGuests
              value={searchCriteria.guests}
              onChange={(guests) =>
                setSearchCriteria({ ...searchCriteria, guests })
              }
            />
            <Button variant="default" size="lg" className="w-full lg:w-auto">
              <Search size={20} />
              Rechercher
            </Button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {searchCriteria.destination
                ? `Séjours à ${searchCriteria.destination.name}`
                : "Tous les séjours"}
            </h1>
            {!isLoading && (
              <p className="text-muted-foreground">
                {properties?.length || 0} {properties?.length === 1 ? "logement trouvé" : "logements trouvés"}
              </p>
            )}
          </div>
          <Button variant="outline" size="default">
            <SlidersHorizontal size={18} />
            Filtres
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-64 w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Results Grid */}
        {!isLoading && properties && properties.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                image={property.image_url || ""}
                title={property.title}
                location={property.location}
                price={Number(property.price_per_night)}
                guests={property.max_guests}
                rating={Number(property.rating) || 4.5}
              />
            ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading && properties && properties.length === 0 && (
          <div className="text-center py-16">
            <div className="mb-4">
              <Search size={64} className="mx-auto text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Aucun résultat trouvé</h2>
            <p className="text-muted-foreground mb-6">
              Essayez de modifier vos critères de recherche
            </p>
            <Button onClick={() => navigate("/")}>
              Retour à l'accueil
            </Button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-muted mt-16 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold mb-4">À propos</h3>
              <p className="text-muted-foreground">
                Locations de vacances exceptionnelles en France
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Contact</h3>
              <p className="text-muted-foreground">contact@example.com</p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Légal</h3>
              <p className="text-muted-foreground">Mentions légales</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SearchResults;
