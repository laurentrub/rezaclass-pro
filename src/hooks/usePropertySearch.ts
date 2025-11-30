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

      const { data, error } = await query;

      if (error) throw error;

      // Additional client-side filtering for dates if needed
      let filteredData = data || [];

      // TODO: In a real app, you'd check booking availability against the dates
      // For now, we just return all matching properties
      
      return filteredData;
    },
    enabled: !!criteria,
  });
};
