import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PropertyNavigation } from "@/components/property/PropertyNavigation";
import { PropertyGallery } from "@/components/property/PropertyGallery";
import { PropertyMap } from "@/components/property/PropertyMap";
import { PropertyBreadcrumb } from "@/components/property/PropertyBreadcrumb";
import { PropertyActions } from "@/components/property/PropertyActions";
import { PropertyHighlights } from "@/components/property/PropertyHighlights";
import { PropertyTabNavigation } from "@/components/property/PropertyTabNavigation";
import { HouseRules } from "@/components/property/HouseRules";
import { PropertyReviews } from "@/components/property/PropertyReviews";
import { SimilarProperties } from "@/components/property/SimilarProperties";
import { MobileBookingBar } from "@/components/property/MobileBookingBar";
import { BookingForm } from "@/components/BookingForm";
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

  // Fetch existing bookings to show booked dates
  const { data: bookings } = useQuery({
    queryKey: ["bookings", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("check_in_date, check_out_date")
        .eq("property_id", id)
        .in("status", ["pending", "confirmed"]);

      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  // Fetch blocked periods
  const { data: blockedPeriods } = useQuery({
    queryKey: ["blocked_periods", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blocked_periods")
        .select("start_date, end_date")
        .eq("property_id", id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  // Convert bookings to booked dates array
  const bookedDates: Date[] = [];
  bookings?.forEach((booking) => {
    const start = new Date(booking.check_in_date);
    const end = new Date(booking.check_out_date);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      bookedDates.push(new Date(d));
    }
  });

  // Convert blocked periods to blocked dates array
  const blockedDates: Date[] = [];
  blockedPeriods?.forEach((period) => {
    const start = new Date(period.start_date);
    const end = new Date(period.end_date);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      blockedDates.push(new Date(d));
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <PropertyNavigation />
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
        <PropertyNavigation />
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

  const scrollToBooking = () => {
    const bookingElement = document.getElementById("booking-form");
    bookingElement?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <PropertyNavigation />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <PropertyBreadcrumb location={property.location} title={property.title} />

        {/* Gallery with Actions */}
        <div className="relative">
          <PropertyGallery images={images} title={property.title} />
          <PropertyActions propertyId={property.id} title={property.title} />
        </div>

        {/* Tab Navigation */}
        <PropertyTabNavigation />

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8 mt-8">
          {/* Left Column - Property Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title and Quick Info */}
            <div id="overview">
              <h1 className="text-4xl font-bold mb-2">{property.title}</h1>
              <div className="flex items-center gap-4 text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Star className="fill-yellow-400 text-yellow-400" size={16} />
                  <span className="font-medium text-foreground">{property.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin size={16} />
                  <span>{property.location}</span>
                </div>
              </div>
              
              {/* Property Details */}
              <div className="flex gap-6 mb-4">
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

              {/* Highlights */}
              <PropertyHighlights amenities={amenities} />
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

            {/* House Rules */}
            <HouseRules
              checkInTime={property.check_in_time || "16:00"}
              checkOutTime={property.check_out_time || "10:00"}
              petsAllowed={property.pets_allowed || false}
              smokingAllowed={property.smoking_allowed || false}
              maxGuests={property.max_guests}
            />

            <Separator />

            {/* Amenities */}
            <div id="amenities">
              <h2 className="text-2xl font-bold mb-4">Tous les équipements</h2>
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

            {/* Availability Calendar */}
            <div id="availability">
              <h2 className="text-2xl font-bold mb-4">Calendrier de disponibilité</h2>
              <p className="text-muted-foreground mb-4">
                Consultez les dates disponibles pour votre séjour. Les dates réservées et bloquées ne peuvent pas être sélectionnées.
              </p>
              <AvailabilityCalendar
                bookedDates={bookedDates}
                blockedDates={blockedDates}
              />
            </div>

            <Separator />

            {/* Map/Location Section - Always display with ID for tab navigation */}
            <div id="location">
              <h2 className="text-2xl font-bold mb-4">Localisation</h2>
              {property.latitude && property.longitude ? (
                <PropertyMap
                  latitude={Number(property.latitude)}
                  longitude={Number(property.longitude)}
                  title={property.title}
                  address={property.address || property.location}
                />
              ) : (
                <div className="p-8 bg-muted rounded-lg text-center">
                  <p className="text-muted-foreground">
                    <strong>{property.location}</strong>
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Les coordonnées GPS détaillées ne sont pas disponibles pour cette propriété.
                  </p>
                </div>
              )}
            </div>

            <Separator />

            {/* Reviews */}
            <div id="reviews">
              <PropertyReviews propertyId={property.id} />
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:sticky lg:top-24 h-fit">
            <Card className="p-6" id="booking-form">
              <BookingForm 
                propertyId={property.id}
                pricePerNight={Number(property.price_per_night)}
                maxGuests={property.max_guests}
                bookedDates={[...bookedDates, ...blockedDates]}
                cleaningFee={Number(property.cleaning_fee) || 0}
                serviceFee={Number(property.service_fee) || 0}
              />
            </Card>
          </div>
        </div>

        {/* Similar Properties */}
        <SimilarProperties
          currentPropertyId={property.id}
          location={property.location}
          pricePerNight={Number(property.price_per_night)}
        />
      </div>

      {/* Mobile Booking Bar */}
      <MobileBookingBar
        pricePerNight={Number(property.price_per_night)}
        onBookClick={scrollToBooking}
      />

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
