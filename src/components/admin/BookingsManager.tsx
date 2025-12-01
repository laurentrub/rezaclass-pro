import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAnyAdminRole } from "@/hooks/useAnyAdminRole";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Filter, DollarSign, User, Mail, Calendar, MapPin, Users, Euro, FileText, Download, ExternalLink, History } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { useRealtimeBookings } from "@/hooks/useRealtimeBookings";

export const BookingsManager = () => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { isManager } = useAnyAdminRole();

  // Set up realtime subscriptions
  useRealtimeBookings(user?.id, isManager);

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["admin-bookings", user?.id, isManager],
    queryFn: async () => {
      if (!user) return [];
      
      const query = supabase
        .from("bookings")
        .select(`
          *,
          properties!inner(
            title, 
            location,
            managed_by,
            property_owners (
              name,
              commission_rate
            )
          ),
          profiles (full_name, email, phone)
        `) as any;
        
      // Managers can only see bookings for properties they manage
      if (isManager) {
        query.eq("properties.managed_by", user.id);
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const fetchPaymentHistory = async (bookingId: string) => {
    const { data, error } = await supabase
      .from("payment_status_history")
      .select("*")
      .eq("booking_id", bookingId)
      .order("changed_at", { ascending: false });

    if (error) throw error;
    return data;
  };

  // Filter bookings
  const filteredBookings = bookings?.filter((booking: any) => {
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    const matchesPayment = paymentFilter === "all" || booking.payment_status === paymentFilter;
    const matchesSearch = 
      booking.properties?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesPayment && matchesSearch;
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("bookings")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      toast({
        title: "Statut mis à jour",
        description: "Le statut de la réservation a été modifié",
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

  const updatePaymentMutation = useMutation({
    mutationFn: async ({ id, payment_status, admin_commission, owner_payout_amount, admin_notes, booking }: any) => {
      const { error } = await supabase
        .from("bookings")
        .update({ payment_status, admin_commission, owner_payout_amount, admin_notes })
        .eq("id", id);

      if (error) throw error;

      // Send confirmation email if payment is confirmed
      if (payment_status === "received" && booking) {
        try {
          await supabase.functions.invoke("send-payment-confirmation", {
            body: {
              bookingId: booking.id,
              customerEmail: booking.profiles?.email,
              customerName: booking.profiles?.full_name || "Client",
              propertyTitle: booking.properties?.title || "",
              checkInDate: booking.check_in_date,
              checkOutDate: booking.check_out_date,
              totalPrice: booking.total_price,
            },
          });
          console.log("Payment confirmation email sent");
        } catch (emailError) {
          console.error("Error sending confirmation email:", emailError);
          // Don't throw - payment update was successful
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      toast({ title: "Informations de paiement mises à jour" });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const calculatePayoutDetails = (booking: any) => {
    const totalPrice = parseFloat(booking.total_price);
    const commissionRate = booking.properties?.property_owners?.commission_rate || 15;
    const commission = totalPrice * (commissionRate / 100);
    const ownerPayout = totalPrice - commission;
    
    return { commission, ownerPayout, commissionRate };
  };

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
    const labels: Record<string, string> = {
      pending: "En attente",
      proof_submitted: "Justificatif envoyé",
      received: "Reçu",
      transferred_to_owner: "Transféré",
    };
    return labels[status] || status;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Gestion des Réservations</h2>

        <div className="flex gap-4 items-center bg-muted/50 p-4 rounded-lg">
          <Input
            placeholder="Rechercher par propriété, client ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous statuts</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="confirmed">Confirmée</SelectItem>
              <SelectItem value="cancelled">Annulée</SelectItem>
            </SelectContent>
          </Select>
          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="w-40">
              <DollarSign className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous paiements</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="proof_submitted">Justificatif envoyé</SelectItem>
              <SelectItem value="received">Reçu</SelectItem>
              <SelectItem value="transferred_to_owner">Transféré</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredBookings?.map((booking: any) => {
          const payoutDetails = calculatePayoutDetails(booking);
          
          return (
            <Card key={booking.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{booking.properties?.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{booking.properties?.location}</p>
                    {booking.properties?.property_owners && (
                      <div className="flex items-center gap-2 mt-1">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{booking.properties.property_owners.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(booking.status)}>
                      {getStatusLabel(booking.status)}
                    </Badge>
                    <Badge variant="outline">
                      {getPaymentStatusLabel(booking.payment_status)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold">Client</p>
                    <p>{booking.profiles?.full_name}</p>
                    <p className="text-muted-foreground">{booking.profiles?.email}</p>
                    {booking.profiles?.phone && (
                      <p className="text-muted-foreground">{booking.profiles.phone}</p>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">Dates</p>
                    <p>Arrivée: {new Date(booking.check_in_date).toLocaleDateString("fr-FR")}</p>
                    <p>Départ: {new Date(booking.check_out_date).toLocaleDateString("fr-FR")}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Voyageurs</p>
                    <p>{booking.guests} personne(s)</p>
                  </div>
                  <div>
                    <p className="font-semibold">Prix total</p>
                    <p className="text-lg font-bold">{booking.total_price}€</p>
                  </div>
                </div>

                {booking.payment_proof_url && (
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-semibold text-blue-900">Justificatif de paiement reçu</p>
                          <p className="text-sm text-blue-700">Le client a envoyé son justificatif bancaire</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(booking.payment_proof_url, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Voir
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = booking.payment_proof_url;
                            link.download = `justificatif-${booking.id}.pdf`;
                            link.click();
                          }}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Télécharger
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {booking.properties?.property_owners && (
                  <div className="bg-muted/50 p-3 rounded-lg space-y-2 text-sm">
                    <p className="font-semibold">Détails financiers</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <p className="text-muted-foreground">Commission ({payoutDetails.commissionRate}%)</p>
                        <p className="font-bold text-primary">{payoutDetails.commission.toFixed(2)}€</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">À reverser au propriétaire</p>
                        <p className="font-bold">{payoutDetails.ownerPayout.toFixed(2)}€</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Statut paiement</p>
                        <Select
                          value={booking.payment_status}
                          onValueChange={(value) => 
                            updatePaymentMutation.mutate({ 
                              id: booking.id, 
                              payment_status: value,
                              admin_commission: payoutDetails.commission,
                              owner_payout_amount: payoutDetails.ownerPayout,
                              admin_notes: booking.admin_notes,
                              booking: booking
                            })
                          }
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">En attente</SelectItem>
                            <SelectItem value="proof_submitted">Justificatif envoyé</SelectItem>
                            <SelectItem value="received">Reçu</SelectItem>
                            <SelectItem value="transferred_to_owner">Transféré</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {booking.special_requests && (
                  <div>
                    <p className="font-semibold text-sm">Demandes spéciales</p>
                    <p className="text-sm text-muted-foreground">{booking.special_requests}</p>
                  </div>
                )}

                {booking.admin_notes && (
                  <div>
                    <p className="font-semibold text-sm">Notes internes</p>
                    <p className="text-sm text-muted-foreground">{booking.admin_notes}</p>
                  </div>
                )}

                {/* Payment History Section */}
                <Collapsible className="space-y-2">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      <History className="w-4 h-4 mr-2" />
                      Historique des statuts de paiement
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <PaymentHistorySection bookingId={booking.id} fetchPaymentHistory={fetchPaymentHistory} />
                  </CollapsibleContent>
                </Collapsible>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Statut:</span>
                  <Select
                    value={booking.status}
                    onValueChange={(value) => updateStatusMutation.mutate({ id: booking.id, status: value })}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="confirmed">Confirmée</SelectItem>
                      <SelectItem value="cancelled">Annulée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {(!filteredBookings || filteredBookings.length === 0) && !isLoading && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Aucune réservation trouvée
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Payment History Component
const PaymentHistorySection = ({ 
  bookingId, 
  fetchPaymentHistory 
}: { 
  bookingId: string; 
  fetchPaymentHistory: (id: string) => Promise<any[]>; 
}) => {
  const { data: history, isLoading } = useQuery({
    queryKey: ["payment-history", bookingId],
    queryFn: () => fetchPaymentHistory(bookingId),
  });

  if (isLoading) {
    return <div className="text-sm text-muted-foreground p-4">Chargement...</div>;
  }

  if (!history || history.length === 0) {
    return (
      <div className="text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg">
        Aucun historique disponible
      </div>
    );
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "En attente",
      proof_submitted: "Justificatif soumis",
      received: "Reçu",
      transferred_to_owner: "Transféré",
      processing: "En traitement",
      completed: "Terminé",
      failed: "Échoué",
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
      {history.map((entry, index) => (
        <div 
          key={entry.id} 
          className={`flex items-start gap-3 pb-2 ${index !== history.length - 1 ? 'border-b border-border/50' : ''}`}
        >
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              {entry.old_status && (
                <>
                  <Badge variant="outline" className="text-xs">
                    {getStatusLabel(entry.old_status)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">→</span>
                </>
              )}
              <Badge variant="default" className="text-xs">
                {getStatusLabel(entry.new_status)}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              {new Date(entry.changed_at).toLocaleString('fr-FR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
            {entry.notes && (
              <div className="text-xs text-muted-foreground italic">
                {entry.notes}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
