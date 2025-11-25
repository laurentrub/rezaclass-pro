import { useAuth } from "@/hooks/useAuth";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Euro } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const profileSchema = z.object({
  full_name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(100, "Le nom ne peut pas dépasser 100 caractères"),
  email: z.string().email("Email invalide").max(255, "L'email ne peut pas dépasser 255 caractères"),
  phone: z.string().min(10, "Le téléphone doit contenir au moins 10 caractères").max(20, "Le téléphone ne peut pas dépasser 20 caractères").optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const Account = () => {
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

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

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: {
      full_name: profile?.full_name || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      if (!user) throw new Error("Non authentifié");
      
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: values.full_name,
          email: values.email,
          phone: values.phone || null,
        })
        .eq("id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      toast.success("Profil mis à jour avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour du profil");
      console.error(error);
    },
  });

  const onSubmit = (values: ProfileFormValues) => {
    updateProfileMutation.mutate(values);
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <section className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Mon Compte</h1>
              <p className="text-muted-foreground">
                Gérez vos réservations et informations personnelles
              </p>
            </div>
            <Button variant="outline" onClick={signOut}>
              Se déconnecter
            </Button>
          </div>

          {/* Profile Information */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
              <CardDescription>
                Modifiez vos informations personnelles
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profileLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom complet</FormLabel>
                          <FormControl>
                            <Input placeholder="Votre nom" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="votre@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Téléphone</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="06 12 34 56 78" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={updateProfileMutation.isPending}>
                      {updateProfileMutation.isPending ? "Mise à jour..." : "Mettre à jour"}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>

          {/* Bookings */}
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
                    <Card key={booking.id} className="overflow-hidden">
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
                            <Badge className={getStatusColor(booking.status)}>
                              {getStatusLabel(booking.status)}
                            </Badge>
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

                          {booking.status === "pending" && (
                            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                              <p className="font-medium mb-2 text-blue-900">Confirmation en cours</p>
                              <p className="text-sm text-blue-700">
                                Un email contenant les instructions de paiement vous a été envoyé à votre adresse email. 
                                Veuillez consulter votre boîte de réception pour finaliser votre réservation.
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
        </div>
      </section>
    </div>
  );
};

export default Account;
