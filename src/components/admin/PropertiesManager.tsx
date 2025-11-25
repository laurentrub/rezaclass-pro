import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

export const PropertiesManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: properties, isLoading } = useQuery({
    queryKey: ["admin-properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("properties")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
      toast({
        title: "Propriété supprimée",
        description: "La propriété a été supprimée avec succès",
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

  const saveMutation = useMutation({
    mutationFn: async (property: any) => {
      if (editingProperty) {
        const { error } = await supabase
          .from("properties")
          .update(property)
          .eq("id", editingProperty.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("properties")
          .insert(property);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
      setIsDialogOpen(false);
      setEditingProperty(null);
      toast({
        title: editingProperty ? "Propriété modifiée" : "Propriété créée",
        description: `La propriété a été ${editingProperty ? "modifiée" : "créée"} avec succès`,
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const property = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      location: formData.get("location") as string,
      address: formData.get("address") as string,
      price_per_night: parseFloat(formData.get("price_per_night") as string),
      max_guests: parseInt(formData.get("max_guests") as string),
      bedrooms: parseInt(formData.get("bedrooms") as string),
      bathrooms: parseInt(formData.get("bathrooms") as string),
      latitude: formData.get("latitude") ? parseFloat(formData.get("latitude") as string) : null,
      longitude: formData.get("longitude") ? parseFloat(formData.get("longitude") as string) : null,
      image_url: formData.get("image_url") as string,
      amenities: formData.get("amenities") 
        ? (formData.get("amenities") as string).split(",").map(a => a.trim())
        : [],
    };

    saveMutation.mutate(property);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Propriétés ({properties?.length || 0})</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingProperty(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Propriété
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProperty ? "Modifier la propriété" : "Nouvelle propriété"}
              </DialogTitle>
              <DialogDescription>
                Remplissez les informations de la propriété
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="title">Titre *</Label>
                  <Input
                    id="title"
                    name="title"
                    defaultValue={editingProperty?.title}
                    required
                  />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={editingProperty?.description}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="location">Localisation *</Label>
                  <Input
                    id="location"
                    name="location"
                    defaultValue={editingProperty?.location}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    name="address"
                    defaultValue={editingProperty?.address}
                  />
                </div>

                <div>
                  <Label htmlFor="price_per_night">Prix/nuit (€) *</Label>
                  <Input
                    id="price_per_night"
                    name="price_per_night"
                    type="number"
                    step="0.01"
                    defaultValue={editingProperty?.price_per_night}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="max_guests">Voyageurs max *</Label>
                  <Input
                    id="max_guests"
                    name="max_guests"
                    type="number"
                    defaultValue={editingProperty?.max_guests}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="bedrooms">Chambres</Label>
                  <Input
                    id="bedrooms"
                    name="bedrooms"
                    type="number"
                    defaultValue={editingProperty?.bedrooms || 1}
                  />
                </div>

                <div>
                  <Label htmlFor="bathrooms">Salles de bain</Label>
                  <Input
                    id="bathrooms"
                    name="bathrooms"
                    type="number"
                    defaultValue={editingProperty?.bathrooms || 1}
                  />
                </div>

                <div>
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    name="latitude"
                    type="number"
                    step="0.000001"
                    defaultValue={editingProperty?.latitude}
                  />
                </div>

                <div>
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    name="longitude"
                    type="number"
                    step="0.000001"
                    defaultValue={editingProperty?.longitude}
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="image_url">URL de l'image</Label>
                  <Input
                    id="image_url"
                    name="image_url"
                    type="url"
                    defaultValue={editingProperty?.image_url}
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="amenities">Équipements (séparés par des virgules)</Label>
                  <Input
                    id="amenities"
                    name="amenities"
                    defaultValue={editingProperty?.amenities?.join(", ")}
                    placeholder="WiFi, Cuisine équipée, Parking"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingProperty(null);
                  }}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {properties?.map((property) => (
          <Card key={property.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{property.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {property.location} - {property.price_per_night}€/nuit
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingProperty(property);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (confirm("Êtes-vous sûr de vouloir supprimer cette propriété ?")) {
                        deleteMutation.mutate(property.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Voyageurs:</span> {property.max_guests}
                </div>
                <div>
                  <span className="font-medium">Chambres:</span> {property.bedrooms}
                </div>
                <div>
                  <span className="font-medium">Salles de bain:</span> {property.bathrooms}
                </div>
                <div>
                  <span className="font-medium">Équipements:</span> {(property.amenities as string[] || []).length}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
