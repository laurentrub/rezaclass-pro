import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAnyAdminRole } from "@/hooks/useAnyAdminRole";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Search, Filter, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { geocodeAddress } from "@/lib/geocoding";
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
  const [addressStreet, setAddressStreet] = useState("");
  const [addressPostalCode, setAddressPostalCode] = useState("");
  const [addressCity, setAddressCity] = useState("");
  const [computedLatitude, setComputedLatitude] = useState<number | null>(null);
  const [computedLongitude, setComputedLongitude] = useState<number | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  
  // Amenities management with categories
  const amenitiesByCategory = {
    "Confort": [
      "WiFi",
      "Climatisation",
      "Chauffage",
      "Télévision",
      "Cheminée",
      "Bureau/Espace de travail",
    ],
    "Cuisine": [
      "Cuisine équipée",
      "Lave-vaisselle",
      "Micro-ondes",
      "Four",
      "Réfrigérateur",
      "Machine à café",
    ],
    "Équipements": [
      "Lave-linge",
      "Sèche-linge",
      "Fer à repasser",
      "Aspirateur",
    ],
    "Extérieur": [
      "Jardin",
      "Terrasse/Balcon",
      "Barbecue",
      "Salon de jardin",
      "Piscine",
      "Parking gratuit",
    ],
    "Sécurité": [
      "Détecteur de fumée",
      "Extincteur",
      "Alarme",
      "Coffre-fort",
    ],
  };
  
  // Flatten all standard amenities for checking
  const allStandardAmenities = Object.values(amenitiesByCategory).flat();
  
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [customAmenities, setCustomAmenities] = useState<string[]>([]);
  const [newAmenityName, setNewAmenityName] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { isManager } = useAnyAdminRole();

  // Reset fields when dialog opens/closes
  useEffect(() => {
    if (isDialogOpen) {
      if (editingProperty) {
        // Parse existing address
        const address = editingProperty.address || "";
        const parts = address.split(", ");
        setAddressStreet(parts[0] || "");
        setAddressPostalCode(parts[1] || "");
        setAddressCity(parts[2] || "");
        setComputedLatitude(editingProperty.latitude);
        setComputedLongitude(editingProperty.longitude);
        
        // Parse existing amenities
        const existingAmenities = editingProperty.amenities || [];
        const standard = existingAmenities.filter((a: string) => allStandardAmenities.includes(a));
        const custom = existingAmenities.filter((a: string) => !allStandardAmenities.includes(a));
        setSelectedAmenities(standard);
        setCustomAmenities(custom);
      } else {
        setAddressStreet("");
        setAddressPostalCode("");
        setAddressCity("");
        setComputedLatitude(null);
        setComputedLongitude(null);
        setSelectedAmenities([]);
        setCustomAmenities([]);
      }
      setNewAmenityName("");
    }
  }, [isDialogOpen, editingProperty]);

  // Auto-geocode when address fields change
  useEffect(() => {
    const geocodeTimeout = setTimeout(async () => {
      if (addressStreet && addressPostalCode && addressCity) {
        setIsGeocoding(true);
        const result = await geocodeAddress({
          street: addressStreet,
          postalCode: addressPostalCode,
          city: addressCity,
        });
        
        if (result) {
          setComputedLatitude(result.latitude);
          setComputedLongitude(result.longitude);
          toast({
            title: "Coordonnées calculées",
            description: `Position géographique trouvée automatiquement`,
          });
        } else {
          toast({
            variant: "destructive",
            title: "Géocodage échoué",
            description: "Impossible de trouver les coordonnées pour cette adresse",
          });
        }
        setIsGeocoding(false);
      }
    }, 1000); // Debounce de 1 seconde

    return () => clearTimeout(geocodeTimeout);
  }, [addressStreet, addressPostalCode, addressCity, toast]);

  const { data: properties, isLoading } = useQuery({
    queryKey: ["admin-properties", user?.id, isManager],
    queryFn: async () => {
      if (!user) return [];
      
      const query = supabase
        .from("properties")
        .select(`
          *,
          property_owners (
            id,
            name,
            email,
            commission_rate
          )
        `) as any;

      // Managers can only see properties they manage
      if (isManager) {
        query.eq("managed_by", user.id);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const { data: owners } = useQuery({
    queryKey: ["property-owners-list", user?.id, isManager],
    queryFn: async () => {
      if (!user) return [];
      
      const query = supabase
        .from("property_owners")
        .select("id, name") as any;

      // Managers can only see owners they created
      if (isManager) {
        query.eq("created_by", user.id);
      }

      const { data, error } = await query.order("name");

      if (error) throw error;
      return data || [];
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const ownerId = formData.get("owner_id") as string;
    
    try {
      // Upload main image
      let mainImageUrl = editingProperty?.image_url || "";
      const mainImageFile = formData.get("main_image") as File;
      if (mainImageFile && mainImageFile.size > 0) {
        const mainImageExt = mainImageFile.name.split('.').pop();
        const mainImagePath = `${crypto.randomUUID()}.${mainImageExt}`;
        const { data: mainImageData, error: mainImageError } = await supabase.storage
          .from('property-images')
          .upload(mainImagePath, mainImageFile);
        
        if (mainImageError) throw mainImageError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(mainImagePath);
        
        mainImageUrl = publicUrl;
      }

      // Upload gallery images
      const galleryFiles = formData.getAll("gallery_images") as File[];
      const uploadedGalleryImages = [];
      
      for (const file of galleryFiles) {
        if (file && file.size > 0) {
          const ext = file.name.split('.').pop();
          const path = `${crypto.randomUUID()}.${ext}`;
          const { data: galleryData, error: galleryError } = await supabase.storage
            .from('property-images')
            .upload(path, file);
          
          if (galleryError) throw galleryError;
          
          const { data: { publicUrl } } = supabase.storage
            .from('property-images')
            .getPublicUrl(path);
          
          uploadedGalleryImages.push({
            url: publicUrl,
            alt: file.name.replace(/\.[^/.]+$/, "") // Use filename without extension as alt
          });
        }
      }

      // Keep existing gallery images if editing and no new images uploaded
      const finalGalleryImages = uploadedGalleryImages.length > 0 
        ? uploadedGalleryImages 
        : editingProperty?.images || [];
      
      // Build full address from components
      const fullAddress = `${addressStreet}, ${addressPostalCode}, ${addressCity}`;
      
      // Combine selected standard amenities and custom amenities
      const allAmenities = [...selectedAmenities, ...customAmenities];

      const property: any = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        location: formData.get("location") as string,
        address: fullAddress,
        price_per_night: parseFloat(formData.get("price_per_night") as string),
        max_guests: parseInt(formData.get("max_guests") as string),
        bedrooms: parseInt(formData.get("bedrooms") as string),
        bathrooms: parseInt(formData.get("bathrooms") as string),
        latitude: computedLatitude,
        longitude: computedLongitude,
        rating: formData.get("rating") ? parseFloat(formData.get("rating") as string) : 4.5,
        image_url: mainImageUrl,
        images: finalGalleryImages.length > 0 ? finalGalleryImages : null,
        amenities: allAmenities,
        owner_id: ownerId === "none" ? null : ownerId,
        status: formData.get("status") as string || "active",
        available_from: formData.get("available_from") as string || null,
        available_until: formData.get("available_until") as string || null,
      };

      // Set managed_by for new properties
      if (!editingProperty && user) {
        property.managed_by = user.id;
      }

      saveMutation.mutate(property);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur d'upload",
        description: error.message,
      });
    }
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

                  <div className="col-span-2">
                    <Label htmlFor="address_street">Adresse : N° et nom de la rue *</Label>
                    <Input
                      id="address_street"
                      name="address_street"
                      value={addressStreet}
                      onChange={(e) => setAddressStreet(e.target.value)}
                      placeholder="ex: 12 Rue de la Paix"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="address_postal_code">Code Postal *</Label>
                    <Input
                      id="address_postal_code"
                      name="address_postal_code"
                      value={addressPostalCode}
                      onChange={(e) => setAddressPostalCode(e.target.value)}
                      placeholder="ex: 75001"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="address_city">Ville *</Label>
                    <Input
                      id="address_city"
                      name="address_city"
                      value={addressCity}
                      onChange={(e) => setAddressCity(e.target.value)}
                      placeholder="ex: Paris"
                      required
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
                    <Label htmlFor="latitude" className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Latitude (auto)
                    </Label>
                    <Input
                      id="latitude"
                      name="latitude"
                      type="number"
                      step="0.000001"
                      value={computedLatitude || ""}
                      readOnly
                      disabled
                      className="bg-muted"
                    />
                  </div>

                  <div>
                    <Label htmlFor="longitude" className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Longitude (auto)
                    </Label>
                    <Input
                      id="longitude"
                      name="longitude"
                      type="number"
                      step="0.000001"
                      value={computedLongitude || ""}
                      readOnly
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  
                  {isGeocoding && (
                    <div className="col-span-2 text-sm text-muted-foreground flex items-center gap-2">
                      <MapPin className="w-4 h-4 animate-pulse" />
                      Calcul des coordonnées en cours...
                    </div>
                  )}

                  <div>
                    <Label htmlFor="rating">Note</Label>
                    <Input
                      id="rating"
                      name="rating"
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      defaultValue={editingProperty?.rating || 4.5}
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="main_image">Image principale</Label>
                    <Input
                      id="main_image"
                      name="main_image"
                      type="file"
                      accept="image/*"
                    />
                    {editingProperty?.image_url && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Image actuelle : {editingProperty.image_url.split('/').pop()}
                      </p>
                    )}
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="gallery_images">Galerie d'images</Label>
                    <Input
                      id="gallery_images"
                      name="gallery_images"
                      type="file"
                      accept="image/*"
                      multiple
                    />
                    {editingProperty?.images && Array.isArray(editingProperty.images) && editingProperty.images.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {editingProperty.images.length} image(s) actuellement
                      </p>
                    )}
                  </div>

                  <div className="col-span-2">
                    <Label className="mb-3 block text-base font-semibold">Équipements</Label>
                    
                    <div className="space-y-6">
                      {/* Standard amenities by category */}
                      {Object.entries(amenitiesByCategory).map(([category, amenities]) => (
                        <div key={category} className="space-y-2">
                          <h4 className="text-sm font-medium text-muted-foreground border-b pb-1">
                            {category}
                          </h4>
                          <div className="grid grid-cols-2 gap-3 pl-2">
                            {amenities.map((amenity) => (
                              <div key={amenity} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`amenity-${amenity}`}
                                  checked={selectedAmenities.includes(amenity)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedAmenities([...selectedAmenities, amenity]);
                                    } else {
                                      setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
                                    }
                                  }}
                                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <Label htmlFor={`amenity-${amenity}`} className="text-sm font-normal cursor-pointer">
                                  {amenity}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      
                      {/* Custom amenities */}
                      {customAmenities.length > 0 && (
                        <div className="space-y-2 pt-2 border-t">
                          <p className="text-sm font-medium text-muted-foreground">Équipements personnalisés</p>
                          <div className="grid grid-cols-2 gap-3">
                            {customAmenities.map((amenity, index) => (
                              <div key={`custom-${index}`} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`custom-amenity-${index}`}
                                  checked={true}
                                  readOnly
                                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <Label htmlFor={`custom-amenity-${index}`} className="text-sm font-normal flex-1">
                                  {amenity}
                                </Label>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => {
                                    setCustomAmenities(customAmenities.filter((_, i) => i !== index));
                                  }}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Add custom amenity */}
                      <div className="flex gap-2 pt-2 border-t">
                        <Input
                          placeholder="Nom du nouvel équipement"
                          value={newAmenityName}
                          onChange={(e) => setNewAmenityName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (newAmenityName.trim()) {
                                setCustomAmenities([...customAmenities, newAmenityName.trim()]);
                                setNewAmenityName("");
                              }
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            if (newAmenityName.trim()) {
                              setCustomAmenities([...customAmenities, newAmenityName.trim()]);
                              setNewAmenityName("");
                            }
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Ajouter
                        </Button>
                      </div>
                    </div>
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
