import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useAnyAdminRole = () => {
  const { user } = useAuth();

  const { data: hasAdminRole, isLoading } = useQuery({
    queryKey: ["userRole", user?.id, "any-admin"],
    queryFn: async () => {
      if (!user) return { hasRole: false, role: null };
      
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .in("role", ["admin", "manager"] as any)
        .maybeSingle();

      if (error) {
        console.error("Error checking admin roles:", error);
        return { hasRole: false, role: null };
      }

      return { hasRole: !!data, role: data?.role as any || null };
    },
    enabled: !!user,
  });

  return { 
    hasAdminRole: hasAdminRole?.hasRole ?? false, 
    role: hasAdminRole?.role || null,
    isAdmin: (hasAdminRole?.role as any) === "admin",
    isManager: (hasAdminRole?.role as any) === "manager",
    isLoading 
  };
};
