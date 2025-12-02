import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AvailabilityCalendar } from "./property/AvailabilityCalendar";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { differenceInDays } from "date-fns";
import { Minus, Plus, PawPrint } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface BookingFormProps {
  propertyId: string;
  pricePerNight: number;
  maxGuests: number;
  bookedDates: Date[];
  cleaningFee?: number;
  serviceFee?: number;
  petsAllowed?: boolean;
  // Controlled dates from parent
  selectedCheckIn?: Date;
  selectedCheckOut?: Date;
  onDatesChange?: (checkIn: Date | undefined, checkOut: Date | undefined) => void;
}

export const BookingForm = ({ 
  propertyId, 
  pricePerNight, 
  maxGuests, 
  bookedDates,
  cleaningFee = 0,
  serviceFee = 0,
  petsAllowed = false,
  selectedCheckIn,
  selectedCheckOut,
  onDatesChange
}: BookingFormProps) => {
  // Use controlled dates if provided, otherwise use internal state
  const [internalCheckIn, setInternalCheckIn] = useState<Date>();
  const [internalCheckOut, setInternalCheckOut] = useState<Date>();
  
  const checkIn = selectedCheckIn !== undefined ? selectedCheckIn : internalCheckIn;
  const checkOut = selectedCheckOut !== undefined ? selectedCheckOut : internalCheckOut;
  
  const [specialRequests, setSpecialRequests] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Guest selection state
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [hasPets, setHasPets] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const totalGuests = adults + children;

  const handleDateSelection = (newCheckIn: Date | undefined, newCheckOut: Date | undefined) => {
    if (onDatesChange) {
      onDatesChange(newCheckIn, newCheckOut);
    } else {
      setInternalCheckIn(newCheckIn);
      setInternalCheckOut(newCheckOut);
    }
  };

  const incrementAdults = () => {
    if (totalGuests < maxGuests) {
      setAdults(prev => prev + 1);
    }
  };

  const decrementAdults = () => {
    if (adults > 1) {
      setAdults(prev => prev - 1);
    }
  };

  const incrementChildren = () => {
    if (totalGuests < maxGuests) {
      setChildren(prev => prev + 1);
    }
  };

  const decrementChildren = () => {
    if (children > 0) {
      setChildren(prev => prev - 1);
    }
  };

  const calculatePrices = () => {
    if (!checkIn || !checkOut) {
      return { nights: 0, nightsPrice: 0, totalPrice: 0 };
    }
    const nights = differenceInDays(checkOut, checkIn);
    const nightsPrice = nights * pricePerNight;
    const totalPrice = nightsPrice + cleaningFee + serviceFee;
    return { nights, nightsPrice, totalPrice };
  };

  const handleBooking = async () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour réserver",
      });
      navigate("/auth");
      return;
    }

    if (!checkIn || !checkOut) {
      toast({
        variant: "destructive",
        title: "Dates manquantes",
        description: "Veuillez sélectionner des dates d'arrivée et de départ",
      });
      return;
    }

    setLoading(true);

    try {
      // Build special requests with pet info if applicable
      let fullSpecialRequests = specialRequests;
      if (hasPets && petsAllowed) {
        fullSpecialRequests = fullSpecialRequests 
          ? `${fullSpecialRequests}\n\nAnimal de compagnie: Oui`
          : "Animal de compagnie: Oui";
      }

      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          user_id: user.id,
          property_id: propertyId,
          check_in_date: checkIn.toISOString().split('T')[0],
          check_out_date: checkOut.toISOString().split('T')[0],
          guests: totalGuests,
          total_price: calculatePrices().totalPrice,
          status: "pending",
          special_requests: fullSpecialRequests || null,
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Send confirmation email
      const { error: emailError } = await supabase.functions.invoke("send-booking-confirmation", {
        body: {
          bookingId: booking.id,
          userEmail: user.email,
        },
      });

      if (emailError) {
        console.error("Error sending email:", emailError);
        // Don't throw - booking was created successfully
      }

      toast({
        title: "Réservation créée !",
        description: "Vous allez recevoir un email avec les informations de paiement.",
      });

      navigate("/account");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la réservation",
      });
    } finally {
      setLoading(false);
    }
  };

  const { nights, nightsPrice, totalPrice } = calculatePrices();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-baseline">
        <p className="text-2xl font-bold">{pricePerNight}€ <span className="text-base font-normal text-muted-foreground">/ nuit</span></p>
      </div>

      <AvailabilityCalendar
        bookedDates={bookedDates}
        selectedCheckIn={checkIn}
        selectedCheckOut={checkOut}
        onSelectDates={handleDateSelection}
      />

      {/* Guest Selection */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">Voyageurs</Label>
        
        {/* Adults */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Adultes</p>
            <p className="text-sm text-muted-foreground">13 ans et plus</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={decrementAdults}
              disabled={adults <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center font-medium">{adults}</span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={incrementAdults}
              disabled={totalGuests >= maxGuests}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Children */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Enfants</p>
            <p className="text-sm text-muted-foreground">2-12 ans</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={decrementChildren}
              disabled={children <= 0}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center font-medium">{children}</span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={incrementChildren}
              disabled={totalGuests >= maxGuests}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Maximum {maxGuests} voyageurs
        </p>

        {/* Pets */}
        {petsAllowed && (
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <PawPrint className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Animal de compagnie</p>
                <p className="text-sm text-muted-foreground">Animaux acceptés</p>
              </div>
            </div>
            <Switch
              checked={hasPets}
              onCheckedChange={setHasPets}
            />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="special-requests">Demandes spéciales (optionnel)</Label>
        <Textarea
          id="special-requests"
          placeholder="Ex: Arrivée tardive, lit bébé..."
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
          rows={3}
        />
      </div>

      {checkIn && checkOut && (
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>{pricePerNight}€ × {nights} nuits</span>
            <span>{nightsPrice}€</span>
          </div>
          {cleaningFee > 0 && (
            <div className="flex justify-between text-sm">
              <span>Frais de ménage</span>
              <span>{cleaningFee}€</span>
            </div>
          )}
          {serviceFee > 0 && (
            <div className="flex justify-between text-sm">
              <span>Frais de service</span>
              <span>{serviceFee}€</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Total</span>
            <span>{totalPrice}€</span>
          </div>
        </div>
      )}

      <Button 
        onClick={handleBooking}
        disabled={!checkIn || !checkOut || loading}
        className="w-full"
        size="lg"
      >
        {loading ? "Réservation en cours..." : "Réserver"}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Le paiement se fait par virement bancaire. Vous recevrez les coordonnées bancaires par email.
      </p>
    </div>
  );
};
