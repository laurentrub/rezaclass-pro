import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useManager = () => {
  const { user } = useAuth();

  const { data: isManager, isLoading } = useQuery({
    queryKey: ["userRole", user?.id, "manager"],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "manager" as any)
        .maybeSingle();

      if (error) {
        console.error("Error checking manager role:", error);
        return false;
      }

      return !!data;
    },
    enabled: !!user,
  });

  return { isManager: isManager ?? false, isLoading };
};
