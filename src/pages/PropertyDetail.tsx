import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { PropertyGallery } from "@/components/property/PropertyGallery";
import { PropertyMap } from "@/components/property/PropertyMap";
import { AvailabilityCalendar } from "@/components/property/AvailabilityCalendar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  Bed, 
  Bath, 
  Star, 
  MapPin, 
  Wifi, 
  UtensilsCrossed,
  Car,
  Tv,
  WashingMachine,
  ChevronLeft
} from "lucide-react";
import { useState } from "react";

const AMENITY_ICONS: Record<string, any> = {
  "WiFi": Wifi,
  "Cuisine équipée": UtensilsCrossed,
  "Parking gratuit": Car,
  "Télévision": Tv,
  "Lave-linge": WashingMachine,
};

const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedCheckIn, setSelectedCheckIn] = useState<Date>();
  const [selectedCheckOut, setSelectedCheckOut] = useState<Date>();

  const { data: property, isLoading } = useQuery({
    queryKey: ["property", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-[500px] w-full rounded-xl mb-8" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Propriété non trouvée</h1>
          <Button onClick={() => navigate("/")}>Retour à l'accueil</Button>
        </div>
      </div>
    );
  }

  const images = property.images as Array<{ url: string; alt: string }> || [
    { url: property.image_url || "", alt: property.title }
  ];

  const amenities = property.amenities as string[] || [];

  const calculateTotalPrice = () => {
    if (!selectedCheckIn || !selectedCheckOut) return 0;
    const days = Math.ceil(
      (selectedCheckOut.getTime() - selectedCheckIn.getTime()) / (1000 * 60 * 60 * 24)
    );
    return days * Number(property.price_per_night);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ChevronLeft size={20} />
          Retour
        </Button>

        {/* Gallery */}
        <PropertyGallery images={images} title={property.title} />

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8 mt-8">
          {/* Left Column - Property Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title and Quick Info */}
            <div>
              <h1 className="text-4xl font-bold mb-2">{property.title}</h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="fill-yellow-400 text-yellow-400" size={16} />
                  <span className="font-medium text-foreground">{property.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin size={16} />
                  <span>{property.location}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Property Details */}
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Users size={20} />
                <span>{property.max_guests} voyageurs</span>
              </div>
              <div className="flex items-center gap-2">
                <Bed size={20} />
                <span>{property.bedrooms || 1} chambres</span>
              </div>
              <div className="flex items-center gap-2">
                <Bath size={20} />
                <span>{property.bathrooms || 1} salles de bain</span>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h2 className="text-2xl font-bold mb-4">À propos de ce logement</h2>
              <p className="text-muted-foreground leading-relaxed">
                {property.description || 
                  "Ce magnifique logement vous offre tout le confort nécessaire pour passer un séjour inoubliable. Profitez d'un cadre exceptionnel et de prestations de qualité."}
              </p>
            </div>

            <Separator />

            {/* Amenities */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Équipements</h2>
              <div className="grid grid-cols-2 gap-4">
                {amenities.map((amenity, index) => {
                  const Icon = AMENITY_ICONS[amenity] || Wifi;
                  return (
                    <div key={index} className="flex items-center gap-3">
                      <Icon size={20} className="text-muted-foreground" />
                      <span>{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Map */}
            {property.latitude && property.longitude && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Localisation</h2>
                <PropertyMap
                  latitude={Number(property.latitude)}
                  longitude={Number(property.longitude)}
                  title={property.title}
                  address={property.address || property.location}
                />
              </div>
            )}
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:sticky lg:top-24 h-fit">
            <Card className="p-6 space-y-6">
              <div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold">{property.price_per_night}€</span>
                  <span className="text-muted-foreground">/ nuit</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="fill-yellow-400 text-yellow-400" size={14} />
                  <span className="font-medium">{property.rating}</span>
                </div>
              </div>

              <Separator />

              {/* Calendar */}
              <div>
                <h3 className="font-semibold mb-4">Sélectionnez vos dates</h3>
                <AvailabilityCalendar
                  onSelectDates={(checkIn, checkOut) => {
                    setSelectedCheckIn(checkIn);
                    setSelectedCheckOut(checkOut);
                  }}
                />
              </div>

              {/* Total Price */}
              {selectedCheckIn && selectedCheckOut && (
                <div className="space-y-2">
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>{calculateTotalPrice()}€</span>
                  </div>
                </div>
              )}

              <Button 
                size="lg" 
                className="w-full"
                disabled={!selectedCheckIn || !selectedCheckOut}
              >
                Réserver
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Vous ne serez pas débité pour le moment
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-muted mt-16 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold mb-4">À propos</h3>
              <p className="text-muted-foreground">
                Locations de vacances exceptionnelles en France
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Contact</h3>
              <p className="text-muted-foreground">contact@example.com</p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Légal</h3>
              <p className="text-muted-foreground">Mentions légales</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PropertyDetail;
