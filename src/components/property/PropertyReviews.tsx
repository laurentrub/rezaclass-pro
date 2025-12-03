import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ReviewForm } from "./ReviewForm";

interface PropertyReviewsProps {
  propertyId: string;
}

export const PropertyReviews = ({ propertyId }: PropertyReviewsProps) => {
  const { user } = useAuth();

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

  // Check if user already has a review for this property
  const { data: existingReview } = useQuery({
    queryKey: ["user-review", propertyId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("reviews")
        .select("id")
        .eq("property_id", propertyId)
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  // Check if user has a completed confirmed booking for this property
  const { data: eligibleBooking } = useQuery({
    queryKey: ["eligible-booking", propertyId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("bookings")
        .select("id")
        .eq("property_id", propertyId)
        .eq("user_id", user.id)
        .eq("status", "confirmed")
        .lt("check_out_date", today)
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const canLeaveReview = user && eligibleBooking && !existingReview;
  const hasReviews = reviews && reviews.length > 0;

  // Hide section entirely if no reviews and user can't leave one
  if (!isLoading && !hasReviews && !canLeaveReview) {
    return null;
  }

  if (isLoading) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">Avis clients</h2>
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  // Calculate average rating
  const averageRating = hasReviews
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Avis clients</h2>

      {/* Review form for eligible users */}
      {canLeaveReview && (
        <ReviewForm propertyId={propertyId} userId={user.id} />
      )}

      {/* Show message if user already left a review */}
      {user && existingReview && (
        <div className="bg-primary/10 rounded-lg p-4 mb-6">
          <p className="text-sm text-primary font-medium">
            Merci d'avoir partagé votre expérience !
          </p>
        </div>
      )}

      {/* Reviews list */}
      {hasReviews && (
        <>
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center gap-1">
              <Star className="fill-yellow-400 text-yellow-400" size={20} />
              <span className="font-bold text-lg">{averageRating.toFixed(1)}</span>
            </div>
            <span className="text-muted-foreground">
              ({reviews.length} avis)
            </span>
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
        </>
      )}
    </div>
  );
};