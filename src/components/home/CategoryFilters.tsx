import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PropertyCard } from "@/components/PropertyCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Waves, Droplet, Home, Mountain, Users, Flower, Heart, PawPrint } from "lucide-react";
import { cn } from "@/lib/utils";

const categories = [
  { id: "seaside", name: "Bord de mer", icon: Waves, keywords: ["mer", "plage", "côte", "océan"] },
  { id: "pool", name: "Piscines", icon: Droplet, keywords: ["piscine", "pool"] },
  { id: "cabin", name: "Cabanes", icon: Home, keywords: ["cabane", "chalet"] },
  { id: "lake", name: "Lac", icon: Waves, keywords: ["lac", "étang"] },
  { id: "family", name: "Familial", icon: Users, keywords: ["famille", "enfants", "familial"] },
  { id: "mountain", name: "Montagnes", icon: Mountain, keywords: ["montagne", "alpes", "ski"] },
  { id: "wellness", name: "Bien-être", icon: Flower, keywords: ["spa", "bien-être", "détente"] },
  { id: "pets", name: "Animaux acceptés", icon: PawPrint, keywords: ["animaux", "chien", "chat"] },
];

export const CategoryFilters = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: properties, isLoading } = useQuery({
    queryKey: ["category-properties", selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from("properties")
        .select("*")
        .eq("status", "active")
        .order("rating", { ascending: false })
        .limit(8);

      if (selectedCategory) {
        // Filter by property_type array using @> (contains) operator
        query = query.contains("property_type", [selectedCategory]);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <section className="py-16 container mx-auto px-4">
      <h2 className="text-3xl md:text-4xl font-bold mb-8 text-foreground">
        Trouvez l'hébergement idéal pour votre séjour
      </h2>

      {/* Category buttons */}
      <div className="flex gap-4 mb-12 overflow-x-auto pb-4 scrollbar-hide">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = selectedCategory === category.id;
          
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(isActive ? null : category.id)}
              className={cn(
                "flex flex-col items-center gap-2 px-6 py-4 rounded-xl border-2 transition-all whitespace-nowrap min-w-[120px]",
                isActive
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-card hover:border-primary/50 text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-6 w-6" />
              <span className="text-sm font-medium">{category.name}</span>
            </button>
          );
        })}
      </div>

      {/* Properties grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : properties && properties.length > 0 ? (
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
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Aucune propriété trouvée pour cette catégorie.</p>
        </div>
      )}
    </section>
  );
};
