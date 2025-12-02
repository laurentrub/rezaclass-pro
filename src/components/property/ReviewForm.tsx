import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ReviewFormProps {
  propertyId: string;
  userId: string;
}

export const ReviewForm = ({ propertyId, userId }: ReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const queryClient = useQueryClient();

  const submitReview = useMutation({
    mutationFn: async () => {
      if (rating === 0) {
        throw new Error("Veuillez sélectionner une note");
      }

      const { error } = await supabase.from("reviews").insert({
        property_id: propertyId,
        user_id: userId,
        rating,
        comment: comment.trim() || null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Merci pour votre avis !",
        description: "Votre avis a été publié avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ["reviews", propertyId] });
      queryClient.invalidateQueries({ queryKey: ["user-review", propertyId, userId] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la publication de votre avis.",
        variant: "destructive",
      });
    },
  });

  const displayRating = hoveredRating || rating;

  return (
    <div className="bg-muted/50 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Partagez votre expérience</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Votre note</label>
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i + 1)}
              onMouseEnter={() => setHoveredRating(i + 1)}
              onMouseLeave={() => setHoveredRating(0)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                size={28}
                className={
                  i < displayRating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                }
              />
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Votre commentaire (optionnel)
        </label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Décrivez votre expérience..."
          maxLength={1000}
          rows={4}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {comment.length}/1000 caractères
        </p>
      </div>

      <Button
        onClick={() => submitReview.mutate()}
        disabled={rating === 0 || submitReview.isPending}
      >
        {submitReview.isPending ? "Publication..." : "Publier mon avis"}
      </Button>
    </div>
  );
};
