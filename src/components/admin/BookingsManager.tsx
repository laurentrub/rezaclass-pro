import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter, DollarSign, User, Mail, Calendar, MapPin, Users, Euro } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const BookingsManager = () => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          properties (
            title, 
            location,
            property_owners (
              name,
              commission_rate
            )
          ),
          profiles (full_name, email)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

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
    mutationFn: async ({ id, payment_status, admin_commission, owner_payout_amount, admin_notes }: any) => {
      const { error } = await supabase
        .from("bookings")
        .update({ payment_status, admin_commission, owner_payout_amount, admin_notes })
        .eq("id", id);

      if (error) throw error;
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
                              admin_notes: booking.admin_notes
                            })
                          }
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">En attente</SelectItem>
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
