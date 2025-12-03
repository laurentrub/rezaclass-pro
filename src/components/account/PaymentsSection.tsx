import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Euro, Clock, CheckCircle, AlertCircle, FileText, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { PaymentProofUpload } from "@/components/PaymentProofUpload";
import { Button } from "@/components/ui/button";

const getPaymentStatusLabel = (status: string) => {
  switch (status) {
    case "proof_submitted":
      return "Justificatif envoyé";
    case "received":
      return "Paiement confirmé";
    case "transferred_to_owner":
      return "Transféré au propriétaire";
    case "pending":
      return "En attente";
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
    case "transferred_to_owner":
      return "bg-purple-500";
    case "pending":
      return "bg-yellow-500";
    default:
      return "bg-gray-500";
  }
};

const getPaymentIcon = (status: string) => {
  switch (status) {
    case "proof_submitted":
      return <Clock className="h-5 w-5 text-blue-500" />;
    case "received":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "transferred_to_owner":
      return <CheckCircle className="h-5 w-5 text-purple-500" />;
    case "pending":
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    default:
      return <Clock className="h-5 w-5 text-gray-500" />;
  }
};

export const PaymentsSection = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["bookings", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          properties (
            title,
            location
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mes Paiements</CardTitle>
        <CardDescription>
          Suivez l'état de vos paiements et envoyez vos justificatifs
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : bookings && bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking: any) => (
              <Card key={booking.id} className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {getPaymentIcon(booking.payment_status)}
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">
                        {booking.properties?.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(booking.check_in_date), "d MMM", { locale: fr })} - {format(new Date(booking.check_out_date), "d MMM yyyy", { locale: fr })}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getPaymentStatusColor(booking.payment_status)}>
                          {getPaymentStatusLabel(booking.payment_status)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1 text-lg font-bold text-foreground">
                      <Euro className="h-4 w-4" />
                      {booking.total_price}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Réservé le {format(new Date(booking.created_at), "d MMM yyyy", { locale: fr })}
                    </p>
                  </div>
                </div>

                {/* Actions selon le statut */}
                {booking.payment_status === "pending" && !booking.payment_proof_url && (
                  <div className="mt-4 pt-4 border-t">
                    <PaymentProofUpload 
                      bookingId={booking.id}
                      onUploadComplete={() => {
                        queryClient.invalidateQueries({ queryKey: ["bookings", user?.id] });
                      }}
                    />
                  </div>
                )}

                {booking.payment_proof_url && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span>Justificatif envoyé</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(booking.payment_proof_url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Voir
                      </Button>
                    </div>
                  </div>
                )}

                {booking.payment_status === "proof_submitted" && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Votre justificatif est en cours de vérification. Vous recevrez une confirmation sous 24-48h.
                    </p>
                  </div>
                )}

                {booking.payment_status === "received" && (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-sm text-green-700 dark:text-green-300">
                      ✓ Paiement confirmé - Votre réservation est validée
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Aucun paiement à afficher
          </p>
        )}
      </CardContent>
    </Card>
  );
};
