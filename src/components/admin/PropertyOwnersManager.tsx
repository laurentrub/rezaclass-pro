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
    
    const accountHolder = formData.get("account_holder") as string;
    const iban = formData.get("iban") as string;
    const bic = formData.get("bic") as string;
    
    let bankDetails = null;
    if (accountHolder || iban || bic) {
      bankDetails = {
        account_holder: accountHolder || "",
        iban: iban || "",
        bic: bic || "",
      };
    }

    saveMutation.mutate({
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string || null,
      commission_rate: parseFloat(formData.get("commission_rate") as string),
      bank_details: bankDetails,
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
              
              <div className="space-y-3 border-t pt-4">
                <h3 className="font-semibold text-sm">Coordonnées bancaires (RIB)</h3>
                
                <div>
                  <Label htmlFor="account_holder">Titulaire du compte</Label>
                  <Input
                    id="account_holder"
                    name="account_holder"
                    placeholder="Nom du titulaire"
                    defaultValue={editingOwner?.bank_details?.account_holder || ""}
                  />
                </div>
                
                <div>
                  <Label htmlFor="iban">IBAN</Label>
                  <Input
                    id="iban"
                    name="iban"
                    placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
                    defaultValue={editingOwner?.bank_details?.iban || ""}
                    className="font-mono"
                  />
                </div>
                
                <div>
                  <Label htmlFor="bic">BIC / SWIFT</Label>
                  <Input
                    id="bic"
                    name="bic"
                    placeholder="BNPAFRPPXXX"
                    defaultValue={editingOwner?.bank_details?.bic || ""}
                    className="font-mono"
                  />
                </div>
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
                {owner.bank_details && (
                  <div className="mt-3 pt-3 border-t space-y-1">
                    <p className="font-medium text-xs text-muted-foreground uppercase">RIB</p>
                    {owner.bank_details.account_holder && (
                      <div className="text-xs">
                        <span className="font-medium">Titulaire: </span>
                        <span>{owner.bank_details.account_holder}</span>
                      </div>
                    )}
                    {owner.bank_details.iban && (
                      <div className="text-xs font-mono">
                        <span className="font-medium">IBAN: </span>
                        <span>{owner.bank_details.iban}</span>
                      </div>
                    )}
                    {owner.bank_details.bic && (
                      <div className="text-xs font-mono">
                        <span className="font-medium">BIC: </span>
                        <span>{owner.bank_details.bic}</span>
                      </div>
                    )}
                  </div>
                )}
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
