import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PropertyCard } from "@/components/PropertyCard";

interface SimilarPropertiesProps {
  currentPropertyId: string;
  location: string;
  pricePerNight: number;
}

export const SimilarProperties = ({
  currentPropertyId,
  location,
  pricePerNight,
}: SimilarPropertiesProps) => {
  const { data: properties, isLoading } = useQuery({
    queryKey: ["similar-properties", currentPropertyId, location],
    queryFn: async () => {
      // Calculate price range (±30%)
      const minPrice = pricePerNight * 0.7;
      const maxPrice = pricePerNight * 1.3;

      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .neq("id", currentPropertyId)
        .or(`location.ilike.%${location}%,price_per_night.gte.${minPrice},price_per_night.lte.${maxPrice}`)
        .limit(4);

      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading || !properties || properties.length === 0) {
    return null;
  }

  return (
    <div className="mt-16">
      <h2 className="text-3xl font-bold mb-8">Propriétés similaires</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            id={property.id}
            image={property.image_url || ""}
            title={property.title}
            location={property.location}
            price={Number(property.price_per_night)}
            guests={property.max_guests}
            rating={Number(property.rating) || 4.5}
          />
        ))}
      </div>
    </div>
  );
};