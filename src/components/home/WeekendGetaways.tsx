import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PropertyCard } from "@/components/PropertyCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";

export const WeekendGetaways = () => {
  const { data: properties, isLoading } = useQuery({
    queryKey: ["weekend-properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .limit(8)
        .order("rating", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Get next weekend dates for display
  const getNextWeekendDates = () => {
    const today = new Date();
    const nextFriday = new Date(today);
    const daysUntilFriday = (5 - today.getDay() + 7) % 7 || 7;
    nextFriday.setDate(today.getDate() + daysUntilFriday);
    
    const nextSunday = new Date(nextFriday);
    nextSunday.setDate(nextFriday.getDate() + 2);
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    };
    
    return `du ${formatDate(nextFriday)} au ${formatDate(nextSunday)}`;
  };

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-2 text-foreground">
            Découvrez des escapades pour un week-end
          </h2>
          <p className="text-muted-foreground">
            Offres affichées : <span className="font-medium">{getNextWeekendDates()}</span>
          </p>
        </div>

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
        ) : (
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {properties?.map((property) => (
                <CarouselItem key={property.id} className="pl-4 md:basis-1/2 lg:basis-1/4">
                  <PropertyCard
                    id={property.id}
                    image={property.image_url || ""}
                    title={property.title}
                    location={property.location}
                    price={Number(property.price_per_night)}
                    guests={property.max_guests}
                    rating={Number(property.rating) || 4.5}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-4 bg-card shadow-lg border-border hover:bg-muted" />
            <CarouselNext className="-right-4 bg-card shadow-lg border-border hover:bg-muted" />
          </Carousel>
        )}
      </div>
    </section>
  );
};
