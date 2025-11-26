import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface PropertyReviewsProps {
  propertyId: string;
}

export const PropertyReviews = ({ propertyId }: PropertyReviewsProps) => {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ["reviews", propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          *,
          profiles:user_id (full_name, email)
        `)
        .eq("property_id", propertyId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">Avis clients</h2>
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">Avis clients</h2>
        <p className="text-muted-foreground">Aucun avis pour le moment</p>
      </div>
    );
  }

  // Calculate average rating
  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold">Avis clients</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="fill-yellow-400 text-yellow-400" size={20} />
            <span className="font-bold text-lg">{averageRating.toFixed(1)}</span>
          </div>
          <span className="text-muted-foreground">
            ({reviews.length} avis)
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {reviews.map((review: any) => {
          const profile = review.profiles;
          const userName = profile?.full_name || profile?.email?.split("@")[0] || "Utilisateur";
          const reviewDate = format(new Date(review.created_at), "d MMMM yyyy", { locale: fr });

          return (
            <div key={review.id} className="border-b pb-6 last:border-b-0">
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold">{userName}</p>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{reviewDate}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={
                          i < review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }
                      />
                    ))}
                  </div>
                  {review.comment && (
                    <p className="text-muted-foreground leading-relaxed">
                      {review.comment}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};