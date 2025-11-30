import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useAnyAdminRole = () => {
  const { user } = useAuth();

  const { data: hasAdminRole, isLoading } = useQuery({
    queryKey: ["userRole", user?.id, "any-admin"],
    queryFn: async () => {
      if (!user) return { hasRole: false, role: null };
      
      // First check for admin role (which exists in the enum)
      const { data: adminData, error: adminError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (adminError) {
        console.error("Error checking admin role:", adminError);
      }

      if (adminData) {
        return { hasRole: true, role: "admin" };
      }

      // Then check for manager role (if enum has been updated)
      const { data: managerData, error: managerError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "manager" as any)
        .maybeSingle();

      // Silently ignore manager enum error if it doesn't exist yet
      if (managerError && !managerError.message?.includes("invalid input value for enum")) {
        console.error("Error checking manager role:", managerError);
      }

      if (managerData) {
        return { hasRole: true, role: "manager" };
      }

      return { hasRole: false, role: null };
    },
    enabled: !!user,
  });

  return { 
    hasAdminRole: hasAdminRole?.hasRole ?? false, 
    role: hasAdminRole?.role || null,
    isAdmin: hasAdminRole?.role === "admin",
    isManager: hasAdminRole?.role === "manager",
    isLoading 
  };
};
