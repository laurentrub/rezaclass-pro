import { useState, useEffect } from "react";
import { MapPin, Clock, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Destination } from "@/types/search";
import { POPULAR_DESTINATIONS, getRecentSearches, saveRecentSearch } from "@/constants/destinations";

interface SearchDestinationProps {
  value: Destination | null;
  onChange: (destination: Destination | null) => void;
}

export const SearchDestination = ({ value, onChange }: SearchDestinationProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [recentSearches, setRecentSearches] = useState<Destination[]>([]);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  const filteredDestinations = search
    ? POPULAR_DESTINATIONS.filter(
        (dest) =>
          dest.name.toLowerCase().includes(search.toLowerCase()) ||
          dest.region.toLowerCase().includes(search.toLowerCase())
      )
    : POPULAR_DESTINATIONS;

  const handleSelect = (destination: Destination) => {
    onChange(destination);
    saveRecentSearch(destination);
    setRecentSearches(getRecentSearches());
    setSearch("");
    setOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    setSearch("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="flex items-center gap-3 bg-background rounded-lg px-4 py-3 border border-border cursor-pointer hover:border-primary/50 transition-colors">
          <MapPin className="text-muted-foreground" size={20} />
          <Input
            placeholder="Destination"
            value={value ? value.name : search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-0 focus-visible:ring-0 p-0 h-auto bg-transparent cursor-pointer"
            onClick={() => setOpen(true)}
          />
          {value && (
            <X
              size={16}
              className="text-muted-foreground hover:text-foreground cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
            />
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-4">
          <Input
            placeholder="Rechercher une destination..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4"
            autoFocus
          />

          {recentSearches.length > 0 && !search && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Clock size={16} />
                Recherches récentes
              </h4>
              <div className="space-y-1">
                {recentSearches.map((dest, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelect(dest)}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors"
                  >
                    <div className="font-medium">{dest.name}</div>
                    <div className="text-sm text-muted-foreground">{dest.region}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <MapPin size={16} />
              {search ? "Résultats" : "Destinations populaires"}
            </h4>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {filteredDestinations.map((dest, index) => (
                <button
                  key={index}
                  onClick={() => handleSelect(dest)}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors"
                >
                  <div className="font-medium">{dest.name}</div>
                  <div className="text-sm text-muted-foreground">{dest.region}</div>
                </button>
              ))}
              {filteredDestinations.length === 0 && (
                <div className="text-sm text-muted-foreground px-3 py-2">
                  Aucune destination trouvée
                </div>
              )}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
