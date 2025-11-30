import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Mail, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const ManagersManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: managers, isLoading } = useQuery({
    queryKey: ["admin-managers"],
    queryFn: async () => {
      const { data: userRoles, error } = await supabase
        .from("user_roles")
        .select(`
          user_id,
          role,
          created_at,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .eq("role", "manager")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get property counts for each manager
      const managersWithCounts = await Promise.all(
        (userRoles || []).map(async (manager: any) => {
          const { count } = await supabase
            .from("properties")
            .select("*", { count: "exact", head: true })
            .eq("managed_by", manager.user_id);

          return {
            ...manager,
            propertyCount: count || 0,
          };
        })
      );

      return managersWithCounts;
    },
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", "manager");

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-managers"] });
      toast({
        title: "Gestionnaire supprimé",
        description: "Le rôle de gestionnaire a été retiré avec succès",
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

  const createMutation = useMutation({
    mutationFn: async ({ email, password, fullName }: { email: string; password: string; fullName: string }) => {
      // Call the Edge Function to create the manager
      const { data, error } = await supabase.functions.invoke('create-manager', {
        body: { email, password, fullName }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Échec de la création du gestionnaire");

      return data.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-managers"] });
      setIsDialogOpen(false);
      toast({
        title: "Gestionnaire créé",
        description: "Le nouveau gestionnaire a été créé avec succès",
      });
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Une erreur s'est produite lors de la création du gestionnaire";
      toast({
        variant: "destructive",
        title: "Erreur de création",
        description: errorMessage,
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("full_name") as string;

    createMutation.mutate({ email, password, fullName });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Gestionnaires</h2>
          <p className="text-muted-foreground">
            Créez et gérez les comptes gestionnaires
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Gestionnaire
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un nouveau gestionnaire</DialogTitle>
              <DialogDescription>
                Créez un compte utilisateur avec le rôle de gestionnaire
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="full_name">Nom complet *</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  type="text"
                  required
                  placeholder="Jean Dupont"
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="jean.dupont@example.com"
                />
              </div>

              <div>
                <Label htmlFor="password">Mot de passe *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="Minimum 6 caractères"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Création..." : "Créer"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {managers && managers.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Aucun gestionnaire créé pour le moment
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Liste des gestionnaires</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Propriétés gérées</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {managers?.map((manager: any) => (
                  <TableRow key={manager.user_id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary" />
                        {manager.profiles?.full_name || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        {manager.profiles?.email || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {manager.propertyCount} {manager.propertyCount > 1 ? "propriétés" : "propriété"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(manager.created_at).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm("Êtes-vous sûr de vouloir retirer le rôle de gestionnaire à cet utilisateur ?")) {
                            deleteMutation.mutate(manager.user_id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
