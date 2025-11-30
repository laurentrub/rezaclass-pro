import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SearchCriteria } from "@/types/search";

export const usePropertySearch = (criteria: SearchCriteria | null) => {
  return useQuery({
    queryKey: ["properties", "search", criteria],
    queryFn: async () => {
      let query = supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      // Filter by location/destination
      if (criteria?.destination) {
        const searchTerm = criteria.destination.name.toLowerCase();
        const region = criteria.destination.region?.toLowerCase() || "";
        
        // Build a flexible search that matches location, title, address, or region
        if (region) {
          query = query.or(
            `location.ilike.%${searchTerm}%,title.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%,location.ilike.%${region}%,address.ilike.%${region}%`
          );
        } else {
          query = query.or(
            `location.ilike.%${searchTerm}%,title.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`
          );
        }
      }

      // Filter by max guests
      if (criteria?.guests) {
        const totalGuests = criteria.guests.adults + criteria.guests.children;
        if (totalGuests > 0) {
          query = query.gte("max_guests", totalGuests);
        }
      }

      // Filter by price range
      if (criteria?.filters?.priceRange) {
        const { min, max } = criteria.filters.priceRange;
        if (min > 0) {
          query = query.gte("price_per_night", min);
        }
        if (max < 1000) {
          query = query.lte("price_per_night", max);
        }
      }

      // Filter by bedrooms
      if (criteria?.filters?.bedrooms) {
        query = query.gte("bedrooms", criteria.filters.bedrooms);
      }

      // Filter by rating
      if (criteria?.filters?.minRating) {
        query = query.gte("rating", criteria.filters.minRating);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Additional client-side filtering for dates and amenities
      let filteredData = data || [];

      // Filter by amenities (client-side because amenities is JSONB)
      if (criteria?.filters?.amenities && criteria.filters.amenities.length > 0) {
        filteredData = filteredData.filter((property) => {
          const propertyAmenities = (property.amenities as string[]) || [];
          return criteria.filters!.amenities.every((requiredAmenity) =>
            propertyAmenities.some((amenity) =>
              amenity.toLowerCase().includes(requiredAmenity.toLowerCase())
            )
          );
        });
      }

      // TODO: In a real app, you'd check booking availability against the dates
      
      return filteredData;
    },
    enabled: !!criteria,
  });
};
