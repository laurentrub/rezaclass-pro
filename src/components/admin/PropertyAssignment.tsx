import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Home, Shield, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const PropertyAssignment = () => {
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [selectedManager, setSelectedManager] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: properties, isLoading: propertiesLoading } = useQuery({
    queryKey: ["admin-all-properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select(`
          id,
          title,
          location,
          managed_by
        `)
        .order("title");

      if (error) throw error;

      // Fetch manager profiles separately to avoid join issues
      if (data && data.length > 0) {
        const managerIds = data
          .filter(p => p.managed_by)
          .map(p => p.managed_by);

        if (managerIds.length > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, full_name, email")
            .in("id", managerIds);

          // Map profiles to properties
          return data.map(property => ({
            ...property,
            profiles: profiles?.find(p => p.id === property.managed_by)
          }));
        }
      }

      return data;
    },
    enabled: !!user,
  });

  const { data: managers, isLoading: managersLoading } = useQuery({
    queryKey: ["admin-managers-list"],
    queryFn: async () => {
      const { data: userRoles, error } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "manager")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles separately
      if (userRoles && userRoles.length > 0) {
        const userIds = userRoles.map(ur => ur.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", userIds);

        return userRoles.map(ur => ({
          user_id: ur.user_id,
          profiles: profiles?.find(p => p.id === ur.user_id)
        }));
      }

      return userRoles;
    },
    enabled: !!user,
  });

  const assignMutation = useMutation({
    mutationFn: async ({ propertyId, managerId }: { propertyId: string; managerId: string | null }) => {
      const { error } = await supabase
        .from("properties")
        .update({ managed_by: managerId })
        .eq("id", propertyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-properties"] });
      queryClient.invalidateQueries({ queryKey: ["admin-managers"] });
      setSelectedProperty("");
      setSelectedManager("");
      toast({
        title: "Attribution réussie",
        description: "La propriété a été attribuée au gestionnaire",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    },
  });

  const handleAssign = () => {
    if (!selectedProperty) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez sélectionner une propriété",
      });
      return;
    }

    const managerId = selectedManager === "none" ? null : selectedManager;
    assignMutation.mutate({ propertyId: selectedProperty, managerId });
  };

  if (propertiesLoading || managersLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Attribution des Propriétés</h2>
        <p className="text-muted-foreground">
          Attribuez des propriétés à des gestionnaires spécifiques
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attribuer une propriété</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="property">Propriété</Label>
              <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                <SelectTrigger id="property">
                  <SelectValue placeholder="Sélectionner une propriété" />
                </SelectTrigger>
                <SelectContent>
                  {properties?.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.title} - {property.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-center">
              <ArrowRight className="w-6 h-6 text-muted-foreground" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manager">Gestionnaire</Label>
              <Select value={selectedManager} onValueChange={setSelectedManager}>
                <SelectTrigger id="manager">
                  <SelectValue placeholder="Sélectionner un gestionnaire" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun gestionnaire</SelectItem>
                  {managers?.map((manager: any) => (
                    <SelectItem key={manager.user_id} value={manager.user_id}>
                      {manager.profiles?.full_name || manager.profiles?.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleAssign} 
            disabled={!selectedProperty || assignMutation.isPending}
            className="w-full"
          >
            {assignMutation.isPending ? "Attribution..." : "Attribuer"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Propriétés et leurs gestionnaires</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Propriété</TableHead>
                <TableHead>Localisation</TableHead>
                <TableHead>Gestionnaire</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties?.map((property: any) => (
                <TableRow key={property.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4 text-primary" />
                      {property.title}
                    </div>
                  </TableCell>
                  <TableCell>{property.location}</TableCell>
                  <TableCell>
                    {property.managed_by ? (
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary" />
                        <span className="text-sm">
                          {property.profiles?.full_name || property.profiles?.email || "Gestionnaire"}
                        </span>
                      </div>
                    ) : (
                      <Badge variant="outline">Non attribué</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
