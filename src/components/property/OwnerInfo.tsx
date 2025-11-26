import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface OwnerInfoProps {
  ownerId: string | null;
}

export const OwnerInfo = ({ ownerId }: OwnerInfoProps) => {
  const { data: owner } = useQuery({
    queryKey: ["property-owner", ownerId],
    queryFn: async () => {
      if (!ownerId) return null;
      
      const { data, error } = await supabase
        .from("property_owners")
        .select("*")
        .eq("id", ownerId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!ownerId,
  });

  if (!owner) return null;

  const joinDate = owner.created_at 
    ? format(new Date(owner.created_at), "MMMM yyyy", { locale: fr })
    : "Récemment";

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Propriétaire</h2>
      <div className="flex items-start gap-4 p-4 border rounded-lg">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="text-lg bg-primary text-primary-foreground">
            {owner.name?.charAt(0).toUpperCase() || "P"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-lg">{owner.name}</p>
            {owner.is_verified && (
              <Badge variant="secondary" className="gap-1">
                <CheckCircle2 size={14} className="text-primary" />
                Vérifié
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Propriétaire depuis {joinDate}
          </p>
        </div>
      </div>
    </div>
  );
};