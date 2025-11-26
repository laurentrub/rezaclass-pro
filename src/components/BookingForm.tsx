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

interface BookingFormProps {
  propertyId: string;
  pricePerNight: number;
  maxGuests: number;
  bookedDates: Date[];
  cleaningFee?: number;
  serviceFee?: number;
}

export const BookingForm = ({ 
  propertyId, 
  pricePerNight, 
  maxGuests, 
  bookedDates,
  cleaningFee = 0,
  serviceFee = 0
}: BookingFormProps) => {
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [specialRequests, setSpecialRequests] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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
      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          user_id: user.id,
          property_id: propertyId,
          check_in_date: checkIn.toISOString().split('T')[0],
          check_out_date: checkOut.toISOString().split('T')[0],
          guests: maxGuests,
          total_price: calculatePrices().totalPrice,
          status: "pending",
          special_requests: specialRequests || null,
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
        onSelectDates={(checkInDate, checkOutDate) => {
          setCheckIn(checkInDate);
          setCheckOut(checkOutDate);
        }}
      />

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
