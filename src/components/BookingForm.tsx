import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { differenceInDays, format, isBefore, isSameDay, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import { Minus, Plus, PawPrint, CalendarIcon, ChevronDown, ChevronUp, Zap, Users } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

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
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);
  const [guestsOpen, setGuestsOpen] = useState(false);
  
  // Guest selection state
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [hasPets, setHasPets] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const totalGuests = adults + children;
  const today = startOfDay(new Date());

  const isDateDisabled = (date: Date) => {
    // Disable past dates
    if (isBefore(date, today)) return true;
    // Disable booked dates
    return bookedDates.some(bookedDate => isSameDay(date, bookedDate));
  };

  const handleCheckInSelect = (date: Date | undefined) => {
    if (onDatesChange) {
      // If new check-in is after current check-out, reset check-out
      if (date && checkOut && isBefore(checkOut, date)) {
        onDatesChange(date, undefined);
      } else {
        onDatesChange(date, checkOut);
      }
    } else {
      if (date && internalCheckOut && isBefore(internalCheckOut, date)) {
        setInternalCheckIn(date);
        setInternalCheckOut(undefined);
      } else {
        setInternalCheckIn(date);
      }
    }
    setCheckInOpen(false);
  };

  const handleCheckOutSelect = (date: Date | undefined) => {
    if (onDatesChange) {
      onDatesChange(checkIn, date);
    } else {
      setInternalCheckOut(date);
    }
    setCheckOutOpen(false);
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

  const getGuestSummary = () => {
    const parts = [];
    if (adults > 0) parts.push(`${adults} adulte${adults > 1 ? 's' : ''}`);
    if (children > 0) parts.push(`${children} enfant${children > 1 ? 's' : ''}`);
    if (hasPets) parts.push('animal');
    return parts.join(', ') || `${totalGuests} pers.`;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-baseline">
        <p className="text-2xl font-bold">{pricePerNight}€ <span className="text-base font-normal text-muted-foreground">/ nuit</span></p>
      </div>

      {/* Date Selection */}
      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-2 divide-x">
          {/* Check-in */}
          <Popover open={checkInOpen} onOpenChange={setCheckInOpen}>
            <PopoverTrigger asChild>
              <button className="p-3 text-left hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">Arrivée</p>
                    <p className={cn("text-sm", !checkIn && "text-muted-foreground")}>
                      {checkIn ? format(checkIn, "d MMM yyyy", { locale: fr }) : "Ajouter"}
                    </p>
                  </div>
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkIn}
                onSelect={handleCheckInSelect}
                disabled={isDateDisabled}
                initialFocus
                locale={fr}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          {/* Check-out */}
          <Popover open={checkOutOpen} onOpenChange={setCheckOutOpen}>
            <PopoverTrigger asChild>
              <button className="p-3 text-left hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">Départ</p>
                    <p className={cn("text-sm", !checkOut && "text-muted-foreground")}>
                      {checkOut ? format(checkOut, "d MMM yyyy", { locale: fr }) : "Ajouter"}
                    </p>
                  </div>
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={checkOut}
                onSelect={handleCheckOutSelect}
                disabled={(date) => {
                  if (isDateDisabled(date)) return true;
                  // Check-out must be after check-in
                  if (checkIn && !isBefore(checkIn, date)) return true;
                  return false;
                }}
                initialFocus
                locale={fr}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Guest Selection - Collapsible */}
        <div className="border-t">
          <Popover open={guestsOpen} onOpenChange={setGuestsOpen}>
            <PopoverTrigger asChild>
              <button className="w-full p-3 text-left hover:bg-accent/50 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">Voyageurs</p>
                    <p className="text-sm">{getGuestSummary()}</p>
                  </div>
                </div>
                {guestsOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="start">
              <div className="space-y-4">
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

                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setGuestsOpen(false)}
                >
                  Fermer
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Alert when no dates selected */}
      {(!checkIn || !checkOut) && (
        <p className="text-sm text-muted-foreground text-center py-2">
          Choisissez la période du séjour pour avoir des prix plus précis
        </p>
      )}

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

      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Zap className="h-4 w-4" />
        <span>Cet hôte est réactif</span>
      </div>
    </div>
  );
};
