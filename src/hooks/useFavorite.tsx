import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useFavorite = (propertyId: string) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Check if property is favorited
  useEffect(() => {
    const checkFavorite = async () => {
      if (!user) {
        setIsFavorite(false);
        return;
      }

      const { data } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("property_id", propertyId)
        .maybeSingle();

      setIsFavorite(!!data);
    };

    checkFavorite();
  }, [user, propertyId]);

  const toggleFavorite = async () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour ajouter aux favoris",
      });
      return;
    }

    setLoading(true);

    try {
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("property_id", propertyId);

        if (error) throw error;

        setIsFavorite(false);
        toast({
          title: "Retiré des favoris",
        });
      } else {
        // Add to favorites
        const { error } = await supabase
          .from("favorites")
          .insert({
            user_id: user.id,
            property_id: propertyId,
          });

        if (error) throw error;

        setIsFavorite(true);
        toast({
          title: "Ajouté aux favoris",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return { isFavorite, toggleFavorite, loading };
};