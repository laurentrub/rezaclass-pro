import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-villa.jpg";
import { SearchDestination } from "./search/SearchDestination";
import { SearchDates } from "./search/SearchDates";
import { SearchGuests } from "./search/SearchGuests";
import { SearchCriteria } from "@/types/search";

export const Hero = () => {
  const navigate = useNavigate();
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({
    destination: null,
    dates: {
      mode: "flexible",
      duration: "flexible",
      months: [],
    },
    guests: {
      adults: 2,
      children: 0,
    },
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchCriteria.destination) {
      params.set("destination", JSON.stringify(searchCriteria.destination));
    }
    params.set("adults", searchCriteria.guests.adults.toString());
    params.set("children", searchCriteria.guests.children.toString());
    navigate(`/search?${params.toString()}`);
  };

  return (
    <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/40 via-foreground/30 to-foreground/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white drop-shadow-2xl">
          Votre séjour de rêve en France
        </h1>
        <p className="text-xl md:text-2xl mb-12 text-white/95 max-w-3xl mx-auto drop-shadow-lg">
          Découvrez des locations saisonnières exceptionnelles dans toute la France
        </p>

        {/* Search Bar */}
        <div className="bg-card rounded-2xl shadow-2xl p-6 max-w-6xl mx-auto backdrop-blur-sm bg-card/95">
          <div className="grid grid-cols-1 lg:grid-cols-[2fr,2fr,1.5fr,auto] gap-4">
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
            <Button 
              variant="hero" 
              size="lg" 
              className="w-full"
              onClick={handleSearch}
            >
              <Search size={20} />
              Rechercher
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
