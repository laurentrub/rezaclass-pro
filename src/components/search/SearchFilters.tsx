import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SlidersHorizontal, X } from "lucide-react";
import { SearchFilters as SearchFiltersType } from "@/types/search";

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onChange: (filters: SearchFiltersType) => void;
}

const COMMON_AMENITIES = [
  "WiFi",
  "Piscine",
  "Parking",
  "Climatisation",
  "Cuisine équipée",
  "Lave-linge",
  "Jardin",
  "Terrasse",
];

export const SearchFilters = ({ filters, onChange }: SearchFiltersProps) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [open, setOpen] = useState(false);

  const handlePriceChange = (values: number[]) => {
    setLocalFilters({
      ...localFilters,
      priceRange: { min: values[0], max: values[1] },
    });
  };

  const handleAmenityToggle = (amenity: string, checked: boolean) => {
    const newAmenities = checked
      ? [...localFilters.amenities, amenity]
      : localFilters.amenities.filter((a) => a !== amenity);
    
    setLocalFilters({
      ...localFilters,
      amenities: newAmenities,
    });
  };

  const handleBedroomsChange = (value: string) => {
    setLocalFilters({
      ...localFilters,
      bedrooms: value === "any" ? undefined : parseInt(value),
    });
  };

  const handleRatingChange = (value: string) => {
    setLocalFilters({
      ...localFilters,
      minRating: value === "any" ? undefined : parseFloat(value),
    });
  };

  const applyFilters = () => {
    onChange(localFilters);
    setOpen(false);
  };

  const resetFilters = () => {
    const defaultFilters: SearchFiltersType = {
      priceRange: { min: 0, max: 1000 },
      amenities: [],
    };
    setLocalFilters(defaultFilters);
    onChange(defaultFilters);
  };

  const activeFiltersCount = 
    (localFilters.bedrooms ? 1 : 0) +
    (localFilters.minRating ? 1 : 0) +
    localFilters.amenities.length +
    ((localFilters.priceRange.min > 0 || localFilters.priceRange.max < 1000) ? 1 : 0);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="default" className="relative">
          <SlidersHorizontal size={18} />
          Filtres
          {activeFiltersCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filtres de recherche</SheetTitle>
          <SheetDescription>
            Affinez votre recherche avec des critères détaillés
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Prix */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Prix par nuit</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {localFilters.priceRange.min}€ - {localFilters.priceRange.max}€
              </p>
            </div>
            <Slider
              min={0}
              max={1000}
              step={10}
              value={[localFilters.priceRange.min, localFilters.priceRange.max]}
              onValueChange={handlePriceChange}
              className="w-full"
            />
          </div>

          {/* Chambres */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Nombre de chambres</Label>
            <RadioGroup
              value={localFilters.bedrooms?.toString() || "any"}
              onValueChange={handleBedroomsChange}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="any" id="bedrooms-any" />
                <Label htmlFor="bedrooms-any" className="font-normal cursor-pointer">
                  Indifférent
                </Label>
              </div>
              {[1, 2, 3, 4, 5].map((num) => (
                <div key={num} className="flex items-center space-x-2">
                  <RadioGroupItem value={num.toString()} id={`bedrooms-${num}`} />
                  <Label
                    htmlFor={`bedrooms-${num}`}
                    className="font-normal cursor-pointer"
                  >
                    {num} {num === 1 ? "chambre" : "chambres"}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Note minimale */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Note minimale</Label>
            <RadioGroup
              value={localFilters.minRating?.toString() || "any"}
              onValueChange={handleRatingChange}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="any" id="rating-any" />
                <Label htmlFor="rating-any" className="font-normal cursor-pointer">
                  Toutes les notes
                </Label>
              </div>
              {[4.5, 4.0, 3.5].map((rating) => (
                <div key={rating} className="flex items-center space-x-2">
                  <RadioGroupItem value={rating.toString()} id={`rating-${rating}`} />
                  <Label
                    htmlFor={`rating-${rating}`}
                    className="font-normal cursor-pointer"
                  >
                    {rating}+ ⭐
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Équipements */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Équipements</Label>
            <div className="space-y-2">
              {COMMON_AMENITIES.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={`amenity-${amenity}`}
                    checked={localFilters.amenities.includes(amenity)}
                    onCheckedChange={(checked) =>
                      handleAmenityToggle(amenity, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`amenity-${amenity}`}
                    className="font-normal cursor-pointer"
                  >
                    {amenity}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={resetFilters}
            className="flex-1"
          >
            <X size={16} />
            Réinitialiser
          </Button>
          <Button onClick={applyFilters} className="flex-1">
            Appliquer
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
