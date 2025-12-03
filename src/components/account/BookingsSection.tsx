import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Euro } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { PaymentProofUpload } from "@/components/PaymentProofUpload";
import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const getStatusColor = (status: string) => {
  switch (status) {
    case "confirmed":
      return "bg-green-500";
    case "pending":
      return "bg-yellow-500";
    case "cancelled":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "confirmed":
      return "Confirmée";
    case "pending":
      return "En attente";
    case "cancelled":
      return "Annulée";
    default:
      return status;
  }
};

const getPaymentStatusLabel = (status: string) => {
  switch (status) {
    case "proof_submitted":
      return "Justificatif envoyé";
    case "received":
      return "Paiement reçu";
    case "pending":
      return "En attente de paiement";
    default:
      return status;
  }
};

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case "proof_submitted":
      return "bg-blue-500";
    case "received":
      return "bg-green-500";
    case "pending":
      return "bg-yellow-500";
    default:
      return "bg-gray-500";
  }
};

export const BookingsSection = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const bookingRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ["bookings", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          properties (
            title,
            location,
            image_url
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Scroll to booking if ID is in URL
  useEffect(() => {
    const bookingId = searchParams.get('booking');
    if (bookingId && bookingRefs.current[bookingId]) {
      setTimeout(() => {
        bookingRefs.current[bookingId]?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 500);
    }
  }, [searchParams, bookings]);

  // Real-time subscription for booking updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('user-bookings-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Booking updated:', payload);
          queryClient.invalidateQueries({ queryKey: ["bookings", user.id] });
          toast.success("Votre réservation a été mise à jour");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mes Réservations</CardTitle>
        <CardDescription>
          Retrouvez toutes vos réservations et leurs détails
        </CardDescription>
      </CardHeader>
      <CardContent>
        {bookingsLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : bookings && bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking: any) => (
              <Card 
                key={booking.id} 
                ref={(el) => bookingRefs.current[booking.id] = el}
                className="overflow-hidden"
              >
                <div className="flex flex-col md:flex-row">
                  {booking.properties?.image_url && (
                    <div className="md:w-48 h-48 md:h-auto">
                      <img 
                        src={booking.properties.image_url} 
                        alt={booking.properties.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg mb-1">
                          {booking.properties?.title}
                        </h3>
                        <div className="flex items-center text-muted-foreground text-sm mb-2">
                          <MapPin className="w-4 h-4 mr-1" />
                          {booking.properties?.location}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <Badge className={getStatusColor(booking.status)}>
                          {getStatusLabel(booking.status)}
                        </Badge>
                        <Badge className={getPaymentStatusColor(booking.payment_status)}>
                          {getPaymentStatusLabel(booking.payment_status)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Arrivée</p>
                          <p className="text-muted-foreground">
                            {format(new Date(booking.check_in_date), "d MMMM yyyy", { locale: fr })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Départ</p>
                          <p className="text-muted-foreground">
                            {format(new Date(booking.check_out_date), "d MMMM yyyy", { locale: fr })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Voyageurs</p>
                          <p className="text-muted-foreground">{booking.guests}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Euro className="w-4 h-4 mr-2 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Total</p>
                          <p className="text-muted-foreground">{booking.total_price}€</p>
                        </div>
                      </div>
                    </div>

                    {booking.status === "pending" && booking.payment_status === "pending" && !booking.payment_proof_url && (
                      <div className="mt-4">
                        <PaymentProofUpload 
                          bookingId={booking.id}
                          onUploadComplete={() => {
                            queryClient.invalidateQueries({ queryKey: ["bookings", user?.id] });
                          }}
                        />
                      </div>
                    )}

                    {booking.payment_status === "proof_submitted" && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="font-medium mb-2 text-blue-900">✅ Justificatif reçu</p>
                        <p className="text-sm text-blue-700">
                          Nous avons bien reçu votre justificatif de paiement. Nous sommes en train de vérifier votre virement et vous recevrez une confirmation sous 24-48h.
                        </p>
                      </div>
                    )}

                    {booking.status === "confirmed" && booking.payment_status === "received" && (
                      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="font-medium mb-2 text-green-900">✅ Réservation confirmée</p>
                        <p className="text-sm text-green-700">
                          Votre paiement a été validé et votre réservation est confirmée. Nous avons hâte de vous accueillir !
                        </p>
                      </div>
                    )}

                    {booking.special_requests && (
                      <div className="mt-4">
                        <p className="text-sm font-medium">Demandes spéciales:</p>
                        <p className="text-sm text-muted-foreground">{booking.special_requests}</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Vous n'avez pas encore de réservations
          </p>
        )}
      </CardContent>
    </Card>
  );
};
