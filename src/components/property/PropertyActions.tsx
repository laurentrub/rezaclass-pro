import { Button } from "@/components/ui/button";
import { Heart, Share2 } from "lucide-react";
import { useFavorite } from "@/hooks/useFavorite";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface PropertyActionsProps {
  propertyId: string;
  title: string;
}

export const PropertyActions = ({ propertyId, title }: PropertyActionsProps) => {
  const { isFavorite, toggleFavorite, loading } = useFavorite(propertyId);
  const { toast } = useToast();

  const handleShare = async () => {
    const url = window.location.href;

    // Try native share first
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: url,
        });
        return;
      } catch (error) {
        // User cancelled or error - fall back to clipboard
      }
    }

    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Lien copié !",
        description: "Le lien a été copié dans le presse-papiers",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de copier le lien",
      });
    }
  };

  return (
    <div className="absolute top-4 right-4 z-10 flex gap-2">
      <Button
        variant="secondary"
        size="icon"
        className="rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90"
        onClick={handleShare}
      >
        <Share2 size={18} />
      </Button>
      <Button
        variant="secondary"
        size="icon"
        className={cn(
          "rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90",
          isFavorite && "text-red-500"
        )}
        onClick={toggleFavorite}
        disabled={loading}
      >
        <Heart size={18} className={isFavorite ? "fill-current" : ""} />
      </Button>
    </div>
  );
};