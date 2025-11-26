import { Badge } from "@/components/ui/badge";
import { Wifi, UtensilsCrossed, Car, Tv, WashingMachine, Waves } from "lucide-react";

const HIGHLIGHT_ICONS: Record<string, any> = {
  "WiFi": Wifi,
  "Cuisine équipée": UtensilsCrossed,
  "Parking gratuit": Car,
  "Télévision": Tv,
  "Lave-linge": WashingMachine,
  "Vue mer": Waves,
};

interface PropertyHighlightsProps {
  amenities: string[];
}

export const PropertyHighlights = ({ amenities }: PropertyHighlightsProps) => {
  // Show only first 6 amenities as highlights
  const highlights = amenities.slice(0, 6);

  if (highlights.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {highlights.map((amenity, index) => {
        const Icon = HIGHLIGHT_ICONS[amenity] || Wifi;
        return (
          <Badge
            key={index}
            variant="secondary"
            className="px-3 py-2 text-sm font-normal gap-2"
          >
            <Icon size={16} />
            {amenity}
          </Badge>
        );
      })}
    </div>
  );
};