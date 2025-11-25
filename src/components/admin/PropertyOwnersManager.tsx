import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Mail, Phone } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface PropertyOwner {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  commission_rate: number;
  bank_details: any;
  created_at: string;
}

export const PropertyOwnersManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOwner, setEditingOwner] = useState<PropertyOwner | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: owners, isLoading } = useQuery({
    queryKey: ["property-owners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("property_owners")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PropertyOwner[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("property_owners")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property-owners"] });
      toast({ title: "Propriétaire supprimé avec succès" });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (owner: any) => {
      if (editingOwner) {
        const { error } = await supabase
          .from("property_owners")
          .update(owner)
          .eq("id", editingOwner.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("property_owners")
          .insert([owner]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property-owners"] });
      setIsDialogOpen(false);
      setEditingOwner(null);
      toast({
        title: editingOwner ? "Propriétaire modifié" : "Propriétaire ajouté",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const bankDetails = formData.get("bank_details") as string;
    let parsedBankDetails = null;
    
    if (bankDetails) {
      try {
        parsedBankDetails = JSON.parse(bankDetails);
      } catch {
        parsedBankDetails = { details: bankDetails };
      }
    }

    saveMutation.mutate({
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string || null,
      commission_rate: parseFloat(formData.get("commission_rate") as string),
      bank_details: parsedBankDetails,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des Propriétaires</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingOwner(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un propriétaire
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingOwner ? "Modifier le propriétaire" : "Nouveau propriétaire"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nom complet *</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingOwner?.name}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={editingOwner?.email}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={editingOwner?.phone || ""}
                />
              </div>
              <div>
                <Label htmlFor="commission_rate">Taux de commission (%)</Label>
                <Input
                  id="commission_rate"
                  name="commission_rate"
                  type="number"
                  step="0.01"
                  defaultValue={editingOwner?.commission_rate || 15}
                  required
                />
              </div>
              <div>
                <Label htmlFor="bank_details">Coordonnées bancaires (JSON)</Label>
                <Textarea
                  id="bank_details"
                  name="bank_details"
                  placeholder='{"iban": "FR...", "bic": "..."}'
                  defaultValue={editingOwner?.bank_details ? JSON.stringify(editingOwner.bank_details, null, 2) : ""}
                  className="font-mono text-sm"
                />
              </div>
              <Button type="submit" className="w-full">
                {editingOwner ? "Enregistrer" : "Ajouter"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {owners?.map((owner) => (
          <Card key={owner.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg font-semibold">{owner.name}</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setEditingOwner(owner);
                    setIsDialogOpen(true);
                  }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => {
                    if (confirm("Êtes-vous sûr de vouloir supprimer ce propriétaire ?")) {
                      deleteMutation.mutate(owner.id);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{owner.email}</span>
                </div>
                {owner.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{owner.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="font-medium">Commission:</span>
                  <span className="text-primary font-semibold">{owner.commission_rate}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!owners || owners.length === 0) && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Aucun propriétaire enregistré. Commencez par en ajouter un.
          </CardContent>
        </Card>
      )}
    </div>
  );
};
