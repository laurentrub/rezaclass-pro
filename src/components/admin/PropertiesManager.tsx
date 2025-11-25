import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Search, Filter } from "lucide-react";
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

export const PropertiesManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [ownerFilter, setOwnerFilter] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: properties, isLoading } = useQuery({
    queryKey: ["admin-properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select(`
          *,
          property_owners (
            id,
            name,
            email,
            commission_rate
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: owners } = useQuery({
    queryKey: ["property-owners-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("property_owners")
        .select("id, name")
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  // Filter properties
  const filteredProperties = properties?.filter((property) => {
    const matchesSearch = 
      property.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || property.status === statusFilter;
    const matchesOwner = ownerFilter === "all" || property.owner_id === ownerFilter;

    return matchesSearch && matchesStatus && matchesOwner;
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
    
    const ownerId = formData.get("owner_id") as string;
    
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
      owner_id: ownerId === "none" ? null : ownerId,
      status: formData.get("status") as string || "active",
      available_from: formData.get("available_from") as string || null,
      available_until: formData.get("available_until") as string || null,
    };

    saveMutation.mutate(property);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      active: { variant: "default", label: "Actif" },
      inactive: { variant: "secondary", label: "Inactif" },
      maintenance: { variant: "outline", label: "Maintenance" },
    };
    const config = variants[status] || variants.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
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
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Gestion des Propriétés</h2>
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

                  <div className="grid grid-cols-2 gap-4 col-span-2">
                    <div>
                      <Label htmlFor="owner_id">Propriétaire</Label>
                      <Select name="owner_id" defaultValue={editingProperty?.owner_id || "none"}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un propriétaire" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Aucun</SelectItem>
                          {owners?.map((owner) => (
                            <SelectItem key={owner.id} value={owner.id}>
                              {owner.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="status">Statut</Label>
                      <Select name="status" defaultValue={editingProperty?.status || "active"}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Actif</SelectItem>
                          <SelectItem value="inactive">Inactif</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="available_from">Disponible du</Label>
                    <Input
                      id="available_from"
                      name="available_from"
                      type="date"
                      defaultValue={editingProperty?.available_from || ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="available_until">Disponible jusqu'au</Label>
                    <Input
                      id="available_until"
                      name="available_until"
                      type="date"
                      defaultValue={editingProperty?.available_until || ""}
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

        <div className="flex gap-4 items-center bg-muted/50 p-4 rounded-lg">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par titre ou localisation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="active">Actif</SelectItem>
              <SelectItem value="inactive">Inactif</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
          <Select value={ownerFilter} onValueChange={setOwnerFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Tous les propriétaires" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les propriétaires</SelectItem>
              {owners?.map((owner) => (
                <SelectItem key={owner.id} value={owner.id}>
                  {owner.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredProperties?.map((property) => (
          <Card key={property.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div className="space-y-1">
                <CardTitle className="text-lg font-semibold">{property.title}</CardTitle>
                <div className="flex gap-2 items-center">
                  {getStatusBadge(property.status)}
                  {property.property_owners && (
                    <Badge variant="outline" className="text-xs">
                      {property.property_owners.name}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setEditingProperty(property);
                    setIsDialogOpen(true);
                  }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => {
                    if (confirm("Êtes-vous sûr de vouloir supprimer cette propriété ?")) {
                      deleteMutation.mutate(property.id);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <p><strong>Localisation:</strong> {property.location}</p>
                  <p><strong>Prix:</strong> {property.price_per_night}€ / nuit</p>
                  <p><strong>Capacité:</strong> {property.max_guests} personnes</p>
                  {property.bedrooms && <p><strong>Chambres:</strong> {property.bedrooms}</p>}
                </div>
                <div className="space-y-2">
                  {property.available_from && (
                    <p><strong>Disponible du:</strong> {new Date(property.available_from).toLocaleDateString("fr-FR")}</p>
                  )}
                  {property.available_until && (
                    <p><strong>Jusqu'au:</strong> {new Date(property.available_until).toLocaleDateString("fr-FR")}</p>
                  )}
                  {property.property_owners && (
                    <p><strong>Commission:</strong> {property.property_owners.commission_rate}%</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!filteredProperties || filteredProperties.length === 0) && !isLoading && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Aucune propriété trouvée
          </CardContent>
        </Card>
      )}
    </div>
  );
};
